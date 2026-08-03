using Api.Features.Roles;

namespace Api.Features.Users;

public sealed record RegisterUserRequest(
  string Username,
  string Email,
  string Password,
  string? ProfileImageUrl,
  string? Bio);

public sealed record UpdateUserRequest(
  string Username,
  string Email,
  string? Bio,
  IFormFile? ImageFile);

public class UserResponseDto
{
  public Guid Id { get; set; }
  public string Username { get; set; } = null!;
  public string Email { get; set; } = null!;
  public string? ProfileImageUrl { get; set; }
  public string? Bio { get; set; }
  public bool IsActive { get; set; }
  public DateTime CreatedDate { get; set; }
  public DateTime? UpdatedDate { get; set; }
  public List<RoleResponseDto> Roles { get; set; } = new();
}

public sealed record CreatedUserResponseDto(
  Guid Id,
  string Username,
  string Email);

public sealed record UserPreviewDto(
  Guid Id,
  string Username,
  string? ProfileImageUrl);

public sealed record ChangePasswordRequest(
  string CurrentPassword,
  string NewPassword,
  string ConfirmNewPassword);

public sealed record UpdateUserStatusRequest(bool IsActive);

/// <summary>
/// Editor/Admin-only account creation for Viewer users — distinct from the public self-service
/// RegisterUserRequest above. No role field: the service always assigns Viewer, regardless of
/// what the caller sends, so this can never be used to mint an Editor or Admin account.
/// </summary>
public sealed record CreateViewerAccountRequest(
  string Username,
  string Email,
  string TemporaryPassword);

public sealed record ManageableUsersQuery(
  string? Search = null,
  bool? IsActive = null,
  Guid? TeamId = null,
  int Page = 1,
  int PageSize = 20,
  string? Sort = null);
