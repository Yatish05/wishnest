import React from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarHeart,
  Eye,
  Gift,
  HeartHandshake,
  LogIn,
  Pencil,
  Plus,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './Dashboard.css';

const inspirationWishlists = [
  {
    id: 1,
    username: 'Aarohi S.',
    occasion: 'Rakhi',
    items: ['Fragrance Set', 'Silk Stole', 'Coffee Press'],
  },
  {
    id: 2,
    username: 'Kunal & Meera',
    occasion: 'Wedding',
    items: ['Dinnerware', 'Linen Set', 'Air Fryer'],
  },
  {
    id: 3,
    username: 'Naina R.',
    occasion: 'Birthday',
    items: ['Kindle', 'Journal', 'Pendant'],
  },
  {
    id: 4,
    username: 'The Malhotras',
    occasion: 'Diwali',
    items: ['Table Lamp', 'Serveware', 'Wall Art'],
  },
];

const thumbnailClasses = [
  'dashboard-feed-thumb--indigo',
  'dashboard-feed-thumb--sky',
  'dashboard-feed-thumb--blue',
];

function inferOccasion(list) {
  const raw = `${list?.occasion || ''} ${list?.name || ''}`.toLowerCase();

  if (raw.includes('birthday')) return 'Birthday';
  if (raw.includes('wedding')) return 'Wedding';
  if (raw.includes('diwali')) return 'Diwali';
  if (raw.includes('rakhi')) return 'Rakhi';

  return 'Wishlist';
}

function getOccasionClass(label) {
  switch (label) {
    case 'Birthday':
      return 'dashboard-tag dashboard-tag--birthday';
    case 'Wedding':
      return 'dashboard-tag dashboard-tag--wedding';
    case 'Diwali':
      return 'dashboard-tag dashboard-tag--diwali';
    case 'Rakhi':
      return 'dashboard-tag dashboard-tag--rakhi';
    default:
      return 'dashboard-tag';
  }
}

function getWishlistAccent(occasion) {
  switch (occasion) {
    case 'Birthday':
      return 'dashboard-wishlist-card--birthday';
    case 'Wedding':
      return 'dashboard-wishlist-card--wedding';
    case 'Diwali':
      return 'dashboard-wishlist-card--diwali';
    case 'Rakhi':
      return 'dashboard-wishlist-card--rakhi';
    default:
      return 'dashboard-wishlist-card--default';
  }
}

