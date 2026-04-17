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

const DEFAULT_IMAGES = {
  'Electronics': '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/default_electronics_1776454948084.png',
  'Fashion': '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/default_fashion_1776454963593.png',
  'Home': '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/default_home_1776454973700.png',
  'Books': '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/default_books_1776454986750.png',
  'Experiences': '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/default_experience_1776455001632.png',
  'General': '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/default_gift_1776455017192.png'
};

export default function DiscoverPage() {
  const { user } = useAuth();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    occasion: 'All Occasions',
    relationship: 'All Relationships'
  });

  useEffect(() => {
    fetchInitialGifts();
  }, []);

  const fetchInitialGifts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const res = await api.get('/discover?limit=10');

      // Use the newly generated premium images for the discovery list
      const premiumImages = [
        '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/discover_product_1_watch_1776454698119.png',
        '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/discover_product_2_speaker_1776454712743.png',
        '/brain/4db9e1ad-6429-44dd-bb48-73fb2286e55f/discover_product_3_candle_1776454728035.png',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80', // Watch
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80', // Red Shoe
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', // Headphones
        'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800&q=80', // Glasses
        'https://images.unsplash.com/photo-1526170315870-ef6846055c9d?w=800&q=80', // Camera
        'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&q=80', // iPad
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&q=80', // Plant
      ];

      const enriched = (Array.isArray(res.data) ? res.data : []).map((item, idx) => ({
        ...item,
        img: premiumImages[idx % premiumImages.length],
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
      const matchRelationship = activeFilters.relationship === 'All Relationships' || gift.relationship === activeFilters.relationship;
      
      return matchOccasion && matchRelationship;
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
          <label>Whom to gift</label>
          <select 
            value={activeFilters.relationship} 
            onChange={(e) => handleFilterChange('relationship', e.target.value)}
          >
            {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </section>

      <div className="discovery-results-meta">
        Showing 10 popular gift ideas
      </div>

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
                    <img 
                      src={gift.img || '/images/default-gift.png'} 
                      alt={gift.name} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-gift.png';
                      }}
                    />
                  </div>
                  <div className="discovery-card-content">
                    <h3>{gift.name}</h3>
                    <p className="discovery-card-subtitle">Popular gift idea</p>
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
