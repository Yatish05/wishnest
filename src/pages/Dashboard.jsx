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
    username: 'Sarah J.',
    occasion: 'Birthday',
    items: ['Kindle Paperwhite', 'Leather Journal', 'Coffee Press'],
  },
  {
    id: 2,
    username: 'Kunal & Meera',
    occasion: 'Wedding',
    items: ['Dinnerware', 'Linen Set', 'Air Fryer'],
  },
  {
    id: 3,
    username: 'Michael R.',
    occasion: 'Moving In',
    items: ['Smart Lamp', 'Tool Kit', 'Wall Art'],
  },
  {
    id: 4,
    username: 'The Millers',
    occasion: 'Holiday',
    items: ['Ornaments', 'Baking Set', 'Board Games'],
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
  if (raw.includes('moving')) return 'Moving In';
  if (raw.includes('holiday')) return 'Holiday';

  return 'Wishlist';
}

function getOccasionClass(label) {
  switch (label) {
    case 'Birthday':
      return 'dashboard-tag dashboard-tag--birthday';
    case 'Wedding':
      return 'dashboard-tag dashboard-tag--wedding';
    case 'Moving In':
      return 'dashboard-tag dashboard-tag--moving';
    case 'Holiday':
      return 'dashboard-tag dashboard-tag--holiday';
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
    case 'Moving In':
      return 'dashboard-wishlist-card--moving';
    case 'Holiday':
      return 'dashboard-wishlist-card--holiday';
    default:
      return 'dashboard-wishlist-card--default';
  }
}

function OccasionTag({ label }) {
  return <span className={getOccasionClass(label)}>{label}</span>;
}

export default function Dashboard() {
  const { user, isSyncing, syncKey } = useAuth();
  const [wishlists, setWishlists] = React.useState(() => {
    try {
      const raw = localStorage.getItem('wishlists');
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  });
  const [loading, setLoading] = React.useState(true);
  const [showShareNudge, setShowShareNudge] = React.useState(true);

  const fetchData = async () => {
    // Don't fetch if we're in the middle of a profile sync
    if (isSyncing) return;
    
    setLoading(true);
    try {
      const wlRes = await api.get('/wishlists');
      const lists = Array.isArray(wlRes.data) ? wlRes.data : [];
      setWishlists(lists);
      try {
        localStorage.setItem('wishlists', JSON.stringify(lists));
      } catch (e) {
        // ignore storage errors
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    // Reset local state if user changes or sync is triggered
    if (!user?.id) {
      setWishlists([]);
      setLoading(false);
      return;
    }

    if (!isSyncing) {
      // Explicitly clear state before fetching to prevent ghost data flicker
      setWishlists([]); 
      fetchData();
    }
  }, [user?.id, isSyncing, syncKey]);

  const safeWishlists = Array.isArray(wishlists) ? wishlists : [];
  const visibleWishlists = safeWishlists;

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
              <span>Easy for birthdays, weddings, holidays and more</span>
              <span>Organise everything you&apos;d love to receive in one place</span>
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

              <Link to="/wishlists" className="btn btn-primary dashboard-hero__cta">
                <Plus size={18} /> New Wishlist
              </Link>
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

          <Link to="/wishlists" className="dashboard-primary-link">
            <Plus size={16} />
            <span>Start a fresh list</span>
          </Link>
        </div>

        {loading ? (
          <div className="dashboard-wishlist-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="dashboard-wishlist-card dashboard-wishlist-card--skeleton">
                <div className="skeleton-line skeleton-tag"></div>
                <div className="skeleton-line skeleton-title"></div>
                <div className="skeleton-line skeleton-text"></div>
                <div className="skeleton-actions">
                  <div className="skeleton-btn"></div>
                  <div className="skeleton-btn"></div>
                </div>
              </div>
            ))}
          </div>
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

              <Link to="/wishlists" className="dashboard-create-card">
                <div className="dashboard-create-card__icon">
                  <Plus size={28} />
                </div>
                <h3>Create New Wishlist</h3>
                <p>
                  Make a new list for an upcoming celebration and give loved ones a warm, helpful starting point.
                </p>
                <span className="dashboard-create-card__cta">
                  + Create New Wishlist
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
                  Create your first wishlist to make gifting easier, kinder, and more thoughtful for everyone.
                </p>
                <Link to="/wishlists" className="btn btn-primary">
                  Create Your First Wishlist
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
