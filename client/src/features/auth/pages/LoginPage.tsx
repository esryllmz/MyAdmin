import React, { useState } from "react";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { useAuth } from "../hooks/useAuth";

const LoginPage = () => {
  const { login, isLoginLoading } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <PublicLayout mainClassName="flex-1 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-neutral-950 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
            Welcome Back
          </h1>
          <p className="text-base text-neutral-600 dark:text-zinc-400">Sign in to your MyAdmin workspace.</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.06)] dark:border-zinc-800 dark:bg-zinc-900/80">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-zinc-400" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 dark:text-zinc-500">
                  <Mail size={20} />
                </div>
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-neutral-950 placeholder-neutral-400 transition-all focus:ring-2 focus:ring-neutral-400 dark:border-zinc-800 dark:bg-black dark:text-white sm:text-sm"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="block text-sm font-medium text-neutral-600 dark:text-zinc-400" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-xs font-medium text-neutral-700 transition-colors hover:text-black dark:text-zinc-300 dark:hover:text-white">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 dark:text-zinc-500">
                  <Lock size={20} />
                </div>
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border border-neutral-200 bg-white py-2.5 pl-10 pr-3 text-neutral-950 placeholder-neutral-400 transition-all focus:ring-2 focus:ring-neutral-400 dark:border-zinc-800 dark:bg-black dark:text-white sm:text-sm"
                  placeholder="********"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoginLoading}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-neutral-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            >
              {isLoginLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight className="ml-2" size={16} /></>}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-zinc-400">
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold text-neutral-950 transition-colors hover:underline dark:text-white">
              Register
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default LoginPage;
