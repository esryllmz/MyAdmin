using Api.Core.Exceptions;
using Api.Core.Helpers;
using Api.Core.Repositories;
using Api.Core.Responses;
using Api.Core.Security;
using Api.Features.Activities;
using Api.Features.Authentication;
using Api.Features.Roles;
using Api.Features.Teams;
using Api.Features.UserRoles;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Linq.Expressions;

namespace Api.Features.Users;

public class UserService(
  IUserRepository _userRepository,
  IRoleRepository _roleRepository,
  ITeamMemberRepository _teamMemberRepository,
  UserMapper _mapper,
  UserBusinessRules _businessRules,
  IActivityService _activityService,
  IPasswordService<User> _passwordService,
  IRefreshTokenService _refreshTokenService,
  IUnitOfWork _unitOfWork,
  IValidator<UpdateUserRequest> _updateValidator,
  IValidator<ChangePasswordRequest> _changePasswordValidator,
  IValidator<CreateViewerAccountRequest> _createViewerValidator,
  ILogger<UserService> _logger) : IUserService
{
  private static readonly Func<IQueryable<User>, IQueryable<User>> IncludeRoles =
    q => q.Include(u => u.UserRoles).ThenInclude(ur => ur.Role);

  public async Task<ReturnModel<PagedResult<UserResponseDto>>> GetManageableViewersAsync(
    ManageableUsersQuery query,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Listing manageable Viewer accounts. Search: {Search}", query.Search);

    var page = Math.Max(1, query.Page);
    var pageSize = Math.Clamp(query.PageSize, 1, 100);
    var search = query.Search?.Trim();

    HashSet<Guid>? teamMemberUserIds = null;
    if (query.TeamId != null)
    {
      var members = await _teamMemberRepository.GetAllAsync(
        filter: tm => tm.TeamId == query.TeamId && tm.IsActive,
        cancellationToken: cancellationToken);
      teamMemberUserIds = members.Select(m => m.UserId).ToHashSet();
    }

    var all = await _userRepository.GetAllAsync(
      filter: u =>
        u.UserRoles.Any(ur => ur.Role.Name == "Viewer") &&
        (string.IsNullOrEmpty(search) || u.Username.Contains(search) || u.Email.Contains(search)) &&
        (query.IsActive == null || u.IsActive == query.IsActive) &&
        (teamMemberUserIds == null || teamMemberUserIds.Contains(u.Id)),
      include: IncludeRoles,
      orderBy: q => query.Sort switch
      {
        "username" => q.OrderBy(u => u.Username),
        "oldest" => q.OrderBy(u => u.CreatedDate),
        _ => q.OrderByDescending(u => u.CreatedDate),
      },
      cancellationToken: cancellationToken);

    var totalCount = all.Count;
    var pageItems = all.Skip((page - 1) * pageSize).Take(pageSize).ToList();

    return new ReturnModel<PagedResult<UserResponseDto>>
    {
      Success = true,
      Message = "Manageable Viewer accounts retrieved successfully.",
      StatusCode = 200,
      Data = new PagedResult<UserResponseDto>
      {
        Items = _mapper.EntityToResponseDtoList(pageItems),
        TotalCount = totalCount,
        Page = page,
        PageSize = pageSize,
      },
    };
  }

  public async Task<ReturnModel<CreatedUserResponseDto>> CreateViewerAccountAsync(
    CreateViewerAccountRequest request,
    Guid createdByUserId,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Creating a new Viewer account. Username: {Username}, CreatedBy: {CreatedByUserId}", request.Username, createdByUserId);

    var validationResult = await _createViewerValidator.ValidateAsync(request, cancellationToken);
    if (!validationResult.IsValid)
    {
      throw new ValidationException(validationResult.Errors);
    }

    await _businessRules.EmailMustBeUniqueAsync(request.Email, id: null, cancellationToken);
    await _businessRules.UsernameMustBeUniqueAsync(request.Username, id: null, cancellationToken);

    var viewerRole = await _roleRepository.GetAsync(r => r.Name == "Viewer", cancellationToken: cancellationToken);

    if (viewerRole == null)
    {
      _logger.LogError("System configuration error: the 'Viewer' role was not found in the database.");

      throw new BusinessException("System configuration error: the default role was not found.");
    }

    var createdUser = new User
    {
      Username = request.Username,
      Email = request.Email,
      PasswordHash = string.Empty,
    };

    createdUser.PasswordHash = _passwordService.HashPassword(createdUser, request.TemporaryPassword);

    createdUser.UserRoles.Add(new UserRole
    {
      User = createdUser,
      RoleId = viewerRole.Id,
    });

    await _userRepository.AddAsync(createdUser, cancellationToken);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await _activityService.AddAsync(new CreateActivityRequest(
      Action: OperationalActivityActions.ViewerAccountCreated,
      EntityName: OperationalActivityActions.UserEntity,
      EntityId: createdUser.Id.ToString(),
      NewValues: $"Viewer account '{createdUser.Username}' created.",
      UserId: createdByUserId), cancellationToken);

    _logger.LogInformation("Viewer account created successfully. ID: {UserId}", createdUser.Id);

    return new ReturnModel<CreatedUserResponseDto>
    {
      Success = true,
      Message = "Viewer account created successfully.",
      StatusCode = 201,
      Data = _mapper.EntityToCreatedResponseDto(createdUser),
    };
  }

  public async Task<ReturnModel<List<UserResponseDto>>> GetAllAsync(
    Expression<Func<User, bool>>? filter = null, 
    Func<IQueryable<User>, IQueryable<User>>? include = null, 
    Func<IQueryable<User>, IOrderedQueryable<User>>? orderBy = null, 
    bool enableTracking = false, 
    bool withDeleted = false, 
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Tüm kullanıcılar listeleniyor.");

    List<User> users = await _userRepository.GetAllAsync(
      include: u => u.Include(u => u.UserRoles).ThenInclude(ur => ur.Role),
      cancellationToken: cancellationToken);

    List<UserResponseDto> response = _mapper.EntityToResponseDtoList(users);

    return new ReturnModel<List<UserResponseDto>>()
    {
      Success = true,
      Message = "Kullanıcı listesi başarılı bir şekilde getirildi",
      Data = response,
      StatusCode = 200
    };
  }

  public async Task<ReturnModel<UserResponseDto>> GetAsync(
    Expression<Func<User, bool>> predicate, 
    Func<IQueryable<User>, IQueryable<User>>? include = null, 
    bool enableTracking = false, 
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Kriterlere göre kullanıcı sorgulanıyor.");

    var user = await _userRepository.GetAsync(
      predicate: predicate,
      include: u => u.Include(u => u.UserRoles).ThenInclude(ur => ur.Role),
      enableTracking: enableTracking, 
      cancellationToken: cancellationToken);

    if (user == null)
    {
      _logger.LogWarning("Aranan kriterlere uygun kullanıcı bulunamadı.");

      return new ReturnModel<UserResponseDto>()
      {
        Success = false,
        Message = "Kullanıcı bulunamadı",
        Data = null,
        StatusCode = 404
      };
    }

    return new ReturnModel<UserResponseDto>()
    {
      Success = true,
      Message = "Kullanıcı başarılı bir şekilde getirildi",
      Data = _mapper.EntityToResponseDto(user),
      StatusCode = 200
    };
  }

  public async Task<ReturnModel<UserResponseDto>> GetByIdAsync(
    Guid id,
    Guid callerUserId,
    string callerRole,
    Func<IQueryable<User>, IQueryable<User>>? include = null,
    bool enableTracking = false,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Kullanıcı detayları getiriliyor. ID: {UserId}", id);

    _businessRules.ViewerMayOnlyViewSelf(callerRole, callerUserId, id);

    User user = await _businessRules.GetUserIfExistAsync(
      id: id,
      include: u => u.Include(u => u.UserRoles).ThenInclude(ur => ur.Role),
      enableTracking: enableTracking,
      cancellationToken: cancellationToken);

    if (id != callerUserId)
    {
      _businessRules.EditorMayOnlyTargetViewerUsers(callerRole, user);
    }

    UserResponseDto response = _mapper.EntityToResponseDto(user);

    return new ReturnModel<UserResponseDto>()
    {
      Success = true,
      Message = "Kullanıcı başarılı bir şekilde getirildi",
      Data = response,
      StatusCode = 200
    };
  }

  public async Task<ReturnModel<NoData>> RemoveAsync(
    Guid id,
    Guid currentUserId,
    string userRole,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Kullanıcı silme işlemi başlatıldı. Silinecek ID: {TargetUserId}, İşlemi Yapan: {CurrentUserId}", id, currentUserId);

    _businessRules.UserMustBeOwnerOrAdmin(id, currentUserId, userRole);

    User user = await _businessRules.GetUserIfExistAsync(
      id,
      enableTracking: true,
      cancellationToken: cancellationToken);

    string? imagePathToDelete = user.ProfileImageUrl;

    _userRepository.Delete(user);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    if (!string.IsNullOrEmpty(imagePathToDelete))
    {
      _logger.LogInformation("Kullanıcı silindiği için profil fotoğrafı temizleniyor. Dosya: {ImagePath}", imagePathToDelete);
      FileHelper.DeleteImageFromDisk(imagePathToDelete, _logger);
    }

    _logger.LogInformation("Kullanıcı başarıyla silindi. ID: {UserId}", id);

    return new ReturnModel<NoData>()
    {
      Success = true,
      Message = "Kullanıcı başarılı bir şekilde silindi",
      Data = null,
      StatusCode = 200
    };
  }

  public async Task<ReturnModel<NoData>> UpdateAsync(
    UpdateUserRequest request,
    Guid targetUserId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Kullanıcı güncelleme işlemi başlatıldı. ID: {UserId}", targetUserId);

    var validationResult = await _updateValidator.ValidateAsync(request, cancellationToken);

    if (!validationResult.IsValid)
    {
      _logger.LogWarning("Kullanıcı güncelleme validasyonu başarısız oldu. ID: {UserId}", targetUserId);

      throw new ValidationException(validationResult.Errors);
    }

    User existingUser = await _businessRules.GetUserIfExistAsync(
      targetUserId,
      include: IncludeRoles,
      enableTracking: true,
      cancellationToken: cancellationToken);

    var isSelfEdit = targetUserId == callerUserId;

    if (!isSelfEdit)
    {
      _businessRules.EditorMayOnlyTargetViewerUsers(callerRole, existingUser);
    }

    if (existingUser.Email != request.Email)
    {
      await _businessRules.EmailMustBeUniqueAsync(request.Email, existingUser.Id, cancellationToken);
    }

    if (existingUser.Username != request.Username)
    {
      await _businessRules.UsernameMustBeUniqueAsync(request.Username, existingUser.Id, cancellationToken);
    }

    _mapper.UpdateEntityFromRequest(request, existingUser);

    if (request.ImageFile != null)
    {
      _logger.LogInformation("Kullanıcı profil fotoğrafı güncelleniyor. ID: {UserId}", targetUserId);
    }

    existingUser.ProfileImageUrl = await FileHelper.ReplaceImageOnDisk(
      request.ImageFile,
      existingUser.ProfileImageUrl,
      "profiles",
      request.Username,
      cancellationToken, _logger);

    _userRepository.Update(existingUser);
    await _unitOfWork.SaveChangesAsync(cancellationToken);

    if (!isSelfEdit)
    {
      await _activityService.AddAsync(new CreateActivityRequest(
        Action: OperationalActivityActions.ViewerProfileUpdated,
        EntityName: OperationalActivityActions.UserEntity,
        EntityId: existingUser.Id.ToString(),
        NewValues: $"Viewer account '{existingUser.Username}' profile updated.",
        UserId: callerUserId), cancellationToken);
    }

    _logger.LogInformation("Kullanıcı bilgileri başarıyla güncellendi. ID: {UserId}", targetUserId);

    return new ReturnModel<NoData>()
    {
      Success = true,
      Message = "Kullanıcı başarılı bir şekilde güncellendi",
      Data = null,
      StatusCode = 200
    };
  }

  public async Task<ReturnModel<NoData>> ChangePasswordAsync(
    ChangePasswordRequest request,
    Guid userId,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Şifre değiştirme işlemi başlatıldı. ID: {UserId}", userId);

    var validationResult = await _changePasswordValidator.ValidateAsync(request, cancellationToken);

    if (!validationResult.IsValid)
    {
      _logger.LogWarning("Şifre değiştirme validasyonu başarısız oldu. ID: {UserId}", userId);

      throw new ValidationException(validationResult.Errors);
    }

    User user = await _businessRules.GetUserIfExistAsync(userId, enableTracking: true, cancellationToken: cancellationToken);

    var currentPasswordOutcome = _businessRules.VerifyPassword(user, request.CurrentPassword);
    _businessRules.PasswordMustMatch(currentPasswordOutcome);

    var newPasswordOutcome = _businessRules.VerifyPassword(user, request.NewPassword);
    _businessRules.NewPasswordCannotBeSameAsOld(newPasswordOutcome);

    user.PasswordHash = _passwordService.HashPassword(user, request.NewPassword);
    user.PasswordKey = null;

    _userRepository.Update(user);

    // A password change invalidates every existing session, everywhere — otherwise a stolen
    // refresh token would survive the very action meant to lock an attacker out.
    await _refreshTokenService.RevokeAllActiveFamiliesForUserAsync(userId, "PasswordChanged", cancellationToken);

    await _unitOfWork.SaveChangesAsync(cancellationToken);

    _logger.LogInformation("Kullanıcı şifresi başarıyla güncellendi. ID: {UserId}", userId);

    return new ReturnModel<NoData>()
    {
      Success = true,
      Message = "Şifreniz başarıyla güncellendi.",
      StatusCode = 200
    };
  }

  public async Task<ReturnModel<NoData>> UpdateStatusAsync(
    Guid targetUserId,
    bool isActive,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default)
  {
    _logger.LogInformation("Kullanıcı durum güncelleme işlemi başlatıldı. ID: {UserId}, IsActive: {IsActive}", targetUserId, isActive);

    _businessRules.UserCannotDeactivateSelf(targetUserId, callerUserId, isActive);

    User user = await _businessRules.GetUserIfExistAsync(
      targetUserId, include: IncludeRoles, enableTracking: true, cancellationToken: cancellationToken);

    _businessRules.EditorMayOnlyTargetViewerUsers(callerRole, user);

    user.IsActive = isActive;

    _userRepository.Update(user);

    if (!isActive)
    {
      // Deactivation must end every session immediately — a stale refresh token must not let a
      // frozen account keep renewing access tokens indefinitely.
      await _refreshTokenService.RevokeAllActiveFamiliesForUserAsync(targetUserId, "UserDeactivated", cancellationToken);
    }

    await _unitOfWork.SaveChangesAsync(cancellationToken);

    await _activityService.AddAsync(new CreateActivityRequest(
      Action: isActive ? OperationalActivityActions.ViewerStatusActivated : OperationalActivityActions.ViewerStatusDeactivated,
      EntityName: OperationalActivityActions.UserEntity,
      EntityId: user.Id.ToString(),
      NewValues: $"Viewer account '{user.Username}' {(isActive ? "activated" : "deactivated")}.",
      UserId: callerUserId), cancellationToken);

    _logger.LogInformation("Kullanıcı durumu güncellendi. ID: {UserId}, IsActive: {IsActive}", targetUserId, isActive);

    return new ReturnModel<NoData>()
    {
      Success = true,
      Message = isActive ? "Kullanıcı aktifleştirildi." : "Kullanıcı pasifleştirildi.",
      Data = null,
      StatusCode = 200
    };
  }
}
