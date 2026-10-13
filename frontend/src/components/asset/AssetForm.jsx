import { useState, useEffect, useRef } from 'react';

export const AssetForm = ({
  onSubmit,
  onCancel,
  submitLabel = 'Add asset',
}) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    assetType: 'STOCK',
    currentPrice: '',
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const symbolInputRef = useRef(null);

  useEffect(() => {
    symbolInputRef.current?.focus();
  }, []);

  // Escape key cancels
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && onCancel) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'symbol' ? value.toUpperCase() : value,
    }));

    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (generalError) {
      setGeneralError('');
    }
  };

  const validate = () => {
    const errors = {};
    const trimmedSymbol = formData.symbol.trim();
    const trimmedName = formData.name.trim();
    const priceNum = Number(formData.currentPrice);

    if (!trimmedSymbol) {
      errors.symbol = 'Symbol is required.';
    } else if (trimmedSymbol.length > 20) {
      errors.symbol = 'Symbol must not exceed 20 characters.';
    }

    if (!trimmedName) {
      errors.name = 'Asset name is required.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Name must not exceed 100 characters.';
    }

    if (!formData.currentPrice || isNaN(priceNum) || priceNum <= 0) {
      errors.currentPrice = 'Current price must be a positive number.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        symbol: formData.symbol.trim().toUpperCase(),
        name: formData.name.trim(),
        assetType: formData.assetType,
        currentPrice: Number(formData.currentPrice),
      });
    } catch (err) {
      const resp = err.response?.data;
      const errorMessage = resp?.message || err.message || 'Failed to add asset.';

      // Check if duplicate symbol conflict (409) or validation error on symbol
      if (
        err.response?.status === 409 ||
        errorMessage.toLowerCase().includes('already exists') ||
        errorMessage.toLowerCase().includes('symbol')
      ) {
        setFieldErrors((prev) => ({
          ...prev,
          symbol: errorMessage,
        }));
      } else if (resp?.validationErrors) {
        const nextErrors = {};
        if (resp.validationErrors.symbol) nextErrors.symbol = resp.validationErrors.symbol;
        if (resp.validationErrors.name) nextErrors.name = resp.validationErrors.name;
        if (resp.validationErrors.currentPrice) nextErrors.currentPrice = resp.validationErrors.currentPrice;
        setFieldErrors(nextErrors);
      } else {
        setGeneralError(errorMessage);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Symbol field */}
      <div>
        <label
          htmlFor="asset-symbol-input"
          className="block text-xs font-medium text-ink uppercase tracking-wider mb-1"
        >
          Symbol
        </label>
        <input
          ref={symbolInputRef}
          id="asset-symbol-input"
          name="symbol"
          type="text"
          value={formData.symbol}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={20}
          placeholder="e.g. AAPL, INFY, VOO"
          className={`w-full border ${
            fieldErrors.symbol ? 'border-loss' : 'border-rule'
          } bg-surface rounded-sm px-3 py-2 text-sm text-ink uppercase placeholder:normal-case placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50`}
        />
        {fieldErrors.symbol && (
          <p id="asset-symbol-error" className="mt-1 text-xs text-loss">
            {fieldErrors.symbol}
          </p>
        )}
      </div>

      {/* Name field */}
      <div>
        <label
          htmlFor="asset-name-input"
          className="block text-xs font-medium text-ink uppercase tracking-wider mb-1"
        >
          Name
        </label>
        <input
          id="asset-name-input"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          disabled={isSubmitting}
          maxLength={100}
          placeholder="e.g. Apple Inc., Infosys Ltd"
          className={`w-full border ${
            fieldErrors.name ? 'border-loss' : 'border-rule'
          } bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50`}
        />
        {fieldErrors.name && (
          <p id="asset-name-error" className="mt-1 text-xs text-loss">
            {fieldErrors.name}
          </p>
        )}
      </div>

      {/* Asset Type field */}
      <div>
        <label
          htmlFor="asset-type-select"
          className="block text-xs font-medium text-ink uppercase tracking-wider mb-1"
        >
          Type
        </label>
        <select
          id="asset-type-select"
          name="assetType"
          value={formData.assetType}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full border border-rule bg-surface rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50"
        >
          <option value="STOCK">Stock</option>
          <option value="MUTUAL_FUND">Mutual Fund</option>
        </select>
      </div>

      {/* Current Price field */}
      <div>
        <label
          htmlFor="asset-price-input"
          className="block text-xs font-medium text-ink uppercase tracking-wider mb-1"
        >
          Current price
        </label>
        <div className="relative">
          <input
            id="asset-price-input"
            name="currentPrice"
            type="number"
            step="0.01"
            min="0.01"
            value={formData.currentPrice}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="0.00"
            className={`w-full border ${
              fieldErrors.currentPrice ? 'border-loss' : 'border-rule'
            } bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 tabular-nums`}
          />
        </div>
        {fieldErrors.currentPrice && (
          <p id="asset-price-error" className="mt-1 text-xs text-loss">
            {fieldErrors.currentPrice}
          </p>
        )}
      </div>

      {/* General error fallback */}
      {generalError && (
        <p id="asset-general-error" className="text-xs text-loss">
          {generalError}
        </p>
      )}

      {/* Footer actions */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-rule">
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
          id="asset-form-submit"
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-surface text-sm font-medium px-4 py-1.5 rounded-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
        >
          {isSubmitting ? 'Adding...' : submitLabel}
        </button>
      </div>
    </form>
  );
};

export default AssetForm;
