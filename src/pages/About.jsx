import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Heart, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Share2, 
  Smile, 
  Cake, 
  Gift, 
  PartyPopper,
  Search,
  Users
} from 'lucide-react';
import SEO from '../components/SEO';
import './About.css';

export default function About() {
  return (
    <div className="about-container animate-fade-in">
      <SEO 
        title="About WishNest"
        description="Learn why we're making gifting stress-free and meaningful. WishNest is the modern way to create and share your wishlist."
        path="/about"
      />

      {/* SECTION 1: HERO */}
      <section className="about-section about-section--hero">
        <div className="about-content-medium">
          <h1 className="about-h1 animate-slide-up">
            Make gifting feel thoughtful, not stressful.
          </h1>
          <h2 className="about-subheading animate-slide-up" style={{ animationDelay: '0.1s' }}>
            A simple way to create, share, and receive gifts you’ll truly love.
          </h2>
          <div className="about-cta-container animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Create Your Wishlist
            </Link>
          </div>
        </div>
      </section>

      {/* SECTION 2: RELATABLE PROBLEM */}
      <section className="about-section">
        <div className="about-content-narrow">
          <h2 className="about-h2 text-center">We’ve all experienced this…</h2>
          <div className="about-problem-list">
            <div className="about-problem-item">
              <Gift size={20} />
              <span>Getting a gift you didn’t really need</span>
            </div>
            <div className="about-problem-item">
              <Search size={20} />
              <span>Spending hours figuring out what to buy</span>
            </div>
            <div className="about-problem-item">
              <Heart size={20} />
              <span>Hoping your choice feels “right”</span>
            </div>
          </div>
          <p className="about-body text-center" style={{ marginTop: '32px', fontWeight: 600, fontSize: '20px' }}>
            Gifting is meant to feel special—but too often, it feels uncertain.
          </p>
        </div>
      </section>

      {/* SECTION 3: CORE INSIGHT */}
      <section className="about-section about-section--light">
        <div className="about-content-narrow text-center">
          <h2 className="about-h2">The problem isn’t gifting. It’s guessing.</h2>
          <div className="about-body">
            <p style={{ marginBottom: '16px' }}>People genuinely want to give meaningful gifts.</p>
            <p>But without knowing what someone truly wants, it turns into guesswork.</p>
          </div>
          <p className="about-body" style={{ marginTop: '24px', fontStyle: 'italic', color: '#1c1917' }}>
            And that’s where things go wrong—awkward moments, unused gifts, and unnecessary stress.
          </p>
        </div>
      </section>

      {/* SECTION 4: SOLUTION */}
      <section className="about-section">
        <div className="about-content-narrow text-center">
          <h2 className="about-h2">So we built WishNest</h2>
          <h3 className="about-h3" style={{ color: '#f97316' }}>A better way to give and receive gifts</h3>
          <p className="about-body" style={{ marginTop: '20px' }}>
            WishNest lets you create your personal wishlist, add things you actually love, and share it with the people who want to gift you.
          </p>
          <p className="about-body" style={{ fontWeight: 700, fontSize: '22px', color: '#111', marginTop: '32px' }}>
            No more guessing. Just better gifting.
          </p>
        </div>
      </section>

      {/* SECTION 5: HOW IT WORKS */}
      <section className="about-section about-section--light">
        <div className="about-content-medium">
          <h2 className="about-h2 text-center">Simple. Thoughtful. Effective.</h2>
          <div className="about-how-grid">
            <div className="about-how-item">
              <div className="about-how-icon">
                <Plus size={28} />
              </div>
              <h3 className="about-h3">1. Discover & add</h3>
              <p className="about-body">Save anything you love to your wishlist</p>
            </div>
            <div className="about-how-item">
              <div className="about-how-icon">
                <Share2 size={28} />
              </div>
              <h3 className="about-h3">2. Share your wishlist</h3>
              <p className="about-body">Send it to friends, family, or your partner</p>
            </div>
            <div className="about-how-item">
              <div className="about-how-icon">
                <Smile size={28} />
              </div>
              <h3 className="about-h3">3. Get it right</h3>
              <p className="about-body">They choose gifts you’ll genuinely love</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: EMOTIONAL BENEFITS */}
      <section className="about-section">
        <div className="about-content-medium">
          <h2 className="about-h2 text-center">Because gifting should feel good—for everyone</h2>
          <div className="about-benefits-grid">
            <div className="about-benefit-card about-benefit-card--no">
              <ul className="about-benefit-list">
                <li><XCircle size={20} color="#ef4444" /> No more fake smiles</li>
                <li><XCircle size={20} color="#ef4444" /> No more duplicate gifts</li>
                <li><XCircle size={20} color="#ef4444" /> No more “I’ll use it later” moments</li>
              </ul>
            </div>
            <div className="about-benefit-card about-benefit-card--yes">
              <ul className="about-benefit-list">
                <li style={{ fontSize: '20px', color: '#1c1917' }}>
                  <CheckCircle2 size={24} color="#f97316" /> Just thoughtful, meaningful gifting
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: USE CASES */}
      <section className="about-section about-section--light">
        <div className="about-content-narrow">
          <h2 className="about-h2 text-center">Built for real moments</h2>
          <div className="about-moment-grid">
            <div className="about-moment-pill">
              <Cake size={24} color="#f97316" />
              <span>Birthdays</span>
            </div>
            <div className="about-moment-pill">
              <Heart size={24} color="#f97316" />
              <span>Anniversaries</span>
            </div>
            <div className="about-moment-pill">
              <PartyPopper size={24} color="#f97316" />
              <span>Festivals</span>
            </div>
            <div className="about-moment-pill">
              <Sparkles size={24} color="#f97316" />
              <span>Everyday surprises</span>
            </div>
          </div>
          <p className="about-body text-center" style={{ marginTop: '40px', fontWeight: 600 }}>
            Any moment that matters—WishNest fits right in.
          </p>
        </div>
      </section>

      {/* SECTION 8: REASSURANCE */}
      <section className="about-section">
        <div className="about-content-narrow text-center">
          <h2 className="about-h2">It’s not about asking for more</h2>
          <p className="about-body" style={{ fontSize: '24px', fontWeight: 700, color: '#111' }}>
            It’s about helping people give better.
          </p>
          <div className="about-body" style={{ marginTop: '24px' }}>
            <p style={{ marginBottom: '16px' }}>Sharing your wishlist isn’t awkward—it’s thoughtful.</p>
            <p>It makes gifting easier, clearer, and more meaningful for everyone involved.</p>
          </div>
        </div>
      </section>

      {/* SECTION 9: CLOSING */}
      <section className="about-section about-section--light" style={{ paddingBottom: '140px' }}>
        <div className="about-content-narrow text-center">
          <h2 className="about-h2">Better gifts start with knowing what matters</h2>
          <p className="about-body">And sometimes, all it takes is sharing what you love.</p>
          <div className="about-cta-container">
            <Link to="/signup" className="btn btn-primary btn-lg" style={{ minWidth: '240px' }}>
              Start your wishlist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
