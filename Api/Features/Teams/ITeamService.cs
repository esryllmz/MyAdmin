using Api.Core.Responses;

namespace Api.Features.Teams;

public sealed record TeamListQuery(
  string? Search = null,
  bool? IsActive = null,
  int Page = 1,
  int PageSize = 20,
  string? Sort = null);

public interface ITeamService
{
  Task<ReturnModel<PagedResult<TeamResponseDto>>> GetAllAsync(
    TeamListQuery query,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<TeamResponseDto>> GetByIdAsync(
    Guid id,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<CreatedTeamResponseDto>> CreateAsync(
    CreateTeamRequest request,
    Guid callerUserId,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> UpdateAsync(
    Guid id,
    UpdateTeamRequest request,
    Guid callerUserId,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> UpdateStatusAsync(
    Guid id,
    bool isActive,
    Guid callerUserId,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> DeleteAsync(
    Guid id,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<List<TeamMemberResponseDto>>> GetMembersAsync(
    Guid teamId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<TeamMemberResponseDto>> AddMemberAsync(
    Guid teamId,
    AddTeamMemberRequest request,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> UpdateMemberAsync(
    Guid teamId,
    Guid userId,
    UpdateTeamMemberRequest request,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<NoData>> RemoveMemberAsync(
    Guid teamId,
    Guid userId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  Task<ReturnModel<List<TeamResponseDto>>> GetTeamsForUserAsync(
    Guid targetUserId,
    Guid callerUserId,
    string callerRole,
    CancellationToken cancellationToken = default);

  /// <summary>Viewer-safe "My Teams" list — always scoped to the caller's own active memberships.</summary>
  Task<ReturnModel<List<MyTeamResponseDto>>> GetMyTeamsAsync(
    Guid callerUserId,
    CancellationToken cancellationToken = default);

  /// <summary>Viewer-safe single team detail — 404 unless the caller is an active member.</summary>
  Task<ReturnModel<MyTeamResponseDto>> GetMyTeamDetailAsync(
    Guid teamId,
    Guid callerUserId,
    CancellationToken cancellationToken = default);

  /// <summary>Viewer-safe member list (no email/application role) — 404 unless the caller is an active member.</summary>
  Task<ReturnModel<List<MyTeamMemberResponseDto>>> GetMyTeamMembersAsync(
    Guid teamId,
    Guid callerUserId,
    CancellationToken cancellationToken = default);
}
