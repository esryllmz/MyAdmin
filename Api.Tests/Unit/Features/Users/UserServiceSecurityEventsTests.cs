using Api.Core.Repositories;
using Api.Core.Security;
using Api.Features.Activities;
using Api.Features.Authentication;
using Api.Features.Roles;
using Api.Features.Teams;
using Api.Features.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using Moq;

namespace Api.Tests.Unit.Features.Users;

public class UserServiceSecurityEventsTests
{
  private readonly Mock<IUserRepository> _userRepository = new();
  private readonly Mock<IRoleRepository> _roleRepository = new();
  private readonly Mock<ITeamMemberRepository> _teamMemberRepository = new();
  private readonly Mock<IActivityService> _activityService = new();
  private readonly Mock<IRefreshTokenService> _refreshTokenService = new();
  private readonly Mock<IUnitOfWork> _unitOfWork = new();
  private readonly IPasswordService<User> _passwordService =
    new PasswordService<User>(new PasswordHasher<User>(Options.Create(new PasswordHasherOptions())));

  private UserService CreateService()
  {
    var businessRules = new UserBusinessRules(_userRepository.Object, _passwordService, NullLogger<UserBusinessRules>.Instance);

    return new UserService(
      _userRepository.Object,
      _roleRepository.Object,
      _teamMemberRepository.Object,
      new UserMapper(),
      businessRules,
      _activityService.Object,
      _passwordService,
      _refreshTokenService.Object,
      _unitOfWork.Object,
      new UpdateUserRequestValidator(),
      new ChangePasswordRequestValidator(),
      new CreateViewerAccountRequestValidator(),
      NullLogger<UserService>.Instance);
  }

  private User CreateUserWithPassword(string password)
  {
    var user = new User { Username = "viewer", Email = "viewer@example.com", PasswordHash = string.Empty, IsActive = true };
    user.PasswordHash = _passwordService.HashPassword(user, password);

    _userRepository
      .Setup(r => r.GetByIdAsync(user.Id, It.IsAny<Func<IQueryable<User>, IQueryable<User>>?>(), true, It.IsAny<CancellationToken>()))
      .ReturnsAsync(user);

    return user;
  }

  [Fact]
  public async Task ChangePasswordAsync_Success_RevokesAllActiveRefreshFamiliesForUser()
  {
    var user = CreateUserWithPassword("Old-Password-1!");

    var result = await CreateService().ChangePasswordAsync(
      new ChangePasswordRequest("Old-Password-1!", "New-Password-2!", "New-Password-2!"),
      user.Id,
      CancellationToken.None);

    Assert.True(result.Success);
    _refreshTokenService.Verify(s => s.RevokeAllActiveFamiliesForUserAsync(user.Id, "PasswordChanged", It.IsAny<CancellationToken>()), Times.Once);
    Assert.Null(user.PasswordKey);
  }

  [Fact]
  public async Task ChangePasswordAsync_WrongCurrentPassword_DoesNotRevokeAnySessions()
  {
    var user = CreateUserWithPassword("Old-Password-1!");

    await Assert.ThrowsAnyAsync<Exception>(() => CreateService().ChangePasswordAsync(
      new ChangePasswordRequest("totally-wrong", "New-Password-2!", "New-Password-2!"),
      user.Id,
      CancellationToken.None));

    _refreshTokenService.Verify(s => s.RevokeAllActiveFamiliesForUserAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
  }

  [Fact]
  public async Task UpdateStatusAsync_Deactivation_RevokesAllActiveRefreshFamiliesForUser()
  {
    var targetUser = new User { Username = "viewer", Email = "viewer@example.com", PasswordHash = "x", IsActive = true };
    _userRepository
      .Setup(r => r.GetByIdAsync(targetUser.Id, It.IsAny<Func<IQueryable<User>, IQueryable<User>>?>(), true, It.IsAny<CancellationToken>()))
      .ReturnsAsync(targetUser);

    var callerId = Guid.NewGuid();

    var result = await CreateService().UpdateStatusAsync(targetUser.Id, isActive: false, callerId, "Admin", CancellationToken.None);

    Assert.True(result.Success);
    _refreshTokenService.Verify(s => s.RevokeAllActiveFamiliesForUserAsync(targetUser.Id, "UserDeactivated", It.IsAny<CancellationToken>()), Times.Once);
  }

  [Fact]
  public async Task UpdateStatusAsync_Activation_DoesNotRevokeAnySessions()
  {
    var targetUser = new User { Username = "viewer", Email = "viewer@example.com", PasswordHash = "x", IsActive = false };
    _userRepository
      .Setup(r => r.GetByIdAsync(targetUser.Id, It.IsAny<Func<IQueryable<User>, IQueryable<User>>?>(), true, It.IsAny<CancellationToken>()))
      .ReturnsAsync(targetUser);

    var callerId = Guid.NewGuid();

    await CreateService().UpdateStatusAsync(targetUser.Id, isActive: true, callerId, "Admin", CancellationToken.None);

    _refreshTokenService.Verify(s => s.RevokeAllActiveFamiliesForUserAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
  }
}
