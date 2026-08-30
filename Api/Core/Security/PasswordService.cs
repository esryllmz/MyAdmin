using Microsoft.AspNetCore.Identity;

namespace Api.Core.Security;

public class PasswordService<TUser>(IPasswordHasher<TUser> _hasher) : IPasswordService<TUser>
  where TUser : class
{
  public string HashPassword(TUser user, string password)
  {
    return _hasher.HashPassword(user, password);
  }

  public PasswordVerificationOutcome VerifyModern(TUser user, string hashedPassword, string providedPassword)
  {
    var result = _hasher.VerifyHashedPassword(user, hashedPassword, providedPassword);

    return result switch
    {
      PasswordVerificationResult.Success => PasswordVerificationOutcome.Success,
      PasswordVerificationResult.SuccessRehashNeeded => PasswordVerificationOutcome.SuccessRehashNeeded,
      _ => PasswordVerificationOutcome.Failed
    };
  }
}
