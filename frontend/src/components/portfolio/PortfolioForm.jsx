import { useState, useEffect, useRef } from 'react';

export const PortfolioForm = ({
  initialName = '',
  onSubmit,
  onCancel,
  submitLabel = 'Save changes',
}) => {
  const [name, setName] = useState(initialName);
  const [clientError, setClientError] = useState('');
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setName(initialName);
    inputRef.current?.focus();
  }, [initialName]);

  // Handle Escape key to cancel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setClientError('');
    setBackendError('');

    const trimmed = name.trim();
    if (!trimmed) {
      setClientError('Portfolio name is required.');
      return;
    }

    if (trimmed.length > 100) {
      setClientError('Portfolio name must not exceed 100 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(trimmed);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.data?.validationErrors
          ? Object.values(err.response.data.validationErrors).join('. ')
          : null) ||
        err.message ||
        'Unable to save portfolio. Please try again.';
      setBackendError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedError = clientError || backendError;

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div>
        <label
          className="block text-sm text-ink mb-1.5"
          htmlFor="portfolio-name-input"
        >
          Portfolio name
        </label>
        <input
          ref={inputRef}
          id="portfolio-name-input"
          type="text"
          value={name}
          maxLength={105}
          onChange={(e) => {
            setName(e.target.value);
            if (clientError) setClientError('');
            if (backendError) setBackendError('');
          }}
          disabled={isSubmitting}
          placeholder="e.g. Long-term equity"
          className="w-full border border-rule bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
          required
        />
        {displayedError && (
          <p id="portfolio-form-error" className="mt-1.5 text-xs text-loss">
            {displayedError}
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-rule">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="text-sm text-muted hover:text-ink px-3 py-1.5 border border-rule rounded-sm cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
        )}
        <button
          id="portfolio-form-submit"
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-surface text-sm font-medium px-3.5 py-1.5 rounded-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
        >
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default PortfolioForm;
