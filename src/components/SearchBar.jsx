import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, List, Package, X, Loader2 } from 'lucide-react';
import api from '../utils/api';
import './SearchBar.css';

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState({ wishlists: [], items: [] });
  const [loading, setLoading] = useState(false);
  const [open, setOpen]       = useState(false);
  const [touched, setTouched] = useState(false); // has the user typed at least once?

  const wrapperRef = useRef(null);
  const inputRef   = useRef(null);
  const debounceRef = useRef(null);

  // ── Close dropdown on outside click ──────────────────────
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // ── Debounced search ──────────────────────────────────────
  const doSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ wishlists: [], items: [] });
      setOpen(false);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/search?q=${encodeURIComponent(q.trim())}`);
      const data = res.data;
      setResults({
        wishlists: Array.isArray(data.wishlists) ? data.wishlists : [],
        items:     Array.isArray(data.items)     ? data.items     : [],
      });
      setOpen(true);
    } catch {
      setResults({ wishlists: [], items: [] });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setTouched(true);

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleClear = () => {
    setQuery('');
    setResults({ wishlists: [], items: [] });
    setOpen(false);
    setTouched(false);
    inputRef.current?.focus();
  };

  const handleSubmit = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      e.preventDefault();
      setOpen(false);
      navigate(`/discover?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const totalResults = results.wishlists.length + results.items.length;
  const noResults    = touched && !loading && query.trim() && totalResults === 0;

  return (
    <div className="sb-wrapper" ref={wrapperRef}>
      {/* ── Input ── */}
      <div className={`sb-input-row ${open || loading ? 'focused' : ''}`}>
        {loading
          ? <Loader2 size={17} className="sb-icon sb-spin" />
          : <Search   size={17} className="sb-icon" />
        }
        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleSubmit}
          onFocus={() => { if (totalResults > 0) setOpen(true); }}
          placeholder="Search wishlists or items..."
          autoComplete="off"
          aria-label="Search wishlists or items"
          aria-expanded={open}
          aria-haspopup="listbox"
          role="combobox"
        />
        {query && (
          <button className="sb-clear-btn" onClick={handleClear} aria-label="Clear search">
            <X size={15} />
          </button>
        )}
      </div>

      {/* ── Dropdown ── */}
      {(open || noResults) && (
        <div className="sb-dropdown" role="listbox" aria-label="Search results">

          {/* Loading skeleton */}
          {loading && (
            <div className="sb-state-msg">
              <Loader2 size={16} className="sb-spin" />
              <span>Searching…</span>
            </div>
          )}

          {/* No results */}
          {noResults && (
            <div className="sb-state-msg sb-no-results">
              <Search size={16} />
              <span>No results found for <strong>"{query}"</strong></span>
            </div>
          )}

          {/* Wishlists section */}
          {!loading && results.wishlists.length > 0 && (
            <div className="sb-section">
              <p className="sb-section-label">
                <List size={13} /> Wishlists
              </p>
              <ul>
                {results.wishlists.map((wl) => (
                  <li key={wl._id} className="sb-item" role="option">
                    <div className="sb-item-icon sb-icon-wishlist">
                      <List size={14} />
                    </div>
                    <div className="sb-item-text">
                      <span className="sb-item-name">{wl.name}</span>
                      {wl.occasion && (
                        <span className="sb-item-meta">{wl.occasion}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Items section */}
          {!loading && results.items.length > 0 && (
            <div className="sb-section">
              <p className="sb-section-label">
                <Package size={13} /> Items
              </p>
              <ul>
                {results.items.map((item) => (
                  <li key={item._id} className="sb-item" role="option">
                    <div className="sb-item-icon sb-icon-item">
                      <Package size={14} />
                    </div>
                    <div className="sb-item-text">
                      <span className="sb-item-name">{item.name}</span>
                      {item.notes && (
                        <span className="sb-item-meta">{item.notes}</span>
                      )}
                    </div>
                    {item.purchased && (
                      <span className="sb-badge sb-badge-purchased">Purchased</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Result count footer */}
          {!loading && totalResults > 0 && (
            <div className="sb-footer">
              {totalResults} result{totalResults !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      )}
    </div>
  );
}
