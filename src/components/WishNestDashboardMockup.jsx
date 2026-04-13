import { useMemo, useState } from 'react';
import {
  CalendarHeart,
  Eye,
  Gift,
  HeartHandshake,
  Pencil,
  Plus,
  Share2,
  X,
} from 'lucide-react';
import './WishNestDashboardMockup.css';

const userWishlists = [
  {
    id: 1,
    name: 'Birthday Hints',
    occasion: 'Birthday',
    items: 14,
    accentClass: 'wishnest-wishlist-card--birthday',
    note: 'A gentle mix of books, skincare, and a couple of little luxuries.',
  },
  {
    id: 2,
    name: 'Diwali Home Glow-Up',
    occasion: 'Diwali',
    items: 9,
    accentClass: 'wishnest-wishlist-card--diwali',
    note: 'Thoughtful decor picks that make festive gifting feel personal.',
  },
  {
    id: 3,
    name: 'Wedding Wishlist',
    occasion: 'Wedding',
    items: 21,
    accentClass: 'wishnest-wishlist-card--wedding',
    note: 'A shared list for the home we are building together.',
  },
];

const inspirationWishlists = [
  {
    id: 1,
    username: 'Aarohi S.',
    occasion: 'Rakhi',
    items: [
      { id: 'a', label: 'Fragrance set', colorClass: 'wishnest-thumb--rose' },
      { id: 'b', label: 'Silk stole', colorClass: 'wishnest-thumb--orange' },
      { id: 'c', label: 'Coffee press', colorClass: 'wishnest-thumb--amber' },
    ],
  },
  {
    id: 2,
    username: 'Kunal & Meera',
    occasion: 'Wedding',
    items: [
      { id: 'a', label: 'Dinnerware', colorClass: 'wishnest-thumb--violet' },
      { id: 'b', label: 'Linen set', colorClass: 'wishnest-thumb--fuchsia' },
      { id: 'c', label: 'Air fryer', colorClass: 'wishnest-thumb--pink' },
    ],
  },
  {
    id: 3,
    username: 'Naina R.',
    occasion: 'Birthday',
    items: [
      { id: 'a', label: 'Kindle', colorClass: 'wishnest-thumb--emerald' },
      { id: 'b', label: 'Journal', colorClass: 'wishnest-thumb--teal' },
      { id: 'c', label: 'Pendant', colorClass: 'wishnest-thumb--cyan' },
    ],
  },
  {
    id: 4,
    username: 'The Malhotras',
    occasion: 'Diwali',
    items: [
      { id: 'a', label: 'Table lamp', colorClass: 'wishnest-thumb--yellow' },
      { id: 'b', label: 'Serveware', colorClass: 'wishnest-thumb--lime' },
      { id: 'c', label: 'Wall art', colorClass: 'wishnest-thumb--orange' },
    ],
  },
];

const occasionClassMap = {
  Birthday: 'wishnest-tag--birthday',
  Wedding: 'wishnest-tag--wedding',
  Diwali: 'wishnest-tag--diwali',
  Rakhi: 'wishnest-tag--rakhi',
};

function OccasionTag({ label }) {
  return (
    <span className={`wishnest-tag ${occasionClassMap[label] || ''}`}>
      {label}
    </span>
  );
}

function ItemThumbnail({ item }) {
  return (
    <div className="wishnest-thumb">
      <div className={`wishnest-thumb-box ${item.colorClass}`}>
        <Gift size={18} />
      </div>
      <p>{item.label}</p>
    </div>
  );
}

