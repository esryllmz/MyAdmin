namespace Api.Core.Security;

public enum PasswordVerificationOutcome
{
  Failed,
  Success,
  SuccessRehashNeeded,
  LegacyUpgradeNeeded
}
