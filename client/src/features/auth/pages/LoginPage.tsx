import { useRef, useState, type SyntheticEvent } from "react";
import { ArrowRight, Loader2, Mail, ShieldCheck, Eye, Activity } from "lucide-react";
import { Link } from "react-router-dom";
import { AuthLayout } from "@/layouts/AuthLayout";
import { AuthSidePanel } from "../components/AuthSidePanel";
import { AuthTextField } from "../components/AuthTextField";
import { AuthPasswordField } from "../components/AuthPasswordField";
import { useAuth } from "../hooks/useAuth";
import { getLoginErrorMessage } from "../utils/authErrorMessages";
import { validateEmail, validateLoginPassword } from "../utils/authValidation";

interface FieldErrors {
  email?: string;
  password?: string;
}

const LOGIN_PANEL_FEATURES = [
  { icon: ShieldCheck, label: "Role-based access" },
  { icon: Eye, label: "Session visibility" },
  { icon: Activity, label: "Audit-ready activity" },
];

const LoginPage = () => {
  const { login, isLoginLoading, loginError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [capsLockOn, setCapsLockOn] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isLoginLoading) return;

    const nextErrors: FieldErrors = {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    };
    setErrors(nextErrors);

    if (nextErrors.email) {
      emailRef.current?.focus();
      return;
    }
    if (nextErrors.password) {
      passwordRef.current?.focus();
      return;
    }

    login({ email: email.trim(), password });
  };

  const errorMessage = loginError ? getLoginErrorMessage(loginError) : null;

  return (
    <AuthLayout
      panel={
        <AuthSidePanel
          title="Administration, without the noise."
          description="Sign in to review access, monitor sessions, and keep every permission change accountable."
          features={LOGIN_PANEL_FEATURES}
        />
      }
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface dark:text-dark-on-surface">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
          Sign in to continue to your administration workspace.
        </p>
      </div>

      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.06)] dark:border-dark-outline-variant dark:bg-dark-surface-container-lowest">
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
              if (errors.email) setErrors((prev) => ({ ...prev, email: validateEmail(next) }));
            }}
            error={errors.email}
            ref={emailRef}
          />

          <AuthPasswordField
            id="password"
            label="Password"
            labelAdornment={
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-accent transition-colors hover:text-accent-hover dark:text-dark-accent dark:hover:text-dark-accent-hover"
              >
                Forgot password?
              </Link>
            }
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              const next = e.target.value;
              setPassword(next);
              if (errors.password) setErrors((prev) => ({ ...prev, password: validateLoginPassword(next) }));
            }}
            error={errors.password}
            capsLockOn={capsLockOn}
            onCapsLockChange={setCapsLockOn}
            ref={passwordRef}
          />

          {errorMessage && (
            <p role="alert" aria-live="polite" className="text-sm font-medium text-error">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoginLoading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-md bg-on-surface text-sm font-semibold text-surface transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-dark-on-surface dark:text-dark-surface dark:focus-visible:ring-dark-accent/60"
          >
            {isLoginLoading ? (
              <Loader2 className="animate-spin" size={18} aria-hidden="true" />
            ) : (
              <>
                Sign in
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="mt-6 text-center text-sm text-on-surface-variant dark:text-dark-on-surface-variant">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="font-semibold text-on-surface transition-colors hover:text-accent dark:text-dark-on-surface dark:hover:text-dark-accent"
        >
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default LoginPage;
