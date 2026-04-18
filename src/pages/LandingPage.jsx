import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Eye,
  Gift,
  Heart,
  HeartHandshake,
  Mail,
  Share2,
  Sparkles,
  Users,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const sampleWishlists = [
  {
    id: 1,
    name: 'Birthday Hints',
    occasion: 'Birthday',
    items: 14,
    note: 'A soft mix of books, skincare, and little luxuries people can feel good about gifting.',
  },
  {
    id: 2,
    name: 'Wedding Wishlist',
    occasion: 'Wedding',
    items: 21,
    note: 'A shared list for building a home together, without endless “what do you need?” messages.',
  },
  {
    id: 3,
    name: 'Home Essentials',
    occasion: 'Moving In',
    items: 9,
    note: 'Practical upgrades and decor that make a new house feel like home.',
  },
];

const inspirationWishlists = [
  {
    id: 1,
    username: 'Sarah J.',
    initials: 'SJ',
    occasion: 'Birthday',
    emoji: '🎂',
    likes: 24,
    views: '1.2k',
    items: ['Kindle Paperwhite', 'Leather Journal', 'Coffee Press'],
  },
  {
    id: 2,
    username: 'Kunal & Meera',
    initials: 'KM',
    occasion: 'Wedding',
    emoji: '💍',
    likes: 42,
    views: '2.5k',
    items: ['Dinnerware', 'Linen Set', 'Air Fryer'],
  },
  {
    id: 3,
    username: 'Naina R.',
    initials: 'NR',
    occasion: 'Birthday',
    emoji: '🎉',
    likes: 18,
    views: '800',
    items: ['Kindle', 'Journal', 'Pendant'],
  },
];

const assistantHighlights = [
  {
    id: 1,
    icon: Sparkles,
    title: 'Smarter gift suggestions',
    description: 'Start with the person and occasion, then let WishNest narrow the list into thoughtful ideas.',
  },
  {
    id: 2,
    icon: Gift,
    title: 'Wishlists that stay practical',
    description: 'Organisation scattered links into a polished wishlist.',
  },
  {
    id: 3,
    icon: Share2,
    title: 'Ready to share',
    description: 'Share your link instantly without juggling screenshots.',
  },
];


function getOccasionClass(label) {
  switch (label) {
    case 'Birthday':
      return 'landing-tag landing-tag--birthday';
    case 'Wedding':
      return 'landing-tag landing-tag--wedding';
    case 'Moving In':
      return 'landing-tag landing-tag--moving';
    default:
      return 'landing-tag';
  }
}

