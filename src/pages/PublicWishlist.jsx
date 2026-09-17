import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift, ExternalLink, CheckCircle, Circle, Package, Copy, Check, Sparkles, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';
import SEO from '../components/SEO';
import JsonLd from '../components/JsonLd';
import { useCurrency } from '../utils/currency';
import CurrencySelector from '../components/CurrencySelector';
import './PublicWishlist.css';

const OCCASION_EMOJI = {
  Birthday: '🎂',
  Wedding: '💍',
  Festival: '🎉',
  'Baby Shower': '🍼',
  Other: '🎁',
};

export default function PublicWishlist() {
  const { id, wishlistId } = useParams();
  const publicWishlistId = id || wishlistId;
  const { format } = useCurrency();

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);   // { status, message }
  const [copied, setCopied] = useState(false);
  const [activeItemModal, setActiveItemModal] = useState(null);
  const [isSurprise, setIsSurprise] = useState(false);
  const [reserving, setReserving] = useState(false);

  /* ─── Fetch ─── */
  useEffect(() => {
    if (!publicWishlistId) return;

    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/wishlists/public/${publicWishlistId}`);
        const data = res.data;
        setWishlist(data);
      } catch (err) {
        console.error('Public wishlist error:', err);
        const status = err.response?.status || 0;

        if (status === 403) {
          setError({ status: 403, message: 'This wishlist is private.' });
          return;
        }
        if (status === 404) {
          setError({ status: 404, message: 'Wishlist not found.' });
          return;
        }
        setError({ status: 0, message: 'Unable to load wishlist. Check your connection.' });
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [publicWishlistId]);

  /* ─── Copy share link ─── */
  const handleCopy = () => {
    const link = `${window.location.origin}/wishlist/${publicWishlistId}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      toast.success('Share link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  /* ─── Reservation Handler ─── */
  const handleToggleReservation = async (item, surpriseOverride) => {
    const targetItemId = item._id || item.id;
    setReserving(true);
    try {
      const isPurchased = item.purchased || item.isPurchased;
      const res = await api.post(`/wishlists/${publicWishlistId}/purchase`, {
        itemId: targetItemId,
        hiddenFromOwner: surpriseOverride !== undefined ? surpriseOverride : isSurprise,
      });

      if (res.data) {
        setWishlist(res.data);
        toast.success(isPurchased ? 'Item marked available again' : 'Item reserved! Gift owner notified 🎁');
      }
    } catch (err) {
      console.error('Reservation failed:', err);
      toast.error(err.response?.data?.message || 'Failed to update item reservation.');
    } finally {
      setReserving(false);
      setActiveItemModal(null);
      setIsSurprise(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="pw-shell">
        <div className="pw-loading">
          <div className="pw-spinner" />
          <p>Loading wishlist…</p>
        </div>
      </div>
    );
  }

  /* ─── Error ─── */
  if (error) {
    const icon = error.status === 403 ? '🔒' : error.status === 404 ? '🔍' : '⚠️';
    return (
      <div className="pw-shell">
        <div className="pw-error-box">
          <span className="pw-error-icon">{icon}</span>
          <h2 className="pw-error-title">
            {error.status === 403 ? 'Private Wishlist' :
             error.status === 404 ? 'Not Found' : 'Oops!'}
          </h2>
          <p className="pw-error-msg">{error.message}</p>
          <Link to="/" className="pw-home-btn">← Go to WishNest</Link>
        </div>
      </div>
    );
  }

  const occasionEmoji = OCCASION_EMOJI[wishlist.occasion] ?? '🎁';
  const items = Array.isArray(wishlist.items) ? wishlist.items : [];
  const availableCount = items.filter(i => !(i.purchased || i.isPurchased)).length;
  const purchasedCount = items.filter(i => (i.purchased || i.isPurchased)).length;

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": item.name,
        ...(item.img && { "image": item.img }),
        ...(item.price && {
          "offers": {
            "@type": "Offer",
            "price": item.price,
            "priceCurrency": "INR"
          }
        })
      }
    }))
  };

  return (
    <div className="pw-shell">
      <SEO 
        title={wishlist ? `${wishlist.name}'s Wishlist` : 'Wishlist'} 
        description={wishlist ? `View and purchase gifts from ${wishlist.name}'s ${wishlist.occasion} wishlist on WishNest.` : 'View this personal wishlist on WishNest.'}
        path={`/wishlist/${publicWishlistId}`}
        image={items.length > 0 && items[0].img ? items[0].img : undefined}
      />
      <JsonLd data={jsonLdData} />

      {/* ── Branded Top Bar ── */}
      <header className="pw-topbar">
        <Link to="/" className="pw-brand">
          <Gift size={22} /> WishNest
        </Link>
        <button className="pw-copy-btn" onClick={handleCopy}>
          {copied ? <><Check size={16} /> Copied!</> : <><Copy size={16} /> Copy Link</>}
        </button>
      </header>

      {/* ── Hero ── */}
      <div className="pw-hero">
        <div className="pw-hero-emoji">{occasionEmoji}</div>
        <h1 className="pw-title">{wishlist.name}</h1>
        {wishlist.occasion && (
          <span className="pw-occasion-badge">{wishlist.occasion}</span>
        )}
        <div className="pw-stats">
          <span><span className="pw-stat-num">{items.length}</span> Total items</span>
          <span className="pw-stat-dot" />
          <span><span className="pw-stat-num">{availableCount}</span> Available</span>
          <span className="pw-stat-dot" />
          <span><span className="pw-stat-num">{purchasedCount}</span> Purchased</span>
          <span className="pw-stat-dot" />
          <CurrencySelector compact />
        </div>
      </div>

      {/* ── Items ── */}
      <div className="pw-items-wrap">
        {items.length === 0 ? (
          <div className="pw-empty">
            <Package size={36} />
            <p>No items in this wishlist yet.</p>
          </div>
        ) : (
          <div className="pw-items-grid">
            {items.map((item) => {
              const isPurchased = item.purchased || item.isPurchased;
              const itemId = item._id || item.id;
              return (
                <div key={itemId} className={`pw-item-card ${isPurchased ? 'pw-item--purchased' : ''}`}>
                  {/* Image */}
                  {item.img ? (
                    <div className="pw-item-img-wrap">
                      <img src={item.img} alt={item.name} className="pw-item-img" />
                    </div>
                  ) : (
                    <div className="pw-item-img-placeholder">
                      <Gift size={32} />
                    </div>
                  )}

                  {/* Body */}
                  <div className="pw-item-body">
                    <div className="pw-item-top">
                      <h3 className="pw-item-name">{item.name}</h3>
                      {item.price ? (
                        <span className="pw-item-price" style={{ fontWeight: 600, color: '#16A34A', background: '#F0FDF4', padding: '2px 8px', borderRadius: '12px', fontSize: '13px' }}>
                          {format(item.price)}
                        </span>
                      ) : null}
                      <span className={`pw-status-badge ${isPurchased ? 'pw-badge--purchased' : 'pw-badge--available'}`}>
                        {isPurchased
                          ? <><CheckCircle size={13} /> Purchased</>
                          : <><Circle size={13} /> Available</>
                        }
                      </span>
                    </div>

                    {item.notes && (
                      <p className="pw-item-notes">{item.notes}</p>
                    )}

                    <div className="pw-item-actions-row">
                      {!isPurchased ? (
                        <button
                          type="button"
                          className="pw-reserve-btn"
                          onClick={() => setActiveItemModal(item)}
                        >
                          <Gift size={15} /> Reserve Gift
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="pw-unreserve-btn"
                          onClick={() => handleToggleReservation(item, false)}
                          disabled={reserving}
                        >
                          Mark Available
                        </button>
                      )}

                      {item.link && (
                        <a
                          href={item.link.startsWith('http') ? item.link : `https://${item.link}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pw-item-link"
                        >
                          <ExternalLink size={14} /> Store Link
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reserve Confirmation Modal ── */}
      {activeItemModal && (
        <div className="pw-modal-overlay" onClick={() => setActiveItemModal(null)}>
          <div className="pw-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pw-modal-header">
              <h3>Reserve "{activeItemModal.name}"</h3>
              <button className="pw-modal-close" onClick={() => setActiveItemModal(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="pw-modal-body">
              <p>Reserving prevents duplicate gifts by letting others know this item is taken.</p>
              
              <label className="pw-surprise-option">
                <input
                  type="checkbox"
                  checked={isSurprise}
                  onChange={(e) => setIsSurprise(e.target.checked)}
                />
                <span>
                  <strong>Keep as a surprise gift 🎁</strong>
                  <br />
                  <small style={{ color: '#64748B' }}>The list owner will see it as reserved without revealing which item it is.</small>
                </span>
              </label>
            </div>
            <div className="pw-modal-footer">
              <button
                type="button"
                className="pw-cancel-btn"
                onClick={() => setActiveItemModal(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="pw-confirm-btn"
                onClick={() => handleToggleReservation(activeItemModal)}
                disabled={reserving}
              >
                {reserving ? 'Reserving...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Footer ── */}
      <footer className="pw-footer">
        <p>Powered by <Link to="/">WishNest</Link> · Create your own free wishlist</p>
      </footer>

    </div>
  );
}
