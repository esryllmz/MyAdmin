import React, { useState } from "react";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { Link } from "react-router-dom";
import { PublicLayout } from "@/layouts/PublicLayout";
import { useAuth } from "../hooks/useAuth";

const RegisterPage = () => {
  const { register, isRegisterLoading } = useAuth();
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    register(formData);
  };

  return (
    <PublicLayout mainClassName="flex-1 flex items-center justify-center p-6">
      <main className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight text-neutral-950 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
            Create Your Account
          </h1>
          <p className="text-base leading-relaxed text-neutral-600 dark:text-zinc-400">
            Join your team's MyAdmin workspace.
          </p>
        </div>

        <form className="space-y-5 rounded-xl border border-neutral-200 bg-white p-8 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.06)] dark:border-zinc-800 dark:bg-zinc-900/80" onSubmit={handleSubmit}>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-zinc-400" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 dark:text-zinc-500">
                <User size={18} />
              </div>
              <input
                id="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full rounded-md border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-950 transition-all focus:outline-none focus:border-neutral-400 dark:border-zinc-800 dark:bg-black dark:text-white"
                placeholder="admin_sys_01"
                type="text"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-zinc-400" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 dark:text-zinc-500">
                <Mail size={18} />
              </div>
              <input
                id="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-950 transition-all focus:outline-none focus:border-neutral-400 dark:border-zinc-800 dark:bg-black dark:text-white"
                placeholder="security@enterprise.com"
                type="email"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-neutral-600 dark:text-zinc-400" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 dark:text-zinc-500">
                <Lock size={18} />
              </div>
              <input
                id="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-md border border-neutral-200 bg-white py-3 pl-10 pr-4 text-sm text-neutral-950 transition-all focus:outline-none focus:border-neutral-400 dark:border-zinc-800 dark:bg-black dark:text-white"
                placeholder="********"
                type="password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRegisterLoading}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-neutral-950 py-3.5 text-sm font-bold text-white shadow-sm transition-all active:scale-[0.98] hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          >
            {isRegisterLoading ? <Loader2 className="animate-spin" size={18} /> : <>Register <ArrowRight size={18} /></>}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-600 dark:text-zinc-400">
            Already integrated?
            <Link to="/login" className="ml-1 font-bold text-neutral-950 hover:underline dark:text-white">
              Sign In
            </Link>
          </p>
        </div>
      </main>
    </PublicLayout>
  );
};

export default RegisterPage;
