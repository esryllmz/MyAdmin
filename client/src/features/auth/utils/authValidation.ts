/**
 * Client-side mirrors of the backend FluentValidation rules for auth requests.
 * Kept in sync with:
 *  - Api/Features/Users/UserValidator.cs → RegisterUserRequestValidator / LoginRequestValidator
 * These must match exactly — the frontend must never accept something the API will reject,
 * and must never require something the API doesn't.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface PasswordRequirement {
  key: string;
  label: string;
  test: (value: string) => boolean;
}

// Order matches the backend validator's rule order.
export const PASSWORD_REQUIREMENTS: PasswordRequirement[] = [
  { key: "length", label: "At least 8 characters", test: (v) => v.length >= 8 },
  { key: "upper", label: "One uppercase letter", test: (v) => /[A-Z]/.test(v) },
  { key: "lower", label: "One lowercase letter", test: (v) => /[a-z]/.test(v) },
  { key: "digit", label: "One number", test: (v) => /[0-9]/.test(v) },
  { key: "special", label: "One special character (!, ?, *, .)", test: (v) => /[!?*.]/.test(v) },
];

export const isPasswordValid = (value: string): boolean =>
  PASSWORD_REQUIREMENTS.every((rule) => rule.test(value));

export const validateEmail = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return "Email address is required.";
  if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address.";
  if (trimmed.length > 150) return "Email address must be 150 characters or fewer.";
  return undefined;
};

export const validateLoginPassword = (value: string): string | undefined => {
  if (!value) return "Password is required.";
  return undefined;
};

export const validateRegisterPassword = (value: string): string | undefined => {
  if (!value) return "Password is required.";
  if (!isPasswordValid(value)) return "Password doesn't meet the requirements below.";
  return undefined;
};

export const validateConfirmPassword = (password: string, confirm: string): string | undefined => {
  if (!confirm) return "Confirm your password.";
  if (confirm !== password) return "Passwords don't match.";
  return undefined;
};

export const validateUsername = (value: string): string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return "Username is required.";
  if (trimmed.length < 3) return "Username must be at least 3 characters.";
  if (trimmed.length > 50) return "Username must be 50 characters or fewer.";
  return undefined;
};
