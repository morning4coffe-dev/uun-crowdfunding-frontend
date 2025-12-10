import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const { login, register } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login({ email, password });
        toast.success('Welcome back!', { description: 'Successfully signed in.' });
      } else {
        await register({ email, password, firstName, lastName });
        toast.success('Account created!', { description: 'Welcome to FundIt.' });
      }
    } catch (err: any) {
      const message = err.response?.data?.message || err.response?.data?.error || 'An error occurred';
      setError(message);
      toast.error('Authentication failed', { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setShowPassword(false);
  };

  return (
    <div className="login-page">
      {/* Left Panel - Branding & Visual */}
      <div className="login-visual">
        <div className="login-visual__overlay" />
        <div className="login-visual__content">
          <div className="login-visual__logo">
            <svg viewBox="0 0 24 24" fill="currentColor" className="login-visual__logo-icon">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span className="login-visual__logo-text">FundIt</span>
          </div>

          <div className="login-visual__testimonial">
            <blockquote className="login-visual__quote">
              "This platform completely transformed how we approached our seed funding. The community support is unmatched."
            </blockquote>
            <div className="login-visual__author">
              <div className="login-visual__avatar" />
              <div className="login-visual__author-info">
                <div className="login-visual__author-name">Alex Chen</div>
                <div className="login-visual__author-role">Founder, Orbit UI</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="login-form-container">
        <div className="login-card">
          {/* Mobile Logo */}
          <div className="login-card__mobile-logo">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>

          {/* Header */}
          <div className="login-card__header">
            <h1 className="login-card__title">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="login-card__subtitle">
              {isLogin
                ? 'Enter your credentials to access your account'
                : 'Start your crowdfunding journey today'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {!isLogin && (
              <div className="login-form__row">
                <div className="login-form__field">
                  <label htmlFor="firstName" className="login-form__label">First name</label>
                  <input
                    id="firstName"
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    required
                    disabled={isLoading}
                    className="login-form__input"
                  />
                </div>
                <div className="login-form__field">
                  <label htmlFor="lastName" className="login-form__label">Last name</label>
                  <input
                    id="lastName"
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Doe"
                    required
                    disabled={isLoading}
                    className="login-form__input"
                  />
                </div>
              </div>
            )}

            <div className="login-form__field">
              <label htmlFor="email" className="login-form__label">Email address</label>
              <div className="login-form__input-wrapper">
                <svg className="login-form__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  disabled={isLoading}
                  className="login-form__input login-form__input--with-icon"
                />
              </div>
            </div>

            <div className="login-form__field">
              <div className="login-form__label-row">
                <label htmlFor="password" className="login-form__label">Password</label>
                {isLogin && (
                  <a href="#" className="login-form__forgot">Forgot password?</a>
                )}
              </div>
              <div className="login-form__input-wrapper">
                <svg className="login-form__input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="login-form__input login-form__input--with-icon login-form__input--with-toggle"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="login-form__toggle-password"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="login-form__error">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="login-form__submit"
            >
              {isLoading ? (
                <>
                  <svg className="login-form__spinner" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Please wait...
                </>
              ) : (
                isLogin ? 'Sign in' : 'Create account'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="login-card__toggle">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <button
              type="button"
              onClick={handleToggleMode}
              disabled={isLoading}
              className="login-card__toggle-link"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>

          {/* Footer */}
          <p className="login-card__footer">
            By continuing, you agree to our{' '}
            <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          display: grid;
          min-height: 100vh;
          background: #0a0a0b;
        }
        
        @media (min-width: 1024px) {
          .login-page {
            grid-template-columns: 1fr 1fr;
          }
        }

        /* === Left Visual Panel === */
        .login-visual {
          display: none;
          position: relative;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
          overflow: hidden;
        }
        
        @media (min-width: 1024px) {
          .login-visual {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 3rem;
          }
        }

        .login-visual__overlay {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse at 20% 20%, rgba(236, 72, 153, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse at 50% 50%, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
        }

        .login-visual__content {
          position: relative;
          z-index: 10;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
        }

        .login-visual__logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .login-visual__logo-icon {
          width: 2rem;
          height: 2rem;
          color: #f43f5e;
        }

        .login-visual__logo-text {
          font-size: 1.5rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.025em;
        }

        .login-visual__testimonial {
          max-width: 28rem;
        }

        .login-visual__quote {
          font-size: 1.25rem;
          font-weight: 500;
          line-height: 1.75;
          color: rgba(255, 255, 255, 0.9);
          margin: 0 0 1.5rem 0;
          font-style: italic;
        }

        .login-visual__author {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .login-visual__avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #f43f5e, #fb923c);
        }

        .login-visual__author-name {
          font-weight: 600;
          color: white;
        }

        .login-visual__author-role {
          font-size: 0.875rem;
          color: rgba(255, 255, 255, 0.5);
        }

        /* === Right Form Panel === */
        .login-form-container {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem 1.5rem;
          background: #fafafa;
        }

        @media (min-width: 640px) {
          .login-form-container {
            padding: 3rem 2rem;
          }
        }

        .login-card {
          width: 100%;
          max-width: 400px;
        }

        .login-card__mobile-logo {
          display: flex;
          justify-content: center;
          margin-bottom: 2rem;
        }
        
        @media (min-width: 1024px) {
          .login-card__mobile-logo {
            display: none;
          }
        }

        .login-card__mobile-logo svg {
          width: 3rem;
          height: 3rem;
          color: #f43f5e;
        }

        .login-card__header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        @media (min-width: 1024px) {
          .login-card__header {
            text-align: left;
          }
        }

        .login-card__title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
          letter-spacing: -0.025em;
        }

        .login-card__subtitle {
          font-size: 0.9375rem;
          color: #64748b;
          margin: 0;
        }

        /* === Form Styles === */
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-form__row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }

        .login-form__field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .login-form__label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .login-form__label {
          font-size: 0.875rem;
          font-weight: 500;
          color: #374151;
        }

        .login-form__forgot {
          font-size: 0.8125rem;
          font-weight: 500;
          color: #6366f1;
          text-decoration: none;
          transition: color 0.15s ease;
        }

        .login-form__forgot:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        .login-form__input-wrapper {
          position: relative;
        }

        .login-form__input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          width: 1.125rem;
          height: 1.125rem;
          color: #9ca3af;
          pointer-events: none;
          transition: color 0.15s ease;
        }

        .login-form__input-wrapper:focus-within .login-form__input-icon {
          color: #6366f1;
        }

        .login-form__input {
          width: 100%;
          height: 2.875rem;
          padding: 0 1rem;
          font-size: 0.9375rem;
          color: #1f2937;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 0.625rem;
          outline: none;
          transition: all 0.15s ease;
        }

        .login-form__input::placeholder {
          color: #9ca3af;
        }

        .login-form__input:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
        }

        .login-form__input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .login-form__input--with-icon {
          padding-left: 2.75rem;
        }

        .login-form__input--with-toggle {
          padding-right: 2.75rem;
        }

        .login-form__toggle-password {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          padding: 0;
          background: none;
          border: none;
          border-radius: 0.375rem;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .login-form__toggle-password svg {
          width: 1.125rem;
          height: 1.125rem;
          color: #9ca3af;
          transition: color 0.15s ease;
        }

        .login-form__toggle-password:hover {
          background: #f3f4f6;
        }

        .login-form__toggle-password:hover svg {
          color: #4b5563;
        }

        .login-form__error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.875rem 1rem;
          font-size: 0.875rem;
          color: #dc2626;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 0.625rem;
        }

        .login-form__error svg {
          width: 1.125rem;
          height: 1.125rem;
          flex-shrink: 0;
        }

        .login-form__submit {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          height: 2.875rem;
          margin-top: 0.5rem;
          font-size: 0.9375rem;
          font-weight: 600;
          color: white;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          border: none;
          border-radius: 0.625rem;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .login-form__submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
          transform: translateY(-1px);
        }

        .login-form__submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .login-form__submit:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .login-form__spinner {
          width: 1.25rem;
          height: 1.25rem;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* === Toggle & Footer === */
        .login-card__toggle {
          text-align: center;
          margin-top: 1.5rem;
          font-size: 0.9375rem;
          color: #64748b;
        }

        .login-card__toggle-link {
          font-weight: 600;
          color: #6366f1;
          background: none;
          border: none;
          padding: 0;
          cursor: pointer;
          transition: color 0.15s ease;
        }

        .login-card__toggle-link:hover {
          color: #4f46e5;
          text-decoration: underline;
        }

        .login-card__toggle-link:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-card__footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.8125rem;
          color: #94a3b8;
          line-height: 1.5;
        }

        .login-card__footer a {
          color: #64748b;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color 0.15s ease;
        }

        .login-card__footer a:hover {
          color: #475569;
        }
      `}</style>
    </div>
  );
}