import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ShieldCheck, Sparkles, Filter, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './DiscoverPage.css';

const OCCASIONS = ['All Occasions', 'Birthday', 'Wedding', 'Baby Shower', 'Anniversary', 'Other'];
const CATEGORIES = ['All Categories', 'Electronics', 'Home', 'Fashion', 'Experiences', 'Books'];
const RELATIONSHIPS = ['All', 'Male', 'Female', 'Unisex'];
const BUDGETS = ['All Budgets', '< ₹500', '₹500 - ₹2000', '₹2000 - ₹5000', '> ₹5000'];

const DEFAULT_IMAGES = {
  'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80',
  'Fashion': 'https://images.unsplash.com/photo-1445205170230-053b830c6050?w=800&q=80',
  'Home': 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&q=80',
  'Books': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800&q=80',
  'Experiences': 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80',
  'General': '/images/default-gift.png'
};

const STATIC_GIFTS = [
  {
    id: 1,
    title: 'Nike Air Max Sneaker',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    category: 'Fashion',
    occasion: 'Birthday',
    relationship: 'Unisex'
  },
  {
    id: 2,
    title: 'Apple Watch Series 9',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    category: 'Electronics',
    occasion: 'Anniversary',
    relationship: 'Unisex'
  },
  {
    id: 3,
    title: 'Coach Leather Handbag',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    category: 'Fashion',
    occasion: 'Birthday',
    relationship: 'Female'
  },
  {
    id: 4,
    title: 'Sony Noise Canceling Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    category: 'Electronics',
    occasion: 'Other',
    relationship: 'Unisex'
  },
  {
    id: 5,
    title: 'Ray-Ban Wayfarer Sunglasses',
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f',
    category: 'Fashion',
    occasion: 'Birthday',
    relationship: 'Unisex'
  },
  {
    id: 6,
    title: 'Instax Mini 12 Camera',
    image: 'https://images.unsplash.com/photo-1526170315870-ef6846055c9d',
    category: 'Electronics',
    occasion: 'Birthday',
    relationship: 'Unisex'
  },
  {
    id: 7,
    title: 'Luxury Scented Candle',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59',
    category: 'Home',
    occasion: 'Anniversary',
    relationship: 'Female'
  },
  {
    id: 8,
    title: 'Gold Link Bracelet',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
    category: 'Fashion',
    occasion: 'Wedding',
    relationship: 'Female'
  },
  {
    id: 9,
    title: 'Slim Leather Wallet',
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93',
    category: 'Fashion',
    occasion: 'Birthday',
    relationship: 'Male'
  },
  {
    id: 10,
    title: 'Indoor Potted Olive Tree',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
    category: 'Home',
    occasion: 'Other',
    relationship: 'Unisex'
  }
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const [gifts, setGifts] = useState(STATIC_GIFTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    occasion: 'All Occasions',
    relationship: 'All'
  });

  const fetchInitialGifts = async () => {
    // We already have our top 10 static gifts, so we can just ensure they're loaded
    setGifts(STATIC_GIFTS);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialGifts();
  }, []);

  const filteredGifts = useMemo(() => {
    return gifts.filter(gift => {
      const matchOccasion = activeFilters.occasion === 'All Occasions' || gift.occasion === activeFilters.occasion;
      const matchRelationship = activeFilters.relationship === 'All' || gift.relationship === activeFilters.relationship;
      
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
                <article key={gift.id} className="discovery-card">
                  <div className="discovery-card-media">
                    <img 
                      src={gift.image || '/images/default-gift.png'} 
                      alt={gift.title} 
                      loading="lazy"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/default-gift.png';
                      }}
                    />
                  </div>
                  <div className="discovery-card-content">
                    <h3>{gift.title}</h3>
                    <p className="discovery-card-subtitle">Popular gift idea</p>
                    <div className="discovery-card-tags">
                      <span className="tag tag--category">{gift.category}</span>
                      <span className="tag tag--occasion">{gift.occasion || 'Personal'}</span>
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
