import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Gift, Plus, Check, ArrowRight, X, ExternalLink, Heart, User, Calendar, Tag, ChevronDown, SlidersHorizontal, HeartHandshake, DollarSign, Share2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../utils/currency';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import './AIAssistantPage.css';

const RECIPIENTS = ['Partner', 'Friend', 'Mom', 'Dad', 'Colleague', 'Kid', 'Self'];
const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Housewarming', 'Holidays', 'Just Because'];
const BUDGET_OPTIONS = [
  { id: '50-100', min: 50, max: 100, formatLabel: (format) => `${format(50)} - ${format(100)}` },
  { id: 'under-50', min: 0, max: 50, formatLabel: (format) => `Under ${format(50)}` },
  { id: '100-250', min: 100, max: 250, formatLabel: (format) => `${format(100)} - ${format(250)}` },
  { id: '250-plus', min: 250, max: 1000, formatLabel: (format) => `${format(250)}+` },
];

const VIBES = [
  { id: 'Techie', label: 'Techie', icon: '⚡' },
  { id: 'Cozy & Home', label: 'Cozy & Home', icon: '🏠' },
  { id: 'Coffee & Tea', label: 'Coffee & Tea', icon: '☕' },
  { id: 'Fitness & Outdoor', label: 'Fitness & Outdoor', icon: '🏋️' },
  { id: 'Fashion & Beauty', label: 'Fashion & Beauty', icon: '👗' },
  { id: 'Bookworm', label: 'Bookworm', icon: '📚' },
  { id: 'Gamer', label: 'Gamer', icon: '🎮' },
];

