import { useState, useEffect } from 'react';

export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'USD ($)', locale: 'en-US' },
  { code: 'INR', symbol: '₹', label: 'INR (₹)', locale: 'en-IN' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)', locale: 'en-GB' },
  { code: 'CAD', symbol: 'CA$', label: 'CAD (CA$)', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', locale: 'en-AU' },
];

const CURRENCY_KEY = 'wishnest_preferred_currency';

export const getInitialCurrencyGuess = () => {
  try {
    const isIndia =
      navigator.language === 'en-IN' ||
      Intl.DateTimeFormat().resolvedOptions().timeZone === 'Asia/Kolkata';
    return isIndia ? 'INR' : 'USD';
  } catch {
    return 'USD';
  }
};

export const getSelectedCurrency = () => {
  try {
    const stored = localStorage.getItem(CURRENCY_KEY);
    if (stored && SUPPORTED_CURRENCIES.some((c) => c.code === stored)) {
      return stored;
    }
  } catch {
    // storage error
  }
  return getInitialCurrencyGuess();
};

export const setSelectedCurrency = (code) => {
  if (!SUPPORTED_CURRENCIES.some((c) => c.code === code)) return;
  try {
    localStorage.setItem(CURRENCY_KEY, code);
  } catch {
    // storage error
  }
  window.dispatchEvent(new Event('wishnest_currency_change'));
};

export const formatCurrency = (amount, currencyOverride) => {
  const code = currencyOverride || getSelectedCurrency();
  const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
  const num = Number(amount) || 0;

  try {
    return new Intl.NumberFormat(matched.locale, {
      style: 'currency',
      currency: matched.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num);
  } catch {
    return `${matched.symbol}${num.toFixed(2)}`;
  }
};

export const getCurrencySymbol = (currencyOverride) => {
  const code = currencyOverride || getSelectedCurrency();
  const matched = SUPPORTED_CURRENCIES.find((c) => c.code === code) || SUPPORTED_CURRENCIES[0];
  return matched.symbol;
};

/**
 * Custom React Hook to subscribe to currency selection changes
 */
export const useCurrency = () => {
  const [currency, setCurrencyState] = useState(getSelectedCurrency);

  useEffect(() => {
    const handleCurrencyChange = () => {
      setCurrencyState(getSelectedCurrency());
    };

    window.addEventListener('wishnest_currency_change', handleCurrencyChange);
    return () => {
      window.removeEventListener('wishnest_currency_change', handleCurrencyChange);
    };
  }, []);

  const changeCurrency = (newCode) => {
    setSelectedCurrency(newCode);
  };

  return {
    currency,
    changeCurrency,
    format: (amt) => formatCurrency(amt, currency),
    symbol: getCurrencySymbol(currency),
    supported: SUPPORTED_CURRENCIES,
  };
};
