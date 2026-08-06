import { Globe } from 'lucide-react';
import { useCurrency } from '../utils/currency';
import './CurrencySelector.css';

export default function CurrencySelector({ compact = false }) {
  const { currency, changeCurrency, supported } = useCurrency();

  return (
    <div className={`currency-selector ${compact ? 'compact' : ''}`}>
      <Globe size={14} className="currency-icon" aria-hidden="true" />
      <select
        value={currency}
        onChange={(e) => changeCurrency(e.target.value)}
        className="currency-dropdown"
        aria-label="Select preferred currency"
        title="Change displayed currency"
      >
        {supported.map((c) => (
          <option key={c.code} value={c.code}>
            {compact ? c.symbol : c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
