namespace Api.Core.Security;

/// <summary>
/// Pure password cryptography: hashing and verifying against the current (non-legacy) scheme.
/// Deliberately stateless and persistence-free — deciding whether/what to persist based on the
/// returned outcome is the caller's (application service's) responsibility, not this service's.
/// </summary>
public interface IPasswordService<TUser> where TUser : class
{
  string HashPassword(TUser user, string password);

  PasswordVerificationOutcome VerifyModern(TUser user, string hashedPassword, string providedPassword);
}
