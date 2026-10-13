import { useState, useEffect, useRef } from 'react';

const getDefaultLocalDateTime = () => {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
};

export const TransactionForm = ({
  asset,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    type: 'BUY',
    quantity: '',
    pricePerUnit: asset?.currentPrice ? String(asset.currentPrice) : '',
    transactionDate: getDefaultLocalDateTime(),
  });

  const [clientErrors, setClientErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const quantityInputRef = useRef(null);

  const heldQuantity = Number(asset?.quantityHeld ?? 0);

  useEffect(() => {
    quantityInputRef.current?.focus();
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
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (clientErrors[name]) {
      setClientErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (backendError) {
      setBackendError('');
    }
  };

  const validate = () => {
    const errors = {};
    const qtyNum = Number(formData.quantity);
    const priceNum = Number(formData.pricePerUnit);

    // Quantity validation: positive, max 6 decimal places
    if (!formData.quantity || isNaN(qtyNum) || qtyNum <= 0) {
      errors.quantity = 'Quantity must be a positive number.';
    } else {
      const qtyDecimals = (formData.quantity.split('.')[1] || '').length;
      if (qtyDecimals > 6) {
        errors.quantity = 'Quantity cannot exceed 6 decimal places.';
      }
    }

    // SELL check: cannot exceed holdings
    if (formData.type === 'SELL' && !errors.quantity) {
      if (heldQuantity <= 0) {
        errors.quantity = `No units held (${heldQuantity}). Cannot record SELL trade.`;
      } else if (qtyNum > heldQuantity) {
        errors.quantity = `Quantity (${qtyNum}) exceeds current holdings (${heldQuantity}).`;
      }
    }

    // Price validation: positive, max 4 decimal places
    if (!formData.pricePerUnit || isNaN(priceNum) || priceNum <= 0) {
      errors.pricePerUnit = 'Price per unit must be a positive number.';
    } else {
      const priceDecimals = (formData.pricePerUnit.split('.')[1] || '').length;
      if (priceDecimals > 4) {
        errors.pricePerUnit = 'Price cannot exceed 4 decimal places.';
      }
    }

    // Date validation
    if (!formData.transactionDate) {
      errors.transactionDate = 'Transaction date is required.';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setClientErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        type: formData.type,
        quantity: formData.quantity,
        pricePerUnit: formData.pricePerUnit,
        transactionDate: formData.transactionDate,
      });
    } catch (err) {
      // Backend error format: error.response.data.message
      const message =
        err.response?.data?.message ||
        (err.response?.data?.validationErrors
          ? Object.values(err.response.data.validationErrors).join('. ')
          : null) ||
        err.message ||
        'Transaction failed to process. Please retry.';
      setBackendError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      {/* Asset Identifier Header */}
      <div className="pb-2 border-b border-rule flex items-center justify-between">
        <div>
          <span className="font-semibold text-ink text-sm">{asset?.symbol}</span>
          <span className="text-xs text-muted ml-2">{asset?.name}</span>
        </div>
        <div className="text-right text-xs text-muted">
          Current holdings:{' '}
          <span className="font-medium text-ink tabular-nums">
            {heldQuantity}
          </span>
        </div>
      </div>

      {/* Transaction Type selection */}
      <div>
        <label className="block text-xs font-medium text-ink uppercase tracking-wider mb-1.5">
          Type
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, type: 'BUY' }));
              if (clientErrors.quantity) setClientErrors((prev) => ({ ...prev, quantity: '' }));
            }}
            disabled={isSubmitting}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-sm border cursor-pointer transition-colors ${
              formData.type === 'BUY'
                ? 'bg-ink text-surface border-ink'
                : 'bg-surface text-ink border-rule hover:bg-slate-50'
            }`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData((prev) => ({ ...prev, type: 'SELL' }));
              if (clientErrors.quantity) setClientErrors((prev) => ({ ...prev, quantity: '' }));
            }}
            disabled={isSubmitting}
            className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-sm border cursor-pointer transition-colors ${
              formData.type === 'SELL'
                ? 'bg-ink text-surface border-ink'
                : 'bg-surface text-ink border-rule hover:bg-slate-50'
            }`}
          >
            SELL
          </button>
        </div>
      </div>

      {/* Quantity field */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <label
            htmlFor="tx-quantity-input"
            className="block text-xs font-medium text-ink uppercase tracking-wider"
          >
            Quantity
          </label>
          {formData.type === 'SELL' && (
            <span
              id="tx-quantity-held-hint"
              className="text-xs text-muted tabular-nums"
            >
              Held: {heldQuantity}
            </span>
          )}
        </div>
        <input
          ref={quantityInputRef}
          id="tx-quantity-input"
          name="quantity"
          type="number"
          step="0.000001"
          min="0.000001"
          value={formData.quantity}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="e.g. 10 or 0.5"
          className={`w-full border ${
            clientErrors.quantity ? 'border-loss' : 'border-rule'
          } bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 tabular-nums`}
        />
        {clientErrors.quantity && (
          <p id="tx-quantity-error" className="mt-1 text-xs text-loss">
            {clientErrors.quantity}
          </p>
        )}
      </div>

      {/* Price per unit field */}
      <div>
        <label
          htmlFor="tx-price-input"
          className="block text-xs font-medium text-ink uppercase tracking-wider mb-1"
        >
          Price per unit
        </label>
        <input
          id="tx-price-input"
          name="pricePerUnit"
          type="number"
          step="0.0001"
          min="0.0001"
          value={formData.pricePerUnit}
          onChange={handleChange}
          disabled={isSubmitting}
          placeholder="0.00"
          className={`w-full border ${
            clientErrors.pricePerUnit ? 'border-loss' : 'border-rule'
          } bg-surface rounded-sm px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50 tabular-nums`}
        />
        {clientErrors.pricePerUnit && (
          <p id="tx-price-error" className="mt-1 text-xs text-loss">
            {clientErrors.pricePerUnit}
          </p>
        )}
      </div>

      {/* Transaction Date field */}
      <div>
        <label
          htmlFor="tx-date-input"
          className="block text-xs font-medium text-ink uppercase tracking-wider mb-1"
        >
          Transaction date & time
        </label>
        <input
          id="tx-date-input"
          name="transactionDate"
          type="datetime-local"
          value={formData.transactionDate}
          onChange={handleChange}
          disabled={isSubmitting}
          className={`w-full border ${
            clientErrors.transactionDate ? 'border-loss' : 'border-rule'
          } bg-surface rounded-sm px-3 py-2 text-sm text-ink focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent disabled:opacity-50`}
        />
        {clientErrors.transactionDate && (
          <p id="tx-date-error" className="mt-1 text-xs text-loss">
            {clientErrors.transactionDate}
          </p>
        )}
      </div>

      {/* Backend plain text error message */}
      {backendError && (
        <div id="tx-backend-error" className="p-2.5 border border-loss/30 bg-loss/5 rounded-sm">
          <p className="text-xs text-loss font-mono">
            {backendError}
          </p>
        </div>
      )}

      {/* Form actions */}
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
          id="tx-form-submit"
          type="submit"
          disabled={isSubmitting}
          className="bg-accent text-surface text-sm font-medium px-4 py-1.5 rounded-sm hover:opacity-95 disabled:opacity-50 transition-opacity cursor-pointer focus-visible:ring-1 focus-visible:ring-accent"
        >
          {isSubmitting ? 'Recording trade...' : `Record ${formData.type}`}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm;
