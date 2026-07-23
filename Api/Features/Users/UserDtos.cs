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
