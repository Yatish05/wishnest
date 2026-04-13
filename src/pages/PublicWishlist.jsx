import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Gift, ExternalLink, CheckCircle, Circle, Package, Copy, Check } from 'lucide-react';
import api from '../utils/api';
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

  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);   // { status, message }
  const [copied, setCopied] = useState(false);

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
      setTimeout(() => setCopied(false), 2000);
    });
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
  const availableCount = items.filter(i => !i.purchased).length;
  const purchasedCount = items.filter(i => i.purchased).length;

  return (
    <div className="pw-shell">

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
            {items.map((item) => (
              <div key={item._id} className={`pw-item-card ${item.purchased ? 'pw-item--purchased' : ''}`}>
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
                    <span className={`pw-status-badge ${item.purchased ? 'pw-badge--purchased' : 'pw-badge--available'}`}>
                      {item.purchased
                        ? <><CheckCircle size={13} /> Purchased</>
                        : <><Circle size={13} /> Available</>
                      }
                    </span>
                  </div>

                  {item.notes && (
                    <p className="pw-item-notes">{item.notes}</p>
                  )}

                  {item.link && (
                    <a href={item.link} target="_blank" rel="noopener noreferrer" className="pw-item-link">
                      <ExternalLink size={14} /> View item
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="pw-footer">
        <p>Powered by <Link to="/">WishNest</Link> · Create your own free wishlist</p>
      </footer>

    </div>
  );
}