function OccasionTag({ label }) {
  return <span className={getOccasionClass(label)}>{label}</span>;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [wishlists, setWishlists] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [showShareNudge, setShowShareNudge] = React.useState(true);
  const isGuest = user?.isGuest || user?.role === 'guest';

  const fetchData = async () => {
    setLoading(true);
    try {
      const wlRes = await api.get('/wishlists');
      setWishlists(Array.isArray(wlRes.data) ? wlRes.data : []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) fetchData();
  }, [user?.id]);

  const safeWishlists = Array.isArray(wishlists) ? wishlists : [];
  const visibleWishlists = isGuest ? safeWishlists.slice(0, 3) : safeWishlists;
  const hiddenWishlistCount = Math.max(safeWishlists.length - visibleWishlists.length, 0);

  const totalItems = safeWishlists.reduce((acc, curr) => acc + (curr.items?.length || 0), 0);

  const upcomingLabel = React.useMemo(() => {
    const firstOccasion = visibleWishlists[0] ? inferOccasion(visibleWishlists[0]) : 'occasion';
    return firstOccasion === 'Wishlist' ? 'occasion' : firstOccasion.toLowerCase();
  }, [visibleWishlists]);

  return (
    <div className="dashboard-page dashboard-page--wishnest animate-fade-in">
      <section className="dashboard-hero">
        <div className="dashboard-hero__glow dashboard-hero__glow--one" />
        <div className="dashboard-hero__glow dashboard-hero__glow--two" />

        <div className="dashboard-hero__content">
          <div className="dashboard-hero__copy">
            <div className="dashboard-hero__kicker">
              <HeartHandshake size={16} />
              <span>Sharing helps your people choose with confidence</span>
            </div>

            <h1>Your wishlist isn&apos;t a demand — it&apos;s a gift to the people who love you.</h1>
            <p className="dashboard-hero__lead">
              They already want to get you something. You&apos;re just helping them get it right.
            </p>

            <div className="dashboard-hero__chips">
              <span>Easy for birthdays, weddings, Diwali, Rakhi and more</span>
              <span>Affiliate links simply help you organise what you&apos;d love to receive</span>
            </div>
          </div>

          <aside className="dashboard-hero__panel">
            <div className="dashboard-hero__emoji" aria-hidden="true">
              🎁✨💙
            </div>
            <p>Kind guidance for generous gift-givers.</p>

            <div className="dashboard-hero__stats">
              <div className="dashboard-hero-stat">
                <span>Lists</span>
                <strong>{safeWishlists.length}</strong>
              </div>
              <div className="dashboard-hero-stat">
                <span>Items</span>
                <strong>{totalItems}</strong>
              </div>
            </div>

            {isGuest ? (
              <Link to="/login" className="btn btn-primary dashboard-hero__cta">
                <LogIn size={18} /> Login To Unlock More
              </Link>
            ) : (
              <Link to="/wishlists" className="btn btn-primary dashboard-hero__cta">
                <Plus size={18} /> New Wishlist
              </Link>
            )}
          </aside>
        </div>
      </section>

      <section className="dashboard-section">
        <div className="dashboard-section__header">
          <div>
            <div className="dashboard-section__eyebrow">
              <CalendarHeart size={16} />
              <span>Your wishlists</span>
            </div>
            <h2>Keep every occasion easy to share</h2>
            <p>
              A clear wishlist helps family and friends feel thoughtful, not unsure. Make it easier for them to pick
              something you&apos;ll genuinely love.
            </p>
          </div>

          <Link to={isGuest ? '/login' : '/wishlists'} className="dashboard-primary-link">
            <Plus size={16} />
            <span>{isGuest ? 'Login to create a list' : 'Start a fresh list'}</span>
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-state-card">Loading your wishlists...</div>
        ) : (
          <>
            <div className="dashboard-wishlist-grid">
              {visibleWishlists.map((list) => {
                const occasion = inferOccasion(list);
                const itemCount = list.items?.length || 0;
                const purchasedCount = list.items?.filter((item) => item.isPurchased).length || 0;

                return (
                  <article
                    key={list._id}
                    className={`dashboard-wishlist-card ${getWishlistAccent(occasion)}`}
                  >
                    <div className="dashboard-wishlist-card__shine" />
                    <div className="dashboard-wishlist-card__header">
                      <div>
                        <OccasionTag label={occasion} />
                        <h3>{list.name}</h3>
                        <p className="dashboard-wishlist-card__sub">
                          {itemCount > 0
                            ? 'Helping your people choose with confidence.'
                            : 'Start adding hints for loved ones.'}
                        </p>                      </div>

                      <div className="dashboard-wishlist-card__count">
                        <span>Items</span>
                        <strong>{itemCount}</strong>
                      </div>
                    </div>

                    <div className="dashboard-wishlist-card__note">
                      <strong>Sharing note:</strong>
                      <span>
                        {purchasedCount > 0
                          ? ' Helps avoid duplicates.'
                          : ' Helps others choose what you’ll truly use.'}
                      </span>
                    </div>
                    <div className="dashboard-wishlist-card__actions">
                      <div className="dashboard-wishlist-card__actions-top">
                        <Link to={`/wishlists?id=${list._id}`} className="dashboard-dark-button">
                          <Share2 size={16} />
                          <span>Share</span>
                        </Link>
                        <Link to={`/wishlists?id=${list._id}`} className="dashboard-light-button">
                          <Pencil size={16} />
                          <span>Edit</span>
                        </Link>
                      </div>
                      <Link to={`/wishlists?id=${list._id}`} className="dashboard-light-button dashboard-view-button">
                        <Eye size={16} />
                        <span>View</span>
                      </Link>
                    </div>
                  </article>
                );
              })}

              <Link to={isGuest ? '/login' : '/wishlists'} className="dashboard-create-card">
                <div className="dashboard-create-card__icon">
                  <Plus size={28} />
                </div>
                <h3>{isGuest ? 'Unlock Your Own Wishlist' : 'Create New Wishlist'}</h3>
                <p>
                  {isGuest
                    ? 'Sign in to create lists for birthdays, weddings, Diwali, Rakhi, and every celebration in between.'
                    : 'Make a new list for an upcoming celebration and give loved ones a warm, helpful starting point.'}
                </p>
                <span className="dashboard-create-card__cta">
                  {isGuest ? 'Login to Create' : '+ Create New Wishlist'}
                </span>
              </Link>
            </div>

            {!safeWishlists.length && (
              <div className="dashboard-empty-card">
                <div className="dashboard-empty-card__icon">
                  <Gift size={30} />
                </div>
                <h3>No wishlists yet</h3>
                <p>
                  {isGuest
                    ? 'Sign in to create and share wishlists with the people who already want to celebrate you well.'
                    : 'Create your first wishlist to make gifting easier, kinder, and more thoughtful for everyone.'}
                </p>
                <Link to={isGuest ? '/login' : '/wishlists'} className="btn btn-primary">
                  {isGuest ? 'Login To Continue' : 'Create Your First Wishlist'}
                </Link>
              </div>
            )}

            {hiddenWishlistCount > 0 && (
              <div className="dashboard-guest-banner">
                <div>
                  <p className="dashboard-guest-banner__title">More wishlists are waiting</p>
                  <p className="dashboard-guest-banner__copy">
                    You&apos;re seeing 3 of {safeWishlists.length} wishlists in guest mode. Log in to view the rest and
                    manage everything in one place.
                  </p>
                </div>
                <Link to="/login" className="btn btn-primary">
                  <LogIn size={18} /> Login To See More
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <section className="dashboard-section">
        <div className="dashboard-feed-header">
          <h2>What others are wishing for 👀</h2>
          <p>Browse popular wishlists for gift ideas</p>
          <p className="dashboard-feed-header__detail">
            Seeing how others phrase their lists can make sharing feel less awkward and more helpful.
          </p>
        </div>

        <div className="dashboard-feed">
          {inspirationWishlists.map((wishlist) => (
            <article key={wishlist.id} className="dashboard-feed-card">
              <div className="dashboard-feed-card__top">
                <div>
                  <h3>{wishlist.username}</h3>
                  <p>A wishlist that feels easy to gift from</p>
                </div>
                <OccasionTag label={wishlist.occasion} />
              </div>

              <div className="dashboard-feed-card__items">
                {wishlist.items.map((item, index) => (
                  <div key={item} className="dashboard-feed-thumb">
                    <div className={`dashboard-feed-thumb__box ${thumbnailClasses[index % thumbnailClasses.length]}`}>
                      <Gift size={18} />
                    </div>
                    <p>{item}</p>
                  </div>
                ))}
              </div>

              <div className="dashboard-feed-card__copy">
                Nicely curated, easy to browse, and full of clues gift-givers can actually use.
              </div>

              <Link to="/discover" className="dashboard-soft-button">
                <Sparkles size={16} />
                <span>Get inspired</span>
              </Link>
            </article>
          ))}
        </div>
      </section>

      {showShareNudge && (
        <div className="dashboard-share-nudge">
          <div className="dashboard-share-nudge__inner">
            <div className="dashboard-share-nudge__emoji" aria-hidden="true">
              🎉
            </div>
            <p>
              <strong>Your {upcomingLabel} is coming up?</strong> Share your wishlist. Your people will thank you.
            </p>
            <button
              type="button"
              className="dashboard-share-nudge__dismiss"
              aria-label="Dismiss share reminder"
              onClick={() => setShowShareNudge(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