const RECOMMENDATION_DATABASE = {
  Partner: [
    { name: 'Embossed Leather Travel Journal', price: 42, match: 95, category: 'Cozy & Home', reason: 'High sentiment value for romantic trips & milestones.', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Weekend Escape Spa Set', price: 85, match: 93, category: 'Cozy & Home', reason: 'Unwind together with relaxing organic aromas.', image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Smart Digital Picture Frame', price: 159, match: 91, category: 'Techie', reason: 'Display memories instantly from your phone.', image: 'https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Artisan Espresso Machine', price: 299, match: 89, category: 'Coffee & Tea', reason: 'Barista-quality mornings right at home.', image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ],
  Friend: [
    { name: 'Instax Mini Instant Camera', price: 79, match: 96, category: 'Techie', reason: 'Capture spontaneous moments at parties and hangouts.', image: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Pour-Over Coffee Dripper Stand', price: 45, match: 94, category: 'Coffee & Tea', reason: 'Sleek tabletop aesthetic for morning coffee rituals.', image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Bestseller Hardcover Box Set', price: 60, match: 92, category: 'Bookworm', reason: 'Curated hardcover collector edition for book lovers.', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Noise-Canceling Wireless Earbuds', price: 129, match: 90, category: 'Techie', reason: 'Ideal for daily commutes, work sessions & travel.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ],
  Mom: [
    { name: 'Luxury Cashmere Throw Blanket', price: 120, match: 97, category: 'Cozy & Home', reason: 'Ultra-soft premium weave for cozy relaxing evenings.', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Aromatherapy Diffuser & Oils', price: 55, match: 95, category: 'Cozy & Home', reason: 'Calming spa ambience for living room or bedroom.', image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Botanical Loose Leaf Tea Sampler', price: 38, match: 93, category: 'Coffee & Tea', reason: 'Hand-picked organic loose leaf tea blends.', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Custom Engraved Locket Necklace', price: 95, match: 91, category: 'Fashion & Beauty', reason: 'Personalized keepsake containing family photos.', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ],
  Dad: [
    { name: 'Precision Wireless Meat Thermometer', price: 99, match: 96, category: 'Techie', reason: 'Perfect BBQ and oven roasts controlled from phone.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Heavy-Duty Insulated Camp Chair', price: 75, match: 94, category: 'Fitness & Outdoor', reason: 'Rugged comfort for camping, sports, and outdoors.', image: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Cold Brew Coffee Carafe', price: 35, match: 91, category: 'Coffee & Tea', reason: 'Smooth, low-acid cold brew overnight.', image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Leather Multi-Tool Sheath', price: 48, match: 89, category: 'Techie', reason: 'Organized daily carry for gadgets & tools.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ],
  Colleague: [
    { name: 'Insulated Stainless Tumbler', price: 32, match: 95, category: 'Coffee & Tea', reason: 'Keeps drinks hot for 8h or ice cold for 24h.', image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Desk Pad & Wireless Charger', price: 49, match: 93, category: 'Techie', reason: 'Clean workspace upgrade with built-in phone charging.', image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Gourmet Artisanal Snack Box', price: 40, match: 90, category: 'Cozy & Home', reason: 'Delicious office snack selection for sharing.', image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Ergonomic Memory Foam Wrist Rest', price: 25, match: 88, category: 'Techie', reason: 'Relieves wrist pressure during long typing sessions.', image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ],
  Kid: [
    { name: 'Interactive STEM Coding Robot', price: 69, match: 96, category: 'Techie', reason: 'Fun hands-on logic & programming games.', image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Creative Castle Building Bricks', price: 45, match: 94, category: 'Gamer', reason: 'Hours of imaginative structural building fun.', image: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Astronomical Stargazing Telescope', price: 110, match: 92, category: 'Fitness & Outdoor', reason: 'Explore moon craters and night sky stars.', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: '100-Piece Deluxe Art Studio Kit', price: 35, match: 89, category: 'Bookworm', reason: 'Vibrant sketch pens, watercolors, and drawing pad.', image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ],
  Self: [
    { name: 'Ergonomic Mesh Task Chair', price: 199, match: 96, category: 'Cozy & Home', reason: 'Posture support for long focus hours.', image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d1276?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Smart Fitness Tracker Watch', price: 149, match: 94, category: 'Fitness & Outdoor', reason: 'Track heart rate, sleep metrics, and daily steps.', image: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'High-Fidelity Wireless Headphones', price: 279, match: 92, category: 'Techie', reason: 'Studio sound clarity with active noise cancellation.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
    { name: 'Gooseneck Electric Temp Kettle', price: 65, match: 90, category: 'Coffee & Tea', reason: 'Exact temperature control for pour-over coffee.', image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80', link: 'https://amazon.com' },
  ]
};

export default function AIAssistantPage() {
  const { user } = useAuth();
  const { format } = useCurrency();
  const navigate = useNavigate();
  const isGuest = !user || user.isGuest;

  const [recipient, setRecipient] = useState('Partner');
  const [occasion, setOccasion] = useState('Birthday');
  const [budgetId, setBudgetId] = useState('50-100');
  const [selectedVibes, setSelectedVibes] = useState(['Techie', 'Cozy & Home']);
  const [likedItems, setLikedItems] = useState({});
  const [sortBy, setSortBy] = useState('Relevance');

  const selectedBudgetObj = BUDGET_OPTIONS.find((b) => b.id === budgetId) || BUDGET_OPTIONS[0];
  const selectedBudgetLabel = selectedBudgetObj.formatLabel(format);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(RECOMMENDATION_DATABASE['Partner']);
  const [draftWishlist, setDraftWishlist] = useState([]);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const toggleVibe = (id) => {
    setSelectedVibes((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleLike = (itemName) => {
    setLikedItems((prev) => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleGenerate = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const pool = RECOMMENDATION_DATABASE[recipient] || RECOMMENDATION_DATABASE['Partner'];
      setSuggestions(pool);
      setIsAnalyzing(false);
      toast.success(`Generated ${pool.length} AI gift recommendations! ✨`);
    }, 600);
  };

  const handleAddToDraft = (item) => {
    if (draftWishlist.some((d) => d.name === item.name)) {
      toast.error('Item already in your draft list');
      return;
    }
    setDraftWishlist((prev) => [...prev, item]);
    toast.success(`Added "${item.name}" to draft wishlist 🎁`);
  };

  const handleSaveWishlist = () => {
    if (draftWishlist.length === 0) {
      toast.error('Add at least one item to your wishlist draft first.');
      return;
    }

    if (isGuest) {
      try {
        localStorage.setItem(
          'draftWishlist',
          JSON.stringify({ occasion, items: draftWishlist, createdAt: Date.now() })
        );
      } catch {
        // storage fallback
      }
      setShowSignupModal(true);
    } else {
      toast.success('Wishlist saved to your dashboard!');
      navigate('/wishlists');
    }
  };

  return (
    <div className="ai-page-wrap animate-fade-in">
      <SEO
        title="AI Gift Assistant — Find the Perfect Gift, Powered by AI"
        description="Let our AI find thoughtful, personalized gift recommendations based on occasion, recipient, and budget."
        path="/ai-assistant"
      />

      <div className="ai-page-container">
        
        {/* Top Hero Container */}
        <section className="ai-hero-card">
          <div className="ai-hero-header">
            <div className="ai-hero-copy">
              <h1 className="ai-main-heading">
                Find the Perfect Gift, <br />
                <span className="ai-highlight-text">Powered by AI <Sparkles size={24} className="inline-sparkle" /></span>
              </h1>
              <p className="ai-hero-sub">
                Tell us about the occasion and your budget, and we&apos;ll find the best gift ideas for you.
              </p>
            </div>

            <div className="ai-hero-illustration">
              <img src="/hero-3d-gift.png" alt="3D Gift Box" className="ai-3d-gift-img" />
            </div>
          </div>

          {/* Embedded White Search Form Card */}
          <div className="ai-form-card">
            <div className="ai-form-grid">
              
              {/* Recipient Custom Select */}
              <div className="ai-input-group">
                <label>Who are you shopping for?</label>
                <div className="ai-custom-select">
                  <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
                    {RECIPIENTS.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                  <div className="ai-custom-select-display">
                    <span className="ai-custom-select-label">
                      <User size={16} className="ai-select-icon" />
                      <span>{recipient}</span>
                    </span>
                    <ChevronDown size={16} className="ai-chevron-icon" />
                  </div>
                </div>
              </div>

              {/* Occasion Custom Select */}
              <div className="ai-input-group">
                <label>Occasion</label>
                <div className="ai-custom-select">
                  <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <div className="ai-custom-select-display">
                    <span className="ai-custom-select-label">
                      <Calendar size={16} className="ai-select-icon" />
                      <span>{occasion}</span>
                    </span>
                    <ChevronDown size={16} className="ai-chevron-icon" />
                  </div>
                </div>
              </div>

              {/* Target Budget Custom Select */}
              <div className="ai-input-group">
                <label>Target Budget</label>
                <div className="ai-custom-select">
                  <select value={budgetId} onChange={(e) => setBudgetId(e.target.value)}>
                    {BUDGET_OPTIONS.map((b) => (
                      <option key={b.id} value={b.id}>{b.formatLabel(format)}</option>
                    ))}
                  </select>
                  <div className="ai-custom-select-display">
                    <span className="ai-custom-select-label">
                      <Tag size={16} className="ai-select-icon" />
                      <span>{selectedBudgetLabel}</span>
                    </span>
                    <ChevronDown size={16} className="ai-chevron-icon" />
                  </div>
                </div>
              </div>

            </div>

            {/* Vibes & Interests Pills */}
            <div className="ai-vibes-row">
              <span className="ai-vibes-title">Vibes & Interests <span className="text-muted">(Optional)</span></span>
              <div className="ai-pills-flex">
                {VIBES.map((vibe) => {
                  const active = selectedVibes.includes(vibe.id);
                  return (
                    <button
                      type="button"
                      key={vibe.id}
                      className={`ai-vibe-badge ${active ? 'active' : ''}`}
                      onClick={() => toggleVibe(vibe.id)}
                    >
                      <span className="vibe-icon">{vibe.icon}</span>
                      <span>{vibe.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Full-Width Orange Generate Button */}
            <button
              type="button"
              className="ai-full-generate-btn"
              onClick={handleGenerate}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <div className="spinner-sm"></div> AI is analyzing gift ideas...
                </>
              ) : (
                <>
                  <Sparkles size={18} /> Generate AI Recommendations
                </>
              )}
            </button>
          </div>
        </section>

        {/* Results Section */}
        <section className="ai-results-block">
          <div className="ai-results-header flex-between">
            <div className="flex-align-gap">
              <Sparkles size={20} className="ai-sparkle-orange" />
              <div>
                <h2 className="ai-results-title">
                  AI Recommendations for {recipient} ({occasion})
                </h2>
                <p className="ai-results-sub">
                  Showing {suggestions.length} curated gift ideas within {selectedBudgetLabel}
                </p>
              </div>
            </div>

            <div className="flex-align-gap">
              <div className="ai-sort-dropdown">
                <SlidersHorizontal size={14} />
                <span>Sort by:</span>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                  <option value="Relevance">Relevance</option>
                  <option value="Match">Highest Match</option>
                  <option value="PriceAsc">Price: Low to High</option>
                  <option value="PriceDesc">Price: High to Low</option>
                </select>
              </div>

              {draftWishlist.length > 0 && (
                <button className="btn-save-draft" onClick={handleSaveWishlist}>
                  Save Wishlist ({draftWishlist.length}) <ArrowRight size={15} />
                </button>
              )}
            </div>
          </div>

          {/* 4-Column Product Cards Grid */}
          {isAnalyzing ? (
            <div className="ai-skeleton-4col">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="ai-skeleton-card card">
                  <div className="ai-skeleton-img"></div>
                  <div className="ai-skeleton-line short"></div>
                  <div className="ai-skeleton-line long"></div>
                  <div className="ai-skeleton-line medium"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ai-grid-4col">
              {suggestions.map((item, idx) => {
                const isAdded = draftWishlist.some((d) => d.name === item.name);
                const isLiked = !!likedItems[item.name];
                return (
                  <article key={idx} className="ai-card-item card">
                    <div className="ai-card-media">
                      <img src={item.image} alt={item.name} loading="lazy" />
                      <span className="ai-match-badge">
                        <Sparkles size={11} /> {item.match}% Match
                      </span>
                      <button
                        type="button"
                        className={`ai-heart-icon-btn ${isLiked ? 'liked' : ''}`}
                        onClick={() => toggleLike(item.name)}
                        aria-label="Wishlist heart"
                      >
                        <Heart size={15} fill={isLiked ? '#FF6B35' : 'none'} color={isLiked ? '#FF6B35' : '#6B7280'} />
                      </button>
                    </div>

                    <div className="ai-card-body">
                      <h3 className="ai-card-item-title">{item.name}</h3>
                      <p className="ai-card-item-reason">{item.reason}</p>

                      <div className="ai-card-meta-row flex-between">
                        <span className="ai-cat-pill">{item.category}</span>
                        <span className="ai-card-price-green">{format(item.price)}</span>
                      </div>

                      <div className="ai-card-actions-row flex-between">
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ai-view-details-link"
                        >
                          View Details <ExternalLink size={13} />
                        </a>
                        <button
                          type="button"
                          className={`ai-add-list-btn ${isAdded ? 'added' : ''}`}
                          onClick={() => handleAddToDraft(item)}
                        >
                          {isAdded ? (
                            <>
                              <Check size={14} /> Added
                            </>
                          ) : (
                            <>
                              + Add to List
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom Feature Value Props Row */}
        <section className="ai-value-props-grid">
          <div className="ai-value-prop-card">
            <div className="ai-vp-icon"><Sparkles size={20} /></div>
            <div>
              <h4>AI-Powered</h4>
              <p>Smart recommendations tailored to your needs</p>
            </div>
          </div>

          <div className="ai-value-prop-card">
            <div className="ai-vp-icon"><HeartHandshake size={20} /></div>
            <div>
              <h4>Curated with Care</h4>
              <p>Handpicked gifts for meaningful moments</p>
            </div>
          </div>

          <div className="ai-value-prop-card">
            <div className="ai-vp-icon"><DollarSign size={20} /></div>
            <div>
              <h4>Budget Friendly</h4>
              <p>Find the best gifts within your budget</p>
            </div>
          </div>

          <div className="ai-value-prop-card">
            <div className="ai-vp-icon"><Share2 size={20} /></div>
            <div>
              <h4>Save & Share</h4>
              <p>Create lists and share with your loved ones</p>
            </div>
          </div>
        </section>

      </div>

      {/* Floating Draft Bar */}
      {draftWishlist.length > 0 && (
        <div className="ai-draft-floating-bar animate-fade-in">
          <div className="ai-draft-info">
            <Gift size={18} />
            <span>
              Draft Wishlist: <strong>{draftWishlist.length} items</strong>
            </span>
          </div>
          <button className="btn-save-draft-pill" onClick={handleSaveWishlist}>
            Save Wishlist & Share <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Guest Signup Modal */}
      {showSignupModal && (
        <div className="ai-modal-overlay" onClick={() => setShowSignupModal(false)}>
          <div className="ai-modal-card card animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button className="ai-modal-close" onClick={() => setShowSignupModal(false)}>
              <X size={20} />
            </button>
            <div className="ai-modal-header text-center">
              <div className="ai-modal-icon">
                <Gift size={32} />
              </div>
              <h2>Sign up to save this wishlist</h2>
              <p>
                You built a great list with <strong>{draftWishlist.length} items</strong>! Create a free account in 10 seconds to save your wishlist and get your shareable link.
              </p>
            </div>
            <div className="ai-modal-actions">
              <Link to="/signup" className="btn btn-primary w-full">
                Create Free Account to Save <ArrowRight size={16} />
              </Link>
              <Link to="/login" className="btn btn-secondary w-full" style={{ marginTop: '8px' }}>
                Already have an account? Log In
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