export default function LandingPage() {

  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero__banner">
            <div className="landing-hero__container">
              <div className="landing-hero__copy">
                <div className="landing-kicker">
                  <HeartHandshake size={15} />
                  <span>Sharing helps your people choose with confidence</span>
                </div>

                <h1 className="landing-title">
                  Discover the perfect gift and build your wishlist effortlessly.
                </h1>
                <p className="landing-subtitle">
                  Browse gift ideas by occasion, relationship, or budget — then save them to your wishlist and share with friends and family.
                </p>

                <div className="landing-actions">
                  <Link to="/discover" className="btn btn-primary btn-lg">
                    Discover Gift Ideas <ArrowRight size={18} />
                  </Link>
                  <Link to={user ? "/dashboard" : "/signup"} className="btn btn-outline btn-lg">
                    Create Your Wishlist <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="landing-chip-row">
                  <div className="landing-chip">
                    <CheckCircle2 size={16} />
                    <span>Free forever</span>
                  </div>
                  <div className="landing-chip">
                    <Mail size={16} />
                    <span>No spam</span>
                  </div>
                  <div className="landing-chip">
                    <Clock size={16} />
                    <span>Takes 30 seconds</span>
                  </div>
                </div>
              </div>

              <div className="landing-hero__panel">
                <div className="landing-hero-card">
                  <div className="landing-hero-card__emoji" aria-hidden="true">
                    🎁✨💙
                  </div>
                  <h2>Make gifting feel thoughtful, not awkward.</h2>
                  <p>
                    They already want to get you something. You&apos;re simply making it easier for them to get it right.
                  </p>
                  <div className="landing-hero-card__stats">
                    <div className="landing-stat-box">
                      <span>OCCASIONS</span>
                      <strong>4+</strong>
                    </div>
                    <div className="landing-stat-box">
                      <span>SAMPLE LISTS</span>
                      <strong>3</strong>
                    </div>
                  </div>
                  <div className="landing-hero-card__floating-gift" aria-hidden="true">🎁</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="container">
          <div className="landing-section__header">

            <h2>One place for every occasion.</h2>
            <p>
              Build a clear, personal wishlist for every celebration—from birthdays to weddings—and keep gifting stress-free.
            </p>
          </div>

          <div className="landing-wishlist-grid">
            {sampleWishlists.map((wishlist) => (
              <article key={wishlist.id} className="landing-wishlist-card card">
                <div className="landing-wishlist-card__top">
                  <span className={getOccasionClass(wishlist.occasion)}>{wishlist.occasion}</span>
                  <div className="landing-wishlist-card__count">
                    <span>Items</span>
                    <strong>{wishlist.items}</strong>
                  </div>
                </div>
                <h3>{wishlist.name}</h3>
                <p>{wishlist.note}</p>
                <div className="landing-wishlist-card__footer">
                  <Link to={user ? '/dashboard' : '/signup'} className="landing-inline-link">
                    Explore Style <ArrowRight size={15} />
                  </Link>
                </div>
              </article>
            ))}

            <Link to={user ? '/dashboard' : '/signup'} className="landing-create-card card">
              <div className="landing-create-card__icon">
                <Gift size={28} />
              </div>
              <h3>Create your own wishlist</h3>
              <p>
                Turn “What should we get you?” into something simple and kind.
              </p>
              <span className="landing-create-card__cta">Start with a list</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="landing-section landing-section--soft">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <Sparkles size={12} />
              <span>COMMUNITY TRENDS</span>
            </div>
            <h2>See what others are wishing for</h2>
            <p>Browse popular wishlists for gift ideas and see how easy sharing can be.</p>
          </div>

          <div className="landing-feed">
            {inspirationWishlists.map((wishlist) => (
              <article key={wishlist.id} className="landing-feed-card card">
                <div className="landing-feed-card__top">
                  <div className="landing-feed-card__user">
                    <div className="landing-feed-card__avatar">{wishlist.initials}</div>
                    <div className="landing-feed-card__meta">
                      <h3>{wishlist.username}</h3>
                      <div className="landing-feed-card__engagement">
                        <span><Heart size={12} fill="currentColor" /> {wishlist.likes}</span>
                        <span><Eye size={12} /> {wishlist.views}</span>
                      </div>
                    </div>
                  </div>
                  <span className={getOccasionClass(wishlist.occasion)}>
                    {wishlist.emoji} {wishlist.occasion}
                  </span>
                </div>

                <div className="landing-feed-card__items">
                  {wishlist.items.map((item, index) => (
                    <div key={item} className="landing-feed-item">
                      <div className={`landing-feed-item__thumb landing-feed-item__thumb--${index + 1}`}>
                        <Gift size={14} />
                      </div>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Link to={user ? '/discover' : '/signup'} className="landing-soft-link">
                  <span>View Wishlist</span>
                  <ArrowRight size={16} />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="landing-nudge">
        <div className="container landing-nudge__container">
          <div className="landing-nudge__copy">
            <h2>Got a birthday, wedding, or celebration coming up?</h2>
            <p>Create your wishlist in seconds and make gifting simple for everyone.</p>
          </div>
          <div className="landing-nudge__actions">
            <Link to={user ? '/dashboard' : '/signup'} className="btn btn-primary landing-nudge-btn">
              {user ? 'Open Dashboard' : 'Create Your Wishlist'}
            </Link>
            <span className="landing-nudge__trust">Free forever • No spam • Takes 30 seconds</span>
          </div>
        </div>
      </section>

      <section id="ai-assistant" className="landing-section landing-section--ai">
        <div className="container">
          <div className="landing-section__header">

            <h2>Find the perfect gift in seconds.</h2>
            <p>
              Tell us the person and occasion — we&apos;ll suggest gifts they&apos;ll actually love.
            </p>
          </div>

          <div className="landing-assistant-grid">
            {assistantHighlights.map(({ id, icon, title, description }) => {
              const Icon = icon;
              return (
                <article key={id} className="landing-assistant-card card">
                  <div className="landing-assistant-card__icon">
                    <Icon size={20} />
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </article>
              );
            })}
          </div>

          <div className="landing-assistant-actions">
            <Link to="/ai-assistant" className="btn btn-primary">
              Try AI Assistant <ArrowRight size={18} />
            </Link>
            <Link to={user ? '/discover' : '/signup'} className="btn btn-secondary">
              {user ? 'Browse Gift Ideas' : 'Create Wishlist'}
            </Link>
          </div>
        </div>
      </section>


      <section id="faq" className="landing-section landing-section--soft">
        <div className="container">
          <div className="landing-section__header">
            <h2>Frequently Asked Questions</h2>
            <p>Common questions about our free wishlist maker.</p>
          </div>

          <div className="landing-info-grid">
            <article className="landing-info-card card">
              <h3>What is WishNest?</h3>
              <p>WishNest is a free gift registry and wishlist maker that lets you organize the items you love from any website into one shareable list.</p>
            </article>
            <article className="landing-info-card card">
              <h3>Is WishNest free to use?</h3>
              <p>Yes, absolutely! Creating, managing, and sharing your wishlists with friends and family is 100% free.</p>
            </article>
            <article className="landing-info-card card">
              <h3>How do I share my wishlist?</h3>
              <p>Simply click the "Copy Link" button on your wishlist and share it via WhatsApp, email, or text. No sign-up is required for them to view it.</p>
            </article>
            <article className="landing-info-card card">
              <h3>Can I use WishNest for wedding registry?</h3>
              <p>Yes! It is perfect for weddings, birthdays, baby showers, and holidays. Add items from anywhere to build your ultimate gift registry.</p>
            </article>
          </div>
        </div>
      </section>
    </div>
  );
}
