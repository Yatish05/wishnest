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
import { formatCurrency } from '../utils/currency';
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

  return (
    <div className="landing-page landing-page--wishnest animate-fade-in">
      <SEO 
        title="WishNest — Free Wishlist & Gift Registry Maker" 
        description="Create and share your wishlist for any occasion. Let loved ones reserve items in 1 click so you never receive duplicate gifts."
        path="/"
      />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="container">
          <div className="landing-hero__banner">
            <div className="landing-hero__container">
              <div className="landing-hero__copy">

                <div className="landing-trust-tag mb-3" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.25)', padding: '6px 16px', borderRadius: '50px', color: '#FFFFFF', fontWeight: 700, fontSize: '13px' }}>
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
                <div style={{ background: 'rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(10px)', padding: '12px 18px', borderRadius: '12px', color: '#FFFFFF', fontSize: '13.5px', fontWeight: 500, marginBottom: '24px', border: '1px solid rgba(255, 255, 255, 0.3)' }}>
                  🎁 <strong>WishNest is not a store — we don&apos;t sell products.</strong> We help you curate, organize, and share wishlists so gifting is always spot on.
                </div>

                <div className="landing-actions">
                  <Link to="/ai-assistant" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <Sparkles size={18} /> Try AI Gift Finder
                  </Link>
                  <Link to="/discover" className="btn btn-outline btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: '#FFFFFF', borderColor: '#FFFFFF' }}>
                    Explore Gift Ideas <ArrowRight size={18} />
                  </Link>
                </div>
              </div>

              {/* Above the Fold Live Behavioral Preview (Wishlist Builder & AI Matching) */}
              <div className="landing-hero__panel">
                <div className="landing-behavior-preview card" style={{ background: '#FFFFFF', padding: '24px', borderRadius: '20px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', color: '#0F172A', border: '1.5px solid #E2E8F0' }}>
                  
                  {/* Shareable Link Banner */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#F8FAFC', borderRadius: '12px', marginBottom: '16px', border: '1px solid #E2E8F0' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600, color: '#334155' }}>
                      <Share2 size={15} style={{ color: '#EA580C' }} />
                      <span>wishnest.app/w/sarah-bday</span>
                    </div>
                    <span style={{ fontSize: '11px', background: '#FFEDD5', color: '#C2410C', fontWeight: 700, padding: '2px 8px', borderRadius: '50px' }}>
                      Copy Link
                    </span>
                  </div>

                  <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '12px', color: '#0F172A', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎂 Sarah&apos;s 30th Birthday Wishlist</span>
                  </h3>

                  {/* Sample Wishlist Items with Reservation States */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F0FDF4', borderRadius: '10px', border: '1px solid #DCFCE7' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: '#0F172A' }}>Smart Digital Picture Frame</span>
                        <span style={{ fontSize: '12px', color: '#16A34A', fontWeight: 600 }}>{formatCurrency(159)}</span>
                      </div>
                      <span style={{ fontSize: '11px', background: '#DCFCE7', color: '#15803D', fontWeight: 700, padding: '3px 10px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle size={12} /> Available
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#FFF7ED', borderRadius: '10px', border: '1px solid #FFEDD5' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: '#0F172A' }}>Weekend Spa & Aromatherapy Set</span>
                        <span style={{ fontSize: '12px', color: '#EA580C', fontWeight: 600 }}>{formatCurrency(85)}</span>
                      </div>
                      <span style={{ fontSize: '11px', background: '#FFEDD5', color: '#C2410C', fontWeight: 700, padding: '3px 10px', borderRadius: '50px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Gift size={12} /> Reserved 🎁
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 12px', background: '#F8FAFC', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div>
                        <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', color: '#0F172A' }}>Pour-Over Coffee Dripper Stand</span>
                        <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>{formatCurrency(45)}</span>
                      </div>
                      <span style={{ fontSize: '11px', background: '#E2E8F0', color: '#475569', fontWeight: 700, padding: '3px 10px', borderRadius: '50px' }}>
                        1-Click Reserve
                      </span>
                    </div>
                  </div>

                  {/* AI Finder Match Teaser */}
                  <div style={{ padding: '10px 12px', background: 'linear-gradient(135deg, #FFF8F5, #FFF1EB)', borderRadius: '12px', border: '1px solid #FDBA74', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#EA580C', marginBottom: '2px' }}>
                      <Sparkles size={13} /> AI Finder Recommendation
                    </div>
                    <p style={{ color: '#475569', margin: 0, lineHeight: 1.3 }}>
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
      <section className="landing-section">
        <div className="container">
          <div className="landing-section__header">
            <div className="landing-section__eyebrow">
              <Share2 size={12} />
              <span>THE SOCIAL GIFTING LOOP</span>
            </div>
            <h2>How Wishlist Sharing Works</h2>
            <p>Share your link with anyone. Friends view and reserve items without signing up.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
            <div className="card" style={{ padding: '24px', borderRadius: '18px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Share2 size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>1. Share Your Private Link</h3>
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.5 }}>
                Send your custom WishNest URL via WhatsApp, SMS, or social media. Anyone can view your wishlist instantly on any device.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '18px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#F0FDF4', color: '#16A34A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Gift size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>2. 1-Click Secret Reservation</h3>
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.5 }}>
                Friends click &ldquo;Reserve Gift&rdquo; to claim what they want to buy. Others see it is taken so nobody buys the same thing twice.
              </p>
            </div>

            <div className="card" style={{ padding: '24px', borderRadius: '18px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                <Heart size={24} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: '#0F172A' }}>3. Pure Delight, Zero Waste</h3>
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: 1.5 }}>
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
            <div className="landing-section__eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#FFF7ED', color: '#EA580C', padding: '4px 14px', borderRadius: '50px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
              <Sparkles size={14} />
              <span>AI GIFT FINDER IN ACTION</span>
            </div>
            <h2>Find the perfect gift in seconds.</h2>
            <p>
              Tell us the person, occasion, and budget — our AI instantly curates thoughtful gifts they&apos;ll actually love.
            </p>
          </div>

          <div className="landing-ai-showcase card" style={{ padding: '28px', borderRadius: '20px', background: 'linear-gradient(135deg, #FFFFFF, #FFF8F5)', border: '1.5px solid #FDBA74', marginBottom: '28px', boxShadow: '0 12px 32px rgba(249, 115, 22, 0.08)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #FED7AA' }}>
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#EA580C', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sample AI Search</span>
                <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1E293B', marginTop: '2px' }}>Shopping for Partner &bull; 30th Birthday &bull; $50–$150</h3>
              </div>
              <span className="tag" style={{ background: '#FFEDD5', color: '#C2410C', fontWeight: 700, padding: '6px 14px', borderRadius: '50px' }}>
                <Sparkles size={13} style={{ marginRight: '4px', inlineSize: 'auto' }} /> 3 Instant Matches Found
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: '12px' }}>98% Match</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>$159</span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Smart Digital Frame</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>&ldquo;Syncs photos from phone instantly — perfect for joint memories.&rdquo;</p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: '12px' }}>95% Match</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>$85</span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Weekend Spa Set</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>&ldquo;Relaxing organic aromas for a restful birthday weekend.&rdquo;</p>
              </div>

              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px', border: '1px solid #F1F5F9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: '12px' }}>92% Match</span>
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>$45</span>
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', marginBottom: '4px' }}>Pour-Over Dripper Stand</h4>
                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: '1.4' }}>&ldquo;Elegant tabletop coffee brewer for cozy mornings.&rdquo;</p>
              </div>
            </div>
          </div>

          <div className="landing-assistant-actions" style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
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
