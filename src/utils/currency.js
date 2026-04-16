/**
 * Formats a numeric amount into a currency string based on the user's locale.
 * Priority: 
 * - en-IN or Asia/Kolkata timezone -> INR (₹)
 * - Everything else -> USD ($)
 */
export const formatCurrency = (amount) => {
  const isIndia = 
    navigator.language === 'en-IN' || 
    Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';

  const currency = isIndia ? 'INR' : 'USD';
  const locale = isIndia ? 'en-IN' : 'en-US';

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const getCurrencySymbol = () => {
  const isIndia = 
    navigator.language === 'en-IN' || 
    Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
  
  return isIndia ? '₹' : '$';
};
