using Api.Core.Responses;
using System.Linq.Expressions;

namespace Api.Features.Users;

public interface IUserService
{
  Task<ReturnModel<List<UserResponseDto>>> GetAllAsync(
    Expression<Func<User, bool>>? filter = null,
    Func<IQueryable<User>, IQueryable<User>>? include = null,
    Func<IQueryable<User>, IOrderedQueryable<User>>? orderBy = null,
    bool enableTracking = false,
    bool withDeleted = false,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// Server-scoped list for the Editor workspace — always filtered to users holding the Viewer
  /// application role, regardless of who calls it, so an Editor can never enumerate Admin/Editor
  /// accounts through this endpoint.
  /// </summary>
  Task<ReturnModel<Core.Responses.PagedResult<UserResponseDto>>> GetManageableViewersAsync(
    ManageableUsersQuery query,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<CreatedUserResponseDto>> CreateViewerAccountAsync(
    CreateViewerAccountRequest request,
    Guid createdByUserId,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<UserResponseDto>> GetAsync(
    Expression<Func<User, bool>> predicate,
    Func<IQueryable<User>, IQueryable<User>>? include = null,
    bool enableTracking = false,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// callerUserId/callerRole gate this the same way as UpdateAsync/UpdateStatusAsync: an Editor
  /// looking up someone other than themselves may only look up a Viewer (see
  /// UserBusinessRules.EditorMayOnlyTargetViewerUsers) — GetById used to have no such check,
  /// which let any authenticated Editor/Viewer read any other user's profile by guessing an ID.
  /// </summary>
  Task<ReturnModel<UserResponseDto>> GetByIdAsync(
    Guid id,
    Guid callerUserId,
    string callerRole,
    Func<IQueryable<User>, IQueryable<User>>? include = null,
    bool enableTracking = false,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> RemoveAsync(
    Guid id,
    Guid currentUserId,
    string userRole,
    CancellationToken cancellationToken = default);

  /// <summary>
  /// targetUserId/callerUserId are equal for self-service profile edits; they differ when an
  /// Admin/Editor edits someone else, in which case callerRole gates who the target may be
  /// (see UserBusinessRules.EditorMayOnlyTargetViewerUsers).
  /// </summary>
  Task<ReturnModel<NoData>> UpdateAsync(
    UpdateUserRequest request,
    Guid targetUserId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> ChangePasswordAsync(
    ChangePasswordRequest request,
    Guid userId,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> UpdateStatusAsync(
    Guid targetUserId,
    bool isActive,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);
}
