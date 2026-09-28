export const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

export const fmtCurrencyPrecise = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(n || 0);

export const fmtNumber = (n) => new Intl.NumberFormat('en-IN').format(n || 0);

export const fmtPercent = (n) => `${(n || 0).toFixed(1)}%`;
