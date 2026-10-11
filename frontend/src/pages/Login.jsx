import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setFormError('');

    if (!email.trim()) {
      setEmailError('Enter your email address.');
      isValid = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setEmailError('Enter a valid email format, like name@example.com.');
        isValid = false;
      }
    }

    if (!password) {
      setPasswordError('Enter your password.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/portfolios');
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        (err.response?.data?.validationErrors
          ? Object.values(err.response.data.validationErrors).join('. ')
          : null) ||
        err.message ||
        'Check your email and password and try again.';
      setFormError(backendMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-ink flex flex-col justify-center px-4 py-12">
      <div className="w-full max-w-sm mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            Sign in
          </h1>
          <p className="text-sm text-muted mt-1">
            Access your investment portfolios and analytics.
          </p>
        </div>

        {formError && (
          <div
            id="login-error-alert"
            className="mb-6 p-3 border border-loss/40 bg-surface text-sm text-loss rounded-sm"
            role="alert"
          >
            {formError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label
              className="block text-sm text-ink mb-1.5"
              htmlFor="email-input"
            >
              Email address
            </label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
              disabled={isSubmitting}
              className="w-full border border-rule bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
              autoComplete="email"
              required
            />
            {emailError && (
              <p className="mt-1 text-xs text-loss">{emailError}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm text-ink mb-1.5"
              htmlFor="password-input"
            >
              Password
            </label>
            <input
              id="password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              disabled={isSubmitting}
              className="w-full border border-rule bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
              autoComplete="current-password"
              required
            />
            {passwordError && (
              <p className="mt-1 text-xs text-loss">{passwordError}</p>
            )}
          </div>

          <button
            id="login-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-surface text-sm font-medium py-2 px-4 rounded-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-rule text-sm text-muted">
          New to PortSight?{' '}
          <Link
            to="/register"
            id="link-to-register"
            className="text-accent hover:underline"
          >
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
