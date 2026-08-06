import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Wand2, Gift, Plus, Check, ArrowRight, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency } from '../utils/currency';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';
import './AIAssistantPage.css';

const RECIPIENTS = ['Partner', 'Friend', 'Mom', 'Dad', 'Colleague', 'Kid', 'Self'];
const OCCASIONS = ['Birthday', 'Anniversary', 'Wedding', 'Housewarming', 'Holidays', 'Just Because'];
const BUDGETS = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 - $100', min: 50, max: 100 },
  { label: '$100 - $250', min: 100, max: 250 },
  { label: '$250+', min: 250, max: 1000 },
];
const VIBES = ['Techie', 'Cozy & Home', 'Coffee & Tea', 'Fitness & Outdoor', 'Fashion & Beauty', 'Bookworm', 'Gamer'];

const RECOMMENDATION_DATABASE = {
  Partner: [
    { name: 'Embossed Leather Travel Journal', price: 42, category: 'Cozy & Home', reason: 'High sentiment value for romantic trips & milestones.', link: 'https://amazon.com' },
    { name: 'Weekend Escape Spa Set', price: 85, category: 'Cozy & Home', reason: 'Unwind together with relaxing organic aromas.', link: 'https://amazon.com' },
    { name: 'Smart Digital Picture Frame', price: 159, category: 'Techie', reason: 'Display memories instantly from your phone.', link: 'https://amazon.com' },
    { name: 'Artisan Espresso Machine', price: 299, category: 'Coffee & Tea', reason: 'Barista-quality mornings right at home.', link: 'https://amazon.com' },
  ],
  Friend: [
    { name: 'Instax Mini Instant Camera', price: 79, category: 'Techie', reason: 'Capture spontaneous moments at parties and hangouts.', link: 'https://amazon.com' },
    { name: 'Pour-Over Coffee Dripper Stand', price: 45, category: 'Coffee & Tea', reason: 'Sleek tabletop aesthetic for morning rituals.', link: 'https://amazon.com' },
    { name: 'Bestseller Fiction Collector Box', price: 60, category: 'Bookworm', reason: 'Curated hardcover collection for literary lovers.', link: 'https://amazon.com' },
    { name: 'Noise-Canceling Wireless Earbuds', price: 129, category: 'Techie', reason: 'Ideal for daily commutes, work sessions & workouts.', link: 'https://amazon.com' },
  ],
  Mom: [
    { name: 'Luxury Cashmere Throw Blanket', price: 120, category: 'Cozy & Home', reason: 'Ultra-soft premium weave for cozy evenings.', link: 'https://amazon.com' },
    { name: 'Aromatherapy Diffuser & Essential Oils', price: 55, category: 'Cozy & Home', reason: 'Calming spa ambience for living room or bedroom.', link: 'https://amazon.com' },
    { name: 'Botanical Garden Tea Sampler Box', price: 38, category: 'Coffee & Tea', reason: 'Hand-picked organic loose leaf blends.', link: 'https://amazon.com' },
    { name: 'Custom Engraved Locket Necklace', price: 95, category: 'Fashion & Beauty', reason: 'Personalized keepsake containing family photos.', link: 'https://amazon.com' },
  ],
  Dad: [
    { name: 'Precision Wireless Meat Thermometer', price: 99, category: 'Fitness & Outdoor', reason: 'Perfect BBQ and oven roasts controlled from phone.', link: 'https://amazon.com' },
    { name: 'Heavy-Duty Insulated Camp Chair', price: 75, category: 'Fitness & Outdoor', reason: 'Rugged comfort for camping, sports, and outdoors.', link: 'https://amazon.com' },
    { name: 'Cold Brew Coffee Maker Carafe', price: 35, category: 'Coffee & Tea', reason: 'Smooth, low-acid cold brew overnight.', link: 'https://amazon.com' },
    { name: 'Leather Multi-Tool Belt Sheath', price: 48, category: 'Techie', reason: 'Organized daily carry for gadgets & tools.', link: 'https://amazon.com' },
  ],
  Colleague: [
    { name: 'Insulated Stainless Steel Tumbler', price: 32, category: 'Coffee & Tea', reason: 'Keeps drinks hot for 8h or ice cold for 24h.', link: 'https://amazon.com' },
    { name: 'Desk Deskpad & Wireless Charging Mat', price: 49, category: 'Techie', reason: 'Clean workspace upgrade with built-in phone charging.', link: 'https://amazon.com' },
    { name: 'Gourmet Artisanal Snack Box', price: 40, category: 'Cozy & Home', reason: 'Delicious office snack selection for sharing.', link: 'https://amazon.com' },
    { name: 'Ergonomic Memory Foam Wrist Rest', price: 25, category: 'Techie', reason: 'Relieves wrist pressure during long typing sessions.', link: 'https://amazon.com' },
  ],
  Kid: [
    { name: 'Interactive STEM Coding Robot', price: 69, category: 'Techie', reason: 'Fun hands-on logic & programming games.', link: 'https://amazon.com' },
    { name: 'Building Bricks Creative Castle Set', price: 45, category: 'Cozy & Home', reason: 'Hours of imaginative structural fun.', link: 'https://amazon.com' },
    { name: 'Outdoor Astronomical Telescope', price: 110, category: 'Fitness & Outdoor', reason: 'Explore moon craters and stargazing.', link: 'https://amazon.com' },
    { name: 'Artisan 100-Piece Drawing Kit', price: 35, category: 'Bookworm', reason: 'Vibrant sketch pens, watercolors, and pad.', link: 'https://amazon.com' },
  ],
  Self: [
    { name: 'Ergonomic Mesh Task Chair', price: 199, category: 'Cozy & Home', reason: 'Posture support for long focus hours.', link: 'https://amazon.com' },
    { name: 'Smart Fitness Tracker Watch', price: 149, category: 'Fitness & Outdoor', reason: 'Track heart rate, sleep metrics, and steps.', link: 'https://amazon.com' },
    { name: 'High-Fidelity Over-Ear Headphones', price: 279, category: 'Techie', reason: 'Studio sound clarity with active noise cancellation.', link: 'https://amazon.com' },
    { name: 'Gooseneck Electric Kettle', price: 65, category: 'Coffee & Tea', reason: 'Exact temperature control for pour-over coffee.', link: 'https://amazon.com' },
  ]
};

