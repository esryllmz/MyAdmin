import type { ApiResponse } from "@/core/types/ApiResponse";

/**
 * apiClient (core/api/apiClient.ts) throws the parsed ApiResponse on API errors, and a plain
 * Error on network/connection failures. This maps both into a single, English, user-safe
 * message — never the raw backend exception text.
 *
 * apiClient already shows its own toast for most status codes (400/403/404/500) and for
 * network errors (fixed toastId "network-error", so it never duplicates). It stays silent for
 * 401 specifically (that branch assumes a session-refresh scenario), which is exactly the
 * status login failures return — so the inline message below is the *only* feedback shown for
 * wrong credentials, satisfying "one toast or one inline error, never both".
 *
 * The one case this can't fully avoid a double-message for is register's 409 (duplicate email/
 * username): apiClient's default branch always toasts the backend's (Turkish) message, and we
 * additionally show a precise English inline error naming the offending field. See the final
 * report for this documented trade-off.
 */

const isApiResponse = (error: unknown): error is ApiResponse<unknown> =>
  typeof error === "object" &&
  error !== null &&
  "success" in error &&
  "statusCode" in error;

export const getLoginErrorMessage = (error: unknown): string | null => {
  if (isApiResponse(error)) {
    switch (error.statusCode) {
      case 401:
        return "Email or password is incorrect.";
      case 403:
        return "This account does not have access.";
      case 404:
        return "Email or password is incorrect.";
      default:
        return "Something went wrong while signing in. Please try again.";
    }
  }

  if (error instanceof Error) {
    // apiClient already surfaced a single "server unavailable" toast for this — don't duplicate.
    return null;
  }

  return "Something went wrong while signing in. Please try again.";
};

export const getRegisterErrorMessage = (error: unknown): string | null => {
  if (isApiResponse(error)) {
    const message = (error.message ?? "").toLowerCase();

    if (error.statusCode === 409) {
      if (message.includes("eposta") || message.includes("e-posta") || message.includes("email")) {
        return "This email address is already registered.";
      }
      if (message.includes("kullanıcı") || message.includes("username")) {
        return "This username is already taken.";
      }
      return "An account with these details already exists.";
    }

    if (error.statusCode === 400 && error.errors?.length) {
      // Validation errors — client-side checks should prevent these in normal use, but surface
      // something readable if the backend ever disagrees with the frontend rules.
      return "Please check the highlighted fields and try again.";
    }

    return "Something went wrong while creating your account. Please try again.";
  }

  if (error instanceof Error) {
    return null;
  }

  return "Something went wrong while creating your account. Please try again.";
};
