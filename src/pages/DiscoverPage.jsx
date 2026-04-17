import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ShieldCheck, Sparkles, Filter, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './DiscoverPage.css';

const OCCASIONS = ['All Occasions', 'Birthday', 'Wedding', 'Baby Shower', 'Anniversary', 'Other'];
const CATEGORIES = ['All Categories', 'Electronics', 'Home', 'Fashion', 'Experiences', 'Books'];
const RELATIONSHIPS = ['All Relationships', 'Family', 'Friends', 'Partner', 'Colleagues'];
const BUDGETS = ['All Budgets', '< ₹500', '₹500 - ₹2000', '₹2000 - ₹5000', '> ₹5000'];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    occasion: 'All Occasions',
    category: 'All Categories',
    relationship: 'All Relationships',
    budget: 'All Budgets'
  });

  useEffect(() => {
    fetchInitialGifts();
  }, []);

  const fetchInitialGifts = async () => {
    try {
      setLoading(true);
      setError('');
      // Fetch exactly first 10
      const res = await api.get('/discover?limit=10');
      
      // Since it's exactly the first 10, we don't shuffle.
      // We also enrich with mock data for fields missing in DB for demonstration
      const enriched = (Array.isArray(res.data) ? res.data : []).map((item, idx) => ({
        ...item,
        category: CATEGORIES[1 + (idx % (CATEGORIES.length - 1))],
        relationship: RELATIONSHIPS[idx % RELATIONSHIPS.length],
        priceValue: [400, 1500, 3000, 6000][idx % 4]
      }));
      
      setGifts(enriched);
    } catch (err) {
      console.error('Discover fetch error:', err);
      setError('Unable to load gift ideas. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchOccasion = activeFilters.occasion === 'All Occasions' || gift.wishlistOccasion === activeFilters.occasion;
      const matchCategory = activeFilters.category === 'All Categories' || gift.category === activeFilters.category;
      const matchRelationship = activeFilters.relationship === 'All Relationships' || gift.relationship === activeFilters.relationship;
      
      let matchBudget = true;
      if (activeFilters.budget !== 'All Budgets') {
        const val = gift.priceValue;
        if (activeFilters.budget === '< ₹500') matchBudget = val < 500;
        else if (activeFilters.budget === '₹500 - ₹2000') matchBudget = val >= 500 && val <= 2000;
        else if (activeFilters.budget === '₹2000 - ₹5000') matchBudget = val >= 2000 && val <= 5000;
        else if (activeFilters.budget === '> ₹5000') matchBudget = val > 5000;
      }

      return matchOccasion && matchCategory && matchRelationship && matchBudget;
    });
  }, [gifts, activeFilters]);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSeeMore = () => {
    if (!user) {
      setShowLoginPrompt(true);
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    } else {
      // Logic for logged in users to load more would go here
      console.log('Loading more gifts for authenticated user...');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/api/auth/google';
  };

  return (
    <div className="discovery-container">
      <header className="discovery-header">
        <div className="discovery-badge">
          <Sparkles size={14} />
          <span>Community Favorites</span>
        </div>
        <h1>Find the perfect gift in seconds.</h1>
        <p>Tell us the person and occasion — we&apos;ll suggest gifts they&apos;ll actually love.</p>
      </header>

      <section className="discovery-filters">
        <div className="filter-group">
          <label><Filter size={14} /> Occasion</label>
          <select 
            value={activeFilters.occasion} 
            onChange={(e) => handleFilterChange('occasion', e.target.value)}
          >
            {OCCASIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Category</label>
          <select 
            value={activeFilters.category} 
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Relationship</label>
          <select 
            value={activeFilters.relationship} 
            onChange={(e) => handleFilterChange('relationship', e.target.value)}
          >
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Budget</label>
          <select 
            value={activeFilters.budget} 
            onChange={(e) => handleFilterChange('budget', e.target.value)}
          >
            {BUDGETS.map(b => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>
      </section>

      {loading ? (
        <div className="discovery-loading">
          <div className="spinner"></div>
          <p>Curating the best gift ideas...</p>
        </div>
      ) : error ? (
        <div className="discovery-error-state">
          <p>{error}</p>
          <button onClick={fetchInitialGifts} className="btn btn-secondary">Retry</button>
        </div>
      ) : (
        <>
          <div className="discovery-grid">
            {filteredGifts.length > 0 ? (
              filteredGifts.map((gift) => (
                <article key={gift._id} className="discovery-card">
                  <div className="discovery-card-media">
                    {gift.img ? (
                      <img src={gift.img} alt={gift.name} loading="lazy" />
                    ) : (
                      <div className="discovery-card-placeholder">
                        <Gift size={32} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="discovery-card-content">
                    <h3>{gift.name}</h3>
                    <div className="discovery-card-tags">
                      <span className="tag tag--category">{gift.category}</span>
                      <span className="tag tag--occasion">{gift.wishlistOccasion || 'Personal'}</span>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="discovery-empty">
                <p>No gifts match your current filters within the top 10 results.</p>
                <button 
                  className="btn-soft" 
                  onClick={() => setActiveFilters({
                    occasion: 'All Occasions',
                    category: 'All Categories',
                    relationship: 'All Relationships',
                    budget: 'All Budgets'
                  })}
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          <div className="discovery-footer">
            {!showLoginPrompt ? (
              <button className="btn btn-primary btn-lg" onClick={handleSeeMore}>
                See more gift ideas
              </button>
            ) : (
              <div className="discovery-login-prompt animate-slide-up">
                <div className="prompt-content">
                  <div className="prompt-icon">
                    <Lock size={24} />
                  </div>
                  <h2>Unlock more gift ideas</h2>
                  <p>Create your free account to continue exploring personalized suggestions.</p>
                  <div className="prompt-actions">
                    <button className="btn btn-google" onClick={handleGoogleLogin}>
                      <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                      Continue with Google
                    </button>
                    <Link to="/signup" className="btn btn-primary">Create account</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
