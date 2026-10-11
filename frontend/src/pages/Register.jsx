import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
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
      setPasswordError('Enter a password.');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Confirm your password.');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
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
      await register(email.trim(), password);
      navigate('/portfolios');
    } catch (err) {
      const backendMessage =
        err.response?.data?.message ||
        (err.response?.data?.validationErrors
          ? Object.values(err.response.data.validationErrors).join('. ')
          : null) ||
        err.message ||
        'Unable to create account. Check your details and try again.';
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
            Create account
          </h1>
          <p className="text-sm text-muted mt-1">
            Track stocks, mutual funds, and analytics in one place.
          </p>
        </div>

        {formError && (
          <div
            id="register-error-alert"
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
              htmlFor="register-email-input"
            >
              Email address
            </label>
            <input
              id="register-email-input"
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
              htmlFor="register-password-input"
            >
              Password
            </label>
            <input
              id="register-password-input"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (passwordError) setPasswordError('');
              }}
              disabled={isSubmitting}
              className="w-full border border-rule bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
              autoComplete="new-password"
              required
            />
            {passwordError && (
              <p className="mt-1 text-xs text-loss">{passwordError}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm text-ink mb-1.5"
              htmlFor="register-confirm-password-input"
            >
              Confirm password
            </label>
            <input
              id="register-confirm-password-input"
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              disabled={isSubmitting}
              className="w-full border border-rule bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
              autoComplete="new-password"
              required
            />
            {confirmPasswordError && (
              <p className="mt-1 text-xs text-loss">{confirmPasswordError}</p>
            )}
          </div>

          <button
            id="register-submit-button"
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-accent text-surface text-sm font-medium py-2 px-4 rounded-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
          >
            {isSubmitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-rule text-sm text-muted">
          Already have an account?{' '}
          <Link
            to="/login"
            id="link-to-login"
            className="text-accent hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
