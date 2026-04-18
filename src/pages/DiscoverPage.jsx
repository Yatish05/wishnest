import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Gift, ShieldCheck, Sparkles, Filter, Lock } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import './DiscoverPage.css';

const OCCASIONS = ['All Occasions', 'Birthday', 'Wedding', 'Baby Shower', 'Anniversary', 'Other'];
const CATEGORIES = ['All Categories', 'Home', 'Experiences', 'Books', 'Other'];
const RELATIONSHIPS = ['All', 'Family', 'Friends', 'Partner', 'Colleagues', 'Self'];

const STATIC_GIFTS = [
  {
    id: 1,
    title: 'Luxury Scented Candle',
    image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59',
    category: 'Home',
    occasion: 'Anniversary',
    relationship: 'Partner'
  },
  {
    id: 2,
    title: 'Apple Watch Series 9',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    category: 'Home', // Adjusted since Electronics is removed
    occasion: 'Anniversary',
    relationship: 'Partner'
  },
  {
    id: 3,
    title: 'Coach Leather Handbag',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3',
    category: 'Other',
    occasion: 'Birthday',
    relationship: 'Family'
  },
  {
    id: 4,
    title: 'Sony Noise Canceling Headphones',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    category: 'Experiences',
    occasion: 'Other',
    relationship: 'Self'
  },
  {
    id: 5,
    title: 'Instax Mini 12 Camera',
    image: 'https://images.unsplash.com/photo-1526170315870-ef6846055c9d',
    category: 'Experiences',
    occasion: 'Birthday',
    relationship: 'Friends'
  },
  {
    id: 6,
    title: 'Gold Link Bracelet',
    image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338',
    category: 'Other',
    occasion: 'Wedding',
    relationship: 'Family'
  },
  {
    id: 7,
    title: 'Indoor Potted Olive Tree',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411',
    category: 'Home',
    occasion: 'Other',
    relationship: 'Family'
  },
  {
    id: 8,
    title: 'Premium Coffee Maker',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6',
    category: 'Home',
    occasion: 'Wedding',
    relationship: 'Family'
  },
  {
    id: 9,
    title: 'Weekend Spa Retreat',
    image: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874',
    category: 'Experiences',
    occasion: 'Anniversary',
    relationship: 'Partner'
  },
  {
    id: 10,
    title: 'The Great Gatsby - Collector Edition',
    image: 'https://images.unsplash.com/photo-1543005128-d1b210a56d95',
    category: 'Books',
    occasion: 'Birthday',
    relationship: 'Friends'
  },
  {
    id: 11,
    title: 'Wireless Earpods Pro',
    image: 'https://images.unsplash.com/photo-1588423770674-f2855ee82639',
    category: 'Other',
    occasion: 'Birthday',
    relationship: 'Self'
  },
  {
    id: 12,
    title: 'Artisan Pottery Set',
    image: 'https://images.unsplash.com/photo-1565193998248-d500a72183b1',
    category: 'Home',
    occasion: 'Birthday',
    relationship: 'Family'
  },
  {
    id: 13,
    title: 'Smart Home Hub',
    image: 'https://images.unsplash.com/photo-1558227691-41ea78a1f631',
    category: 'Home',
    occasion: 'Other',
    relationship: 'Colleagues'
  },
  {
    id: 14,
    title: 'Mountain Hiking Experience',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b',
    category: 'Experiences',
    occasion: 'Birthday',
    relationship: 'Friends'
  },
  {
    id: 15,
    title: 'Gourmet Chocolate Box',
    image: 'https://images.unsplash.com/photo-1548907040-4baa42d10919',
    category: 'Other',
    occasion: 'Other',
    relationship: 'Colleagues'
  }
];

export default function DiscoverPage() {
  const { user } = useAuth();
  const isGuest = false;
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
    try {
      // Clear errors but DONT set loading to true
      // This allows STATIC_GIFTS (already in state) to show immediately
      setError('');
      
      // If user is logged in, fetch data added by other users in the background
      if (user) {
        try {
          const res = await api.get('/discover?limit=20');
          const apiGifts = (Array.isArray(res.data) ? res.data : []).map(item => ({
            id: item.id || item._id,
            title: item.name || item.title,
            image: item.image_url || item.image || item.img || '/images/default-gift.png',
            category: item.category || 'Other',
            occasion: item.wishlistOccasion || item.occasion || 'Personal',
            relationship: item.relationship || 'Everyone'
          }));
          
          // Append real ones after curated ones
          setGifts([...STATIC_GIFTS, ...apiGifts]);
        } catch (apiErr) {
          console.error('[Discover] Failed to fetch real user data:', apiErr);
          // We already have STATIC_GIFTS in state, so no need to do anything
        }
      }
    } catch (err) {
      console.error('Discover fetch error:', err);
      // Only show error if we somehow lost our static gifts
      if (!gifts || gifts.length === 0) {
        setError('Error loading the discovery feed.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialGifts();
  }, []);

  const filteredGifts = useMemo(() => {
    const filtered = gifts.filter(gift => {
      const matchOccasion = activeFilters.occasion === 'All Occasions' || gift.occasion === activeFilters.occasion;
      const matchRelationship = activeFilters.relationship === 'All' || gift.relationship === activeFilters.relationship;
      return matchOccasion && matchRelationship;
    });

    return isGuest ? filtered.slice(0, 10) : filtered;
  }, [gifts, activeFilters, isGuest]);

  const handleFilterChange = (key, value) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSeeMore = () => {
    if (isGuest) {
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
        {isGuest 
          ? `Showing top 10 gift ideas` 
          : `Showing all ${filteredGifts.length} gift ideas`}
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

          {isGuest && (
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
          )}
        </>
      )}
    </div>
  );
}
