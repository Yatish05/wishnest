import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Sparkles, Globe, Gift, ArrowUpRight } from 'lucide-react';
import api from '../utils/api';
import './DiscoverPage.css';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(Boolean(searchParams.get('q')));
  const [error, setError] = useState('');

  const handleSearch = async (nextQuery = search, updateUrl = true) => {
    const trimmed = nextQuery.trim();
    setSearch(trimmed);
    if (updateUrl) {
      setSearchParams(trimmed ? { q: trimmed } : {});
    }
    setSearched(Boolean(trimmed));

    if (!trimmed) {
      setItems([]);
      setError('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/discover?q=${encodeURIComponent(trimmed)}`);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Discover gifts error:', err);
      setError('Unable to load gift ideas right now.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const nextQuery = searchParams.get('q') || '';
    setSearch(nextQuery);

    if (!nextQuery) {
      setItems([]);
      setSearched(false);
      setError('');
      return;
    }

    handleSearch(nextQuery, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSubmit = (e) => {
    e.preventDefault();
    handleSearch(search);
  };

  return (
    <div className="discover-page animate-fade-in">
      <section className="discover-hero">
        <div className="discover-hero-copy">
          <div className="discover-kicker">
            <Sparkles size={14} />
            <span>Public gift discovery</span>
          </div>
          <h1>Discover gifts from public wishlists.</h1>
          <p>
            Search prompts like <strong>gift for boys</strong> or <strong>gift for girls</strong> to explore ideas
            shared by the WishNest community.
          </p>
        </div>
        <div className="discover-hero-badge">
          <Globe size={16} />
          <span>Only public wishlists are included</span>
        </div>
      </section>

      <form className="discover-search-panel" onSubmit={handleSubmit}>
        <div className="discover-search-input">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search gift ideas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? 'Searching...' : 'Discover Gifts'}
        </button>
      </form>

      <div className="discover-suggestions">
        {['gift for boys', 'gift for girls', 'unisex birthday gift'].map((suggestion) => (
          <button
            key={suggestion}
            className="discover-suggestion-chip"
            onClick={() => handleSearch(suggestion)}
            type="button"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {error && <div className="discover-state discover-error">{error}</div>}

      {!error && !loading && !searched && (
        <div className="discover-state">
          Start with a search to explore items from public wishlists.
        </div>
      )}

      {!error && !loading && searched && items.length === 0 && (
        <div className="discover-state">
          No public wishlist items matched this search yet.
        </div>
      )}

      {items.length > 0 && (
        <div className="discover-results-header">
          <h2>Gift Ideas</h2>
          <p>{items.length} public items found</p>
        </div>
      )}

      <div className="discover-grid">
        {items.map((item) => (
          <article key={item._id} className="discover-card">
            <div className="discover-card-image">
              {item.img ? (
                <img src={item.img} alt={item.name} />
              ) : (
                <div className="discover-card-placeholder">
                  <Gift size={36} />
                </div>
              )}
            </div>

            <div className="discover-card-body">
              <div className="discover-card-meta">
                <span className="discover-card-pill">{item.wishlistGender || 'unisex'}</span>
                <span className="discover-card-pill">{item.wishlistOccasion || 'Other'}</span>
              </div>
              <h3>{item.name}</h3>
              <p>{item.notes || 'Gift idea from a public wishlist.'}</p>
              <div className="discover-card-footer">
                <div>
                  <span className="discover-card-label">From wishlist</span>
                  <strong>{item.wishlistName}</strong>
                </div>
                {item.link && (
                  <a
                    href={item.link}
                    className="discover-card-link"
                    target="_blank"
                    rel="noreferrer"
                  >
                    View <ArrowUpRight size={15} />
                  </a>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
