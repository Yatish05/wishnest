import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckSquare,
  Gift,
  Share2,
  Sparkles,
  CheckCircle,
  Heart
} from 'lucide-react';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import { useCurrency } from '../utils/currency';
import './LandingPage.css';

const sampleWishlists = [
  {
    id: 1,
    name: 'Birthday Hints',
    occasion: 'Birthday',
    emoji: '🎂',
    items: 14,
    note: 'A soft mix of books, skincare, and little luxuries people can feel good about gifting.',
  },
  {
    id: 2,
    name: 'Wedding Wishlist',
    occasion: 'Wedding',
    emoji: '💍',
    items: 21,
    note: 'A shared list for building a home together, without endless “what do you need?” messages.',
  },
  {
    id: 3,
    name: 'Home Essentials',
    occasion: 'Moving In',
    emoji: '🏡',
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
    items: [
      { name: 'Paperwhite', img: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c' },
      { name: 'Leather Journal', img: 'https://images.unsplash.com/photo-1512820790803-83ca734da794' }
    ],
  },
  {
    id: 2,
    username: 'Kunal & Meera',
    initials: 'KM',
    occasion: 'Wedding',
    emoji: '💍',
    items: [
      { name: 'Ceramic Dinnerware Set', img: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa' },
      { name: 'Linen Sheet Set', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af' }
    ],
  },
  {
    id: 3,
    username: 'Naina R.',
    initials: 'NR',
    occasion: 'Birthday',
    emoji: '🎉',
    items: [
      { name: 'Gold Link Bracelet', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338' },
      { name: 'Pendant Necklace', img: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f' }
    ],
  },
];

export default function LandingPage() {
  const { format } = useCurrency();

  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <SEO
        title="WishNest — Free Wishlist & Gift Registry Maker"
        description="Create and share your wishlist for any occasion. Let loved ones reserve items in 1 click so you never receive duplicate gifts."
        path="/"
      />
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "WishNest",
        "url": "https://www.wishnest.co.in/",
        "description": "Create and share your wishlist for any occasion. Let loved ones reserve items in 1 click so you never receive duplicate gifts.",
        "publisher": {
          "@type": "Organization",
          "name": "WishNest",
          "logo": "https://www.wishnest.co.in/favicon.png"
        }
      }} />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero__banner">
            <div className="landing-hero__container">
              <div className="landing-hero__copy">

                <div className="landing-trust-tag mb-3">
                  <Sparkles size={14} />
                  <span>100% Free Wishlist & Gift Finder</span>
                </div>

                <h1 className="landing-title">
                  Build your wishlist. Share it with anyone. Never receive duplicate gifts.
                </h1>
                <p className="landing-subtitle">
                  Create a shareable wishlist for any occasion or let our AI suggest thoughtful gift ideas. Loved ones reserve items in 1 click so gifting stays stress-free.
                </p>

                {/* Explicit Clarifying Banner */}
                <div className="landing-clarifying-banner">
                  🎁 <strong>WishNest is not a store — we don&apos;t sell products.</strong> We help you curate, organize, and share wishlists so gifting is always spot on.
                </div>

                <div className="landing-actions">
                  <Link to="/ai-assistant" className="btn btn-primary btn-lg">
                    <Sparkles size={18} /> Try AI Gift Finder
                  </Link>
                  <Link to="/discover" className="btn btn-outline btn-lg">
                    Explore Gift Ideas <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              {/* Above the Fold Live Behavioral Preview (Wishlist Builder & AI Matching) */}
              <div className="landing-hero__panel">
                <div className="landing-behavior-preview card">

                  {/* Shareable Link Banner */}
                  <div className="landing-preview-header">
                    <div className="landing-preview-link">
                      <Share2 size={15} className="landing-preview-icon" />
                      <span>wishnest.app/w/sarah-bday</span>
                    </div>
                    <span className="landing-preview-copy-btn">
                      Copy Link
                    </span>
                  </div>

                  <h3 className="landing-preview-title">
                    <span>🎂 Sarah&apos;s 30th Birthday Wishlist</span>
                  </h3>

                  {/* Sample Wishlist Items with Reservation States */}
                  <div className="landing-preview-items">
                    <div className="landing-preview-item available">
                      <div>
                        <span className="landing-preview-item-name">Smart Digital Picture Frame</span>
                        <span className="landing-preview-item-price">{format(159)}</span>
                      </div>
                      <span className="landing-preview-badge available">
                        <CheckCircle size={12} /> Available
                      </span>
                    </div>

                    <div className="landing-preview-item reserved">
                      <div>
                        <span className="landing-preview-item-name">Weekend Spa & Aromatherapy Set</span>
                        <span className="landing-preview-item-price">{format(85)}</span>
                      </div>
                      <span className="landing-preview-badge reserved">
                        <Gift size={12} /> Reserved 🎁
                      </span>
                    </div>

                    <div className="landing-preview-item clickable">
                      <div>
                        <span className="landing-preview-item-name">Pour-Over Coffee Dripper Stand</span>
                        <span className="landing-preview-item-price">{format(45)}</span>
                      </div>
                      <span className="landing-preview-badge action">
                        1-Click Reserve
                      </span>
                    </div>
                  </div>

                  {/* AI Finder Match Teaser */}
                  <div className="landing-preview-ai-teaser">
                    <div className="landing-preview-ai-header">
                      <Sparkles size={13} /> AI Finder Recommendation
                    </div>
                    <p className="landing-preview-ai-copy">
                      Matched <strong>Smart Digital Frame</strong> (98% match) — &ldquo;Syncs photos from phone for shared memories.&rdquo;
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Social Loop & Sharing Section */}
      <section className="landing-section landing-section--sharing">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <Share2 size={12} />
              <span>THE SOCIAL GIFTING LOOP</span>
            </div>
            <h2>How Wishlist Sharing Works</h2>
            <p>Share your link with anyone. Friends view and reserve items without signing up.</p>
          </div>

          <div className="landing-share-grid">
            <div className="landing-share-card card brand-amber">
              <div className="landing-share-icon amber">
                <Share2 size={24} />
              </div>
              <h3>1. Share Your Private Link</h3>
              <p>
                Send your custom WishNest URL via WhatsApp, SMS, or social media. Anyone can view your wishlist instantly on any device.
              </p>
            </div>

            <div className="landing-share-card card brand-emerald">
              <div className="landing-share-icon emerald">
                <Gift size={24} />
              </div>
              <h3>2. 1-Click Secret Reservation</h3>
              <p>
                Friends click &ldquo;Reserve Gift&rdquo; to claim what they want to buy. Others see it is taken so nobody buys the same thing twice.
              </p>
            </div>

            <div className="landing-share-card card brand-blue">
              <div className="landing-share-icon blue">
                <Heart size={24} />
              </div>
              <h3>3. Pure Delight, Zero Waste</h3>
              <p>
                You get gifts you genuinely love, and your loved ones enjoy stress-free gifting knowing their present is 100% appreciated.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="landing-section landing-section--soft">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <CheckSquare size={12} />
              <span>SIMPLE 3-STEP FLOW</span>
            </div>
            <h2>How WishNest Works</h2>
            <p>Creating and sharing your wishlist takes less than a minute.</p>
          </div>

          <div className="landing-steps-grid">
            <div className="landing-step-card">
              <div className="landing-step-number">01</div>
              <h3>Build Your Wishlist</h3>
              <p>Add items from any website or let our AI Assistant generate tailored gift ideas for your occasion.</p>
            </div>
            <div className="landing-step-card">
              <div className="landing-step-number">02</div>
              <h3>Share Your Link</h3>
              <p>Send your link via WhatsApp, email, or social media. No account or app download required for others to view.</p>
            </div>
            <div className="landing-step-card">
              <div className="landing-step-number">03</div>
              <h3>Zero Duplicate Gifts</h3>
              <p>Friends reserve items secretly in 1 click. You get gifts you actually want, and nobody double-buys.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Occasions Section */}
      <section id="features" className="landing-section">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <Gift size={12} />
              <span>GIFT REGISTRATION FOR ALL EVENTS</span>
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
                    {wishlist.items} items
                  </div>
                </div>

                <div className="landing-wishlist-card__body">
                  <h3>{wishlist.name}</h3>
                  <p>{wishlist.note}</p>
                </div>

                <div className={`landing-wishlist-card__footer landing-wishlist-card__footer--${wishlist.occasion.toLowerCase().replace(' ', '-')}`}>
                  <Link to="/discover" className="landing-wishlist-card__link">
                    Explore Ideas <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}

            <Link to="/ai-assistant" className="landing-create-card card">
              <div className="landing-create-card__icon">
                <Sparkles size={28} />
              </div>
              <h3>Try AI Gift Assistant</h3>
              <p>
                Tell us who you&apos;re shopping for — get instant recommendations with direct store links.
              </p>
              <span className="landing-create-card__cta">Try AI Finder</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Community Inspiration Feed */}
      <section className="landing-section landing-section--soft">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <Sparkles size={12} />
              <span>COMMUNITY WISHLISTS</span>
            </div>
            <h2>See how others curate their wishlists</h2>
            <p>Browse popular wishlists for inspiration and see how clean sharing can be.</p>
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
                  <div className={`landing-pill landing-pill--${wishlist.occasion.toLowerCase().replace(' ', '-')}`}>
                    <div className="landing-pill__emoji">{wishlist.emoji}</div>
                    <span>{wishlist.occasion}</span>
                  </div>
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
                    View Gift Ideas <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Live AI Assistant Showcase Box */}
      <section id="ai-assistant" className="landing-section landing-section--ai">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <Sparkles size={14} />
              <span>AI GIFT FINDER IN ACTION</span>
            </div>
            <h2>Find the perfect gift in seconds.</h2>
            <p>
              Tell us the person, occasion, and budget — our AI instantly curates thoughtful gifts they&apos;ll actually love.
            </p>
          </div>

          <div className="landing-ai-showcase card">
            <div className="landing-ai-showcase-header">
              <div>
                <span className="landing-ai-showcase-kicker">Sample AI Search</span>
                <h3 className="landing-ai-showcase-query">Shopping for Partner &bull; 30th Birthday &bull; {format(50)}–{format(150)}</h3>
              </div>
              <span className="tag landing-ai-showcase-badge">
                <Sparkles size={13} /> 3 Instant Matches Found
              </span>
            </div>

            <div className="landing-ai-showcase-grid">
              <div className="landing-ai-item-card">
                <div className="landing-ai-item-top">
                  <span className="landing-ai-match">98% Match</span>
                  <span className="landing-ai-price">{format(159)}</span>
                </div>
                <h4>Smart Digital Frame</h4>
                <p>&ldquo;Syncs photos from phone instantly — perfect for joint memories.&rdquo;</p>
              </div>

              <div className="landing-ai-item-card">
                <div className="landing-ai-item-top">
                  <span className="landing-ai-match">95% Match</span>
                  <span className="landing-ai-price">{format(85)}</span>
                </div>
                <h4>Weekend Spa Set</h4>
                <p>&ldquo;Relaxing organic aromas for a restful birthday weekend.&rdquo;</p>
              </div>

              <div className="landing-ai-item-card">
                <div className="landing-ai-item-top">
                  <span className="landing-ai-match">92% Match</span>
                  <span className="landing-ai-price">{format(45)}</span>
                </div>
                <h4>Pour-Over Dripper Stand</h4>
                <p>&ldquo;Elegant tabletop coffee brewer for cozy mornings.&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="landing-assistant-actions">
            <Link to="/ai-assistant" className="btn btn-primary btn-lg">
              Try AI Assistant <ArrowRight size={18} />
            </Link>
            <Link to="/discover" className="btn btn-secondary btn-lg">
              Browse Discover Ideas
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
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
              <p>Yes, 100% free! Creating, managing, and sharing your wishlists with friends and family requires no payment ever.</p>
            </article>
            <article className="landing-info-card card">
              <h3>How do I share my wishlist?</h3>
              <p>Simply copy your private wishlist link and send it via WhatsApp, email, or text. Friends can view and reserve items without signing up.</p>
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
