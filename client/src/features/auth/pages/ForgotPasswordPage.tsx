import React, { useState } from 'react';
import { Mail, ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simüle başarılı submit
    setTimeout(() => {
      setIsSubmitted(true);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased font-body">
      {/* Header */}
      <header className="w-full py-6 px-6 flex items-center fixed top-0 z-50">
        <Link to="/login" className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-container transition-colors">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
      </header>

      <main className="flex-grow flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight text-on-surface mb-2">
              Reset Your Password
            </h1>
            <p className="text-on-surface-variant text-base">
              {isSubmitted
                ? 'Check your email for password reset instructions'
                : 'Enter your email to receive a password reset link'}
            </p>
          </div>

          {/* Reset Card */}
          <div className="bg-surface-container-lowest rounded-xl p-8 shadow-[0_20px_40px_-15px_rgba(11,28,48,0.06)] border border-outline-variant/20">
            {!isSubmitted ? (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                      <Mail size={20} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2.5 bg-surface border border-outline-variant/20 rounded-md text-on-surface placeholder-outline focus:ring-2 focus:ring-primary transition-all sm:text-sm"
                      placeholder="name@company.com"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email}
                  className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-primary hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Send Reset Link'}
                </button>
              </form>
            ) : (
              <div className="text-center space-y-4">
                <div className="flex justify-center mb-4">
                  <CheckCircle size={48} className="text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-on-surface">
                  Email Sent Successfully
                </h2>
                <p className="text-on-surface-variant text-sm">
                  We've sent a password reset link to {email}. Please check your inbox (and spam folder).
                </p>
                <p className="text-xs text-on-surface-variant pt-4">
                  The link will expire in 24 hours.
                </p>
              </div>
            )}
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-on-surface-variant">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold text-primary hover:text-primary-container transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPasswordPage;