export default function WishNestDashboardMockup() {
  const [showShareNudge, setShowShareNudge] = useState(true);

  const totalItems = useMemo(
    () => userWishlists.reduce((sum, wishlist) => sum + wishlist.items, 0),
    []
  );

  return (
    <div className="wishnest-dashboard">
      <div className="wishnest-dashboard__inner">
        <section className="wishnest-hero">
          <div className="wishnest-hero__glow wishnest-hero__glow--top" />
          <div className="wishnest-hero__glow wishnest-hero__glow--bottom" />

          <div className="wishnest-hero__content">
            <div className="wishnest-hero__copy">
              <div className="wishnest-kicker">
                <HeartHandshake size={16} />
                <span>Sharing helps your people choose with confidence</span>
              </div>

              <h1>Your wishlist isn&apos;t a demand — it&apos;s a gift to the people who love you.</h1>
              <p className="wishnest-hero__lead">
                They already want to get you something. You&apos;re just helping them get it right.
              </p>

              <div className="wishnest-hero__chips">
                <span>Easy for birthdays, weddings, Diwali, Rakhi and more</span>
                <span>Affiliate links simply help you organise what you&apos;d love to receive</span>
              </div>
            </div>

            <aside className="wishnest-hero__panel">
              <div className="wishnest-hero__emoji" aria-hidden="true">
                🎁✨💛
              </div>
              <p>Kind guidance for generous gift-givers.</p>

              <div className="wishnest-hero__stats">
                <div className="wishnest-stat">
                  <span>Lists</span>
                  <strong>{userWishlists.length}</strong>
                </div>
                <div className="wishnest-stat">
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section className="wishnest-section">
          <div className="wishnest-section__header">
            <div>
              <div className="wishnest-section__eyebrow">
                <CalendarHeart size={16} />
                <span>Your wishlists</span>
              </div>
              <h2>Keep every occasion easy to share</h2>
              <p>
                A clear wishlist helps family and friends feel thoughtful, not unsure. Make it easy for them to pick
                something you&apos;ll genuinely love.
              </p>
            </div>

            <button type="button" className="wishnest-primary-action">
              <Plus size={16} />
              <span>Start a fresh list</span>
            </button>
          </div>

          <div className="wishnest-wishlist-grid">
            {userWishlists.map((wishlist) => (
              <article
                key={wishlist.id}
                className={`wishnest-wishlist-card ${wishlist.accentClass}`}
              >
                <div className="wishnest-wishlist-card__shine" />

                <div className="wishnest-wishlist-card__header">
                  <div>
                    <OccasionTag label={wishlist.occasion} />
                    <h3>{wishlist.name}</h3>
                  </div>

                  <div className="wishnest-wishlist-card__count">
                    <span>Items</span>
                    <strong>{wishlist.items}</strong>
                  </div>
                </div>

                <div className="wishnest-wishlist-card__actions">
                  <button type="button" className="wishnest-dark-button">
                    <Share2 size={16} />
                    <span>Share</span>
                  </button>
                  <button type="button" className="wishnest-light-button">
                    <Pencil size={16} />
                    <span>Edit</span>
                  </button>
                </div>
              </article>
            ))}

            <button type="button" className="wishnest-create-card">
              <div className="wishnest-create-card__icon">
                <Plus size={28} />
              </div>
              <h3>Create New Wishlist</h3>
              <p>
                Make a new list for an upcoming celebration and give loved ones a warm, helpful starting point.
              </p>
              <span className="wishnest-create-card__cta">+ Create New Wishlist</span>
            </button>
          </div>
        </section>

        <section className="wishnest-section">
          <div className="wishnest-feed-header">
            <h2>What others are wishing for 👀</h2>
            <p>Browse popular wishlists for gift ideas</p>
            <p className="wishnest-feed-header__detail">
              Sometimes seeing how others phrase their lists makes sharing feel more natural too.
            </p>
          </div>

          <div className="wishnest-feed">
            {inspirationWishlists.map((wishlist) => (
              <article key={wishlist.id} className="wishnest-feed-card">
                <div className="wishnest-feed-card__top">
                  <div>
                    <h3>{wishlist.username}</h3>
                    <p>A wishlist that feels easy to gift from</p>
                  </div>
                  <OccasionTag label={wishlist.occasion} />
                </div>

                <div className="wishnest-feed-card__items">
                  {wishlist.items.map((item) => (
                    <ItemThumbnail key={item.id} item={item} />
                  ))}
                </div>

                <div className="wishnest-feed-card__copy">
                  Nicely curated, easy to browse, and full of clues loved ones can actually use.
                </div>

                <button type="button" className="wishnest-soft-button">
                  <Eye size={16} />
                  <span>Get inspired</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      </div>

      {showShareNudge ? (
        <div className="wishnest-share-nudge">
          <div className="wishnest-share-nudge__inner">
            <div className="wishnest-share-nudge__emoji" aria-hidden="true">
              🎉
            </div>
            <p>
              <strong>Your birthday or occasion is coming up?</strong> Share your wishlist. Your people will thank you.
            </p>
            <button
              type="button"
              aria-label="Dismiss share reminder"
              className="wishnest-share-nudge__dismiss"
              onClick={() => setShowShareNudge(false)}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
