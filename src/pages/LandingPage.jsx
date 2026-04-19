import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  CheckSquare,
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
    emoji: '🎂',
    items: 14,
    note: 'A soft mix of books, skincare, and little luxuries people can feel good about gifting.',
    bg: '/samples/birthday_bg.png'
  },
  {
    id: 2,
    name: 'Wedding Wishlist',
    occasion: 'Wedding',
    emoji: '💍',
    items: 21,
    note: 'A shared list for building a home together, without endless “what do you need?” messages.',
    bg: '/samples/wedding_bg.png'
  },
  {
    id: 3,
    name: 'Home Essentials',
    occasion: 'Moving In',
    emoji: '🏡',
    items: 9,
    note: 'Practical upgrades and decor that make a new house feel like home.',
    bg: '/samples/moving_bg.png'
  },
];

const inspirationWishlists = [
  {
    id: 1,
    username: 'Sarah J.',
    initials: 'SJ',
    occasion: 'Birthday',
    emoji: '🎂',
    items: [
      { name: 'Paperwhite', img: '/trends/kindle.png' },
      { name: 'Journal', img: '/trends/journal.png' },
      { name: 'Press', img: '/trends/dinnerware.png' }
    ],
  },
  {
    id: 2,
    username: 'Kunal & Meera',
    initials: 'KM',
    occasion: 'Wedding',
    emoji: '💍',
    items: [
      { name: 'Dinnerware', img: '/trends/dinnerware.png' },
      { name: 'Linen Set', img: '/trends/linen.png' },
      { name: 'Air Fryer', img: '/trends/linen.png' }
    ],
  },
  {
    id: 3,
    username: 'Naina R.',
    initials: 'NR',
    occasion: 'Birthday',
    emoji: '🎉',
    items: [
      { name: 'Journal', img: '/trends/journal.png' },
      { name: 'Pendant', img: '/trends/pendant.png' }
    ],
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
  const { user } = useAuth();

  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero__banner">
            <div className="landing-hero__container">
              <div className="landing-hero__copy">

                <h1 className="landing-title">
                  Discover gifts you love and build a wishlist for gifts you&apos;ll actually want.
                </h1>
                <p className="landing-subtitle">
                  Browse ideas, add your favorites, and share your wishlist so loved ones always pick the perfect gift.
                </p>

                <div className="landing-actions">
                  <Link to="/discover" className="btn btn-primary btn-lg">
                    Explore Gift Ideas <ArrowRight size={18} />
                  </Link>
                  <Link to={user ? "/dashboard" : "/signup"} className="btn btn-outline btn-lg">
                    Create Your Wishlist <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="landing-trust-row">
                  <div className="landing-trust-tag">
                    <Sparkles size={16} aria-hidden="true" />
                    <span>Save anything you like into your personal wishlist and share it with loved ones.</span>
                  </div>
                </div>
              </div>

              <div className="landing-hero__panel">
                <div className="landing-hero-mockup-container">
                  <img 
                    src="/hero-mockup.png" 
                    alt="WishNest iPhone Mockup" 
                    className="landing-hero-mockup"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="landing-section landing-section--soft">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <CheckSquare size={12} />
              <span>SIMPLE 3-STEP PROCESS</span>
            </div>
            <h2>How WishNest Works</h2>
            <p>Creating and sharing your perfect wishlist takes less than a minute.</p>
          </div>

          <div className="landing-steps-grid">
            <div className="landing-step-card">
              <div className="landing-step-number">01</div>
              <h3>Build Your List</h3>
              <p>Add anything you love from any store or browse our curated gift ideas.</p>
            </div>
            <div className="landing-step-card">
              <div className="landing-step-number">02</div>
              <h3>Make it Personal</h3>
              <p>Add notes, sizes, and preferences so your loved ones get it exactly right.</p>
            </div>
            <div className="landing-step-card">
              <div className="landing-step-number">03</div>
              <h3>Share Your Wishlist</h3>
              <p>Send your private link via WhatsApp, email, or social media. No sign-up required for others to view.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing-section">
        <div className="container">
          <div className="landing-section__header">

            <div className="landing-section__eyebrow">
              <Gift size={12} />
              <span>GIFT IDEAS</span>
            </div>
            <h2>Occasions for Every Celebration</h2>
            <p>
              Build a clear, personal wishlist for every celebration—from birthdays to weddings—and keep gifting stress-free.
            </p>
          </div>

          <div className="landing-wishlist-grid">
            {sampleWishlists.map((wishlist) => (
              <article key={wishlist.id} className="landing-wishlist-card">
                <div className="landing-wishlist-card__top">
                  <div className={`landing-pill landing-pill--${wishlist.occasion.toLowerCase().replace(' ', '-')}`}>
                    <div className="landing-pill__emoji">{wishlist.emoji}</div>
                    <span>{wishlist.occasion}</span>
                  </div>
                  <div className="landing-wishlist-card__count">
                    {wishlist.items}
                  </div>
                </div>
                
                <div className="landing-wishlist-card__body">
                  <h3>{wishlist.name}</h3>
                  <p>{wishlist.note}</p>
                </div>

                <div className={`landing-wishlist-card__footer landing-wishlist-card__footer--${wishlist.occasion.toLowerCase().replace(' ', '-')}`}>
                  <Link to={user ? '/dashboard' : '/signup'} className="landing-wishlist-card__link">
                    Browse Gifts <ArrowRight size={16} />
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

          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <Link to="/discover" className="btn btn-secondary">
              Browse All Occasions <ArrowRight size={18} />
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
                <div className="landing-feed-card__header">
                  <div className="landing-feed-card__user">
                    <div className="landing-feed-card__avatar">{wishlist.initials}</div>
                    <div className="landing-feed-card__meta">
                      <h3>{wishlist.username}</h3>
                    </div>
                  </div>
                  <span className={getOccasionClass(wishlist.occasion)}>
                    {wishlist.emoji} {wishlist.occasion}
                  </span>
                </div>

                <div className={`landing-feed-card__grid landing-feed-card__grid--${wishlist.items.length}`}>
                  {wishlist.items.map((item) => (
                    <div key={item.name} className="landing-feed-card__item">
                      <div className="landing-feed-card__img-box">
                        <img src={item.img} alt={item.name} />
                      </div>
                      <div className="landing-feed-card__label">
                        <Gift size={14} />
                        <span>{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="landing-feed-card__footer">
                  <Link to="/discover" className="landing-feed-card__link">
                    View Wishlist <ArrowRight size={16} />
                  </Link>
                </div>
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
              Explore Gift Ideas
            </Link>
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
