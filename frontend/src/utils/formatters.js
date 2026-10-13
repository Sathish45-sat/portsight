/**
 * Shared Indian Rupee currency and percentage formatters
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return inrFormatter.format(0);
  }
  return inrFormatter.format(Number(amount));
};

export const formatSignedCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return inrFormatter.format(0);
  }
  const numeric = Number(amount);
  const formatted = inrFormatter.format(Math.abs(numeric));
  if (numeric > 0) return `+${formatted}`;
  if (numeric < 0) return `−${formatted}`;
  return formatted;
};

export const formatSignedPercent = (percent) => {
  if (percent === null || percent === undefined || isNaN(percent)) {
    return '0.00%';
  }
  const numeric = Number(percent);
  const formatted = `${Math.abs(numeric).toFixed(2)}%`;
  if (numeric > 0) return `+${formatted}`;
  if (numeric < 0) return `−${formatted}`;
  return formatted;
};

export const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 4,
  }).format(Number(value));
};

export const formatQuantity = (value) => {
  if (value === null || value === undefined || isNaN(value)) {
    return '0';
  }
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 6,
    minimumFractionDigits: 0,
  }).format(Number(value));
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '—';
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '—';
  }
};