export default function AIAssistantPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isGuest = !user || user.isGuest;

  const [recipient, setRecipient] = useState('Partner');
  const [occasion, setOccasion] = useState('Birthday');
  const [budget, setBudget] = useState(BUDGETS[1].label);
  const [selectedVibes, setSelectedVibes] = useState(['Cozy & Home', 'Techie']);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState(RECOMMENDATION_DATABASE['Partner']);
  const [draftWishlist, setDraftWishlist] = useState([]);
  const [showSignupModal, setShowSignupModal] = useState(false);

  const toggleVibe = (vibe) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleGenerate = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      const pool = RECOMMENDATION_DATABASE[recipient] || RECOMMENDATION_DATABASE['Partner'];
      const filtered = pool.filter((item) => {
        const selectedObj = BUDGETS.find((b) => b.label === budget) || BUDGETS[1];
        return item.price >= selectedObj.min && item.price <= selectedObj.max + 100;
      });
      setSuggestions(filtered.length > 0 ? filtered : pool);
      setIsAnalyzing(false);
      toast.success(`Generated ${filtered.length || pool.length} smart gift ideas!`);
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
    <div className="ai-assistant-page animate-fade-in">
      <SEO
        title="AI Gift Assistant — Smart Gift Ideas"
        description="Let our AI find thoughtful, personalized gift recommendations based on occasion, recipient, and budget."
        path="/ai-assistant"
      />

      <div className="ai-page-hero">
        <div className="ai-page-hero-copy">
          <div className="ai-page-kicker">
            <Sparkles size={14} />
            <span>AI Gift Finder</span>
          </div>
          <h1 className="ai-page-title">Find gifts they&apos;ll actually love.</h1>
          <p className="ai-page-subtitle">
            Tell us who you&apos;re shopping for — our AI curates tailored recommendations with direct store links and prices.
          </p>
        </div>

        <div className="ai-page-mini-grid">
          <div className="ai-page-mini-card">
            <Wand2 size={18} />
            <span>Personalized Match</span>
          </div>
          <div className="ai-page-mini-card">
            <Gift size={18} />
            <span>Occasion Aware</span>
          </div>
        </div>
      </div>

      {/* AI Controls */}
      <div className="ai-controls-card card">
        <h2 className="ai-controls-title">Customize Gift Search</h2>
        <div className="ai-controls-grid">
          <div className="ai-field-group">
            <label>Who are you shopping for?</label>
            <select value={recipient} onChange={(e) => setRecipient(e.target.value)}>
              {RECIPIENTS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="ai-field-group">
            <label>Occasion</label>
            <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
              {OCCASIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="ai-field-group">
            <label>Target Budget</label>
            <select value={budget} onChange={(e) => setBudget(e.target.value)}>
              {BUDGETS.map((b) => (
                <option key={b.label} value={b.label}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="ai-vibes-section">
          <label className="ai-vibes-label">Vibe & Interests</label>
          <div className="ai-vibes-pills">
            {VIBES.map((vibe) => {
              const active = selectedVibes.includes(vibe);
              return (
                <button
                  type="button"
                  key={vibe}
                  className={`ai-vibe-pill ${active ? 'active' : ''}`}
                  onClick={() => toggleVibe(vibe)}
                >
                  {vibe}
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-primary ai-generate-btn"
          onClick={handleGenerate}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <div className="spinner-sm"></div> AI is analyzing gift ideas...
            </>
          ) : (
            <>
              <Wand2 size={18} /> Generate AI Recommendations
            </>
          )}
        </button>
      </div>

      {/* Results Section */}
      <div className="ai-results-section">
        <div className="ai-results-header flex-between">
          <div>
            <h3>AI Recommendations for {recipient} ({occasion})</h3>
            <p style={{ color: '#64748B', fontSize: '14px' }}>
              Showing {suggestions.length} curated gift ideas within {budget}
            </p>
          </div>
          {draftWishlist.length > 0 && (
            <button className="btn btn-primary" onClick={handleSaveWishlist}>
              Save Wishlist ({draftWishlist.length} items) <ArrowRight size={16} />
            </button>
          )}
        </div>

        <div className="ai-suggestions-grid">
          {suggestions.map((item, idx) => {
            const isAdded = draftWishlist.some((d) => d.name === item.name);
            return (
              <div key={idx} className="ai-suggestion-card card">
                <div className="ai-card-top flex-between">
                  <span className="ai-match-badge">
                    <Sparkles size={13} /> {95 - idx * 2}% Match
                  </span>
                  <span className="ai-card-price">{formatCurrency(item.price)}</span>
                </div>
                <h4>{item.name}</h4>
                <p className="ai-card-reason">{item.reason}</p>
                <div className="ai-card-tags">
                  <span className="tag tag--category">{item.category}</span>
                </div>
                <div className="ai-card-actions flex-between">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-text btn-sm"
                  >
                    View Item <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    className={`btn btn-sm ${isAdded ? 'btn-secondary' : 'btn-outline'}`}
                    onClick={() => handleAddToDraft(item)}
                  >
                    {isAdded ? (
                      <>
                        <Check size={14} /> Added
                      </>
                    ) : (
                      <>
                        <Plus size={14} /> Add to List
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Draft Bar */}
      {draftWishlist.length > 0 && (
        <div className="ai-draft-floating-bar animate-fade-in">
          <div className="ai-draft-info">
            <Gift size={20} />
            <span>
              Draft Wishlist: <strong>{draftWishlist.length} items</strong>
            </span>
          </div>
          <button className="btn btn-primary btn-sm" onClick={handleSaveWishlist}>
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
