import { useRef, useState, type SyntheticEvent } from "react";
import { ArrowRight, Loader2, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { ShieldCheck, KeyRound, Users } from "lucide-react";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { AuthTextField } from "../components/AuthTextField";
import { AuthPasswordField } from "../components/AuthPasswordField";
import { PasswordRequirements } from "../components/PasswordRequirements";
import { useAuth } from "../hooks/useAuth";
import { getRegisterErrorMessage } from "../utils/authErrorMessages";
import {
  isPasswordValid,
  validateConfirmPassword,
  validateEmail,
  validateUsername,
} from "../utils/authValidation";

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

const REGISTER_PANEL_FEATURES = [
  { icon: Users, label: "Joins as a Viewer by default" },
  { icon: ShieldCheck, label: "Admins can grant more access later" },
  { icon: KeyRound, label: "Your credentials stay yours — never shared" },
];

const RegisterPage = () => {
  const { register, isRegisterLoading, registerError } = useAuth();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [capsLockOn, setCapsLockOn] = useState(false);

  const usernameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isRegisterLoading) return;

    const nextErrors: FieldErrors = {
      username: validateUsername(username),
      email: validateEmail(email),
      password: isPasswordValid(password) ? undefined : "Password doesn't meet the requirements below.",
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    };
    setErrors(nextErrors);
    setPasswordTouched(true);
    setSubmitted(true);

    const firstInvalidRef = nextErrors.username
      ? usernameRef
      : nextErrors.email
        ? emailRef
        : nextErrors.password
          ? passwordRef
          : nextErrors.confirmPassword
            ? confirmRef
            : null;

    if (firstInvalidRef) {
      firstInvalidRef.current?.focus();
      return;
    }

    register({ username: username.trim(), email: email.trim(), password });
  };

  const errorMessage = registerError ? getRegisterErrorMessage(registerError) : null;

  return (
    <AuthLayout
      panel={
        <AuthSidePanel
          title="Join your team's workspace."
          description="Registration is open, but kept safe by default — every new account starts with read-only access until an admin promotes it."
          features={REGISTER_PANEL_FEATURES}
          showStatusPreview={false}
        />
      }
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Set up your credentials to join your workspace.
        </p>
      </div>

      <form
        className="space-y-4 rounded-xl border border-outline bg-surface-container-lowest p-6 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.12)] dark:border-dark-outline dark:bg-dark-surface-container-lowest"
        onSubmit={handleSubmit}
        noValidate
      >
        <AuthTextField
          id="username"
          label="Username"
          type="text"
          autoComplete="username"
          placeholder="e.g. jane_doe"
          icon={<User size={18} aria-hidden="true" />}
          value={username}
          onChange={(e) => {
            const next = e.target.value;
            setUsername(next);
            if (submitted) setErrors((prev) => ({ ...prev, username: validateUsername(next) }));
          }}
          error={errors.username}
          ref={usernameRef}
        />

        <AuthTextField
          id="email"
          label="Email address"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          icon={<Mail size={18} aria-hidden="true" />}
          value={email}
          onChange={(e) => {
            const next = e.target.value;
            setEmail(next);
            if (submitted) setErrors((prev) => ({ ...prev, email: validateEmail(next) }));
          }}
          error={errors.email}
          ref={emailRef}
        />

        <div>
          <AuthPasswordField
            id="password"
            label="Password"
            autoComplete="new-password"
            placeholder="Create a password"
            value={password}
            onChange={(e) => {
              const next = e.target.value;
              setPassword(next);
              if (!passwordTouched) setPasswordTouched(true);
              if (submitted) {
                setErrors((prev) => ({
                  ...prev,
                  password: isPasswordValid(next) ? undefined : "Password doesn't meet the requirements below.",
                  confirmPassword: validateConfirmPassword(next, confirmPassword),
                }));
              }
            }}
            error={errors.password}
            capsLockOn={capsLockOn}
            onCapsLockChange={setCapsLockOn}
            ref={passwordRef}
          />
          <PasswordRequirements password={password} active={passwordTouched} />
        </div>

        <AuthPasswordField
          id="confirmPassword"
          label="Confirm password"
          autoComplete="new-password"
          placeholder="Re-enter your password"
          value={confirmPassword}
          onChange={(e) => {
            const next = e.target.value;
            setConfirmPassword(next);
            setErrors((prev) => ({ ...prev, confirmPassword: validateConfirmPassword(password, next) }));
          }}
          error={errors.confirmPassword}
          ref={confirmRef}
        />

        {errorMessage && (
          <p role="alert" aria-live="polite" className="text-sm font-medium text-error">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={isRegisterLoading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-on-surface text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-on-surface dark:text-dark-surface dark:focus-visible:ring-dark-accent/60"
        >
          {isRegisterLoading ? (
            <Loader2 className="animate-spin" size={18} aria-hidden="true" />
          ) : (
            <>
              Register
              <ArrowRight size={16} aria-hidden="true" />
            </>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-semibold text-on-surface transition-colors hover:text-accent dark:text-dark-on-surface dark:hover:text-dark-accent"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
};

export default RegisterPage;
