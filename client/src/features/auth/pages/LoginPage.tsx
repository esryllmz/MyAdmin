import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Hexagon, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const LoginPage = () => {
  const { login, isLoginLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    login(formData);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased font-body">
      {/* Header */}
      <header className="w-full py-6 px-6 flex justify-between items-center fixed top-0 z-50">
        <div className="text-2xl font-black tracking-tighter text-on-surface flex items-center gap-2">
          <Hexagon className="text-primary fill-primary w-8 h-8" />
          MyAdmin
        </div>
        <Link to="/" className="text-sm font-medium text-primary hover:text-primary-container transition-colors">
          Return to Homepage
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2" style={{ letterSpacing: '-0.02em' }}>
              Welcome Back
            </h1>
            <p className="text-on-surface-variant text-base">Sign in to your Precision Architecture workspace.</p>
          </div>

          {/* Login Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.06)] border border-outline-variant/20">
            <form className="space-y-6" onSubmit={handleSubmit}>

              {/* Email Input */}
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1.5" htmlFor="email">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant/20 rounded-md text-on-surface placeholder-outline focus:ring-2 focus:ring-primary transition-all sm:text-sm"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-on-surface-variant" htmlFor="password">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-primary hover:text-primary-container transition-colors">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                    <Lock size={20} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant/20 rounded-md text-on-surface placeholder-outline focus:ring-2 focus:ring-primary transition-all sm:text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoginLoading}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoginLoading ? <Loader2 className="animate-spin" size={20} /> : <>Sign In <ArrowRight className="ml-2" size={16} /></>}
                </button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Don't have an account? <Link to="/register" className="font-semibold text-primary hover:text-primary-container transition-colors">Register</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;