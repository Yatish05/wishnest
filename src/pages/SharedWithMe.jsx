import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gift, Users, Package, Share2, Sparkles, Globe, RefreshCw, Link2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './SharedWithMe.css';

export default function SharedWithMe() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [link, setLink] = useState('');
  const [addingLink, setAddingLink] = useState(false);
  const [linkError, setLinkError] = useState('');

  const extractWishlistId = (url) => {
    try {
      const parsed = new URL(url);
      const parts = parsed.pathname.split('/').filter(Boolean);
      return parts[parts.length - 1];
    } catch {
      const parts = url.split('/').filter(Boolean);
      return parts[parts.length - 1] || '';
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    const fetchShared = async () => {
      try {
        setLoading(true);
        setError(null);
        const sharedRes = await api.get('/wishlists/shared');
        const sharedLists = Array.isArray(sharedRes.data) ? sharedRes.data : [];
        setWishlists(sharedLists);
      } catch (err) {
        console.error('Shared wishlists fetch error:', err);
        setError('Failed to load shared wishlists. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchShared();
  }, [user?.id]);

  const handleAddLink = async () => {
    try {
      setAddingLink(true);
      setLinkError('');
      const wishlistId = extractWishlistId(link.trim());

      if (!wishlistId) {
        throw new Error('Please paste a valid wishlist link.');
      }

      const existingIds = new Set(wishlists.map((item) => item._id));
      if (existingIds.has(wishlistId)) {
        throw new Error('This wishlist is already in Shared With Me.');
      }

      const saveRes = await api.post(`/wishlists/${wishlistId}/save`);
      const nextList = saveRes.data?.wishlist;

      if (!nextList?._id) {
        throw new Error('Unable to save this wishlist.');
      }

      setWishlists((prev) => [...prev, nextList]);
      setLink('');
    } catch (err) {
      console.error('Invalid link', err);
      setLinkError(
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid wishlist link.'
      );
    } finally {
      setAddingLink(false);
    }
  };

  /* ─── Occasion emoji map ─── */
  const occasionEmoji = {
    Birthday: '🎂',
    Wedding: '💍',
    Festival: '🎉',
    'Baby Shower': '🍼',
    Other: '🎁',
  };

  return (
    <div className="shared-page animate-fade-in">

      {/* Page Header */}
      <div className="shared-header">
        <div className="shared-header-copy">
          <div className="shared-kicker">
            <Sparkles size={14} />
            <span>Shared registry space</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">Shared With Me</h1>
          <p className="text-secondary">Wishlists friends, family, and collaborators have shared with you.</p>
        </div>
        <div className="shared-header-badge">
          <Share2 size={16} />
          <span>{wishlists.length} shared lists</span>
        </div>
      </div>

      <div className="shared-summary-row">
        <div className="shared-summary-card">
          <span className="shared-summary-label">Shared lists</span>
          <strong className="shared-summary-value">{wishlists.length}</strong>
        </div>
        <div className="shared-summary-card">
          <span className="shared-summary-label">Public access</span>
          <strong className="shared-summary-value">{wishlists.filter((wl) => wl.visibility === 'public').length}</strong>
        </div>
        <div className="shared-summary-card">
          <span className="shared-summary-label">Total items</span>
          <strong className="shared-summary-value">
            {wishlists.reduce((total, wl) => total + (Array.isArray(wl.items) ? wl.items.length : (wl.itemCount ?? 0)), 0)}
          </strong>
        </div>
      </div>

      <div className="shared-link-panel">
        <div className="shared-link-copy">
          <div className="shared-link-title">
            <Link2 size={18} />
            <span>Paste wishlist link</span>
          </div>
          <p className="text-secondary">Paste any public WishNest link to save it here for quick access.</p>
        </div>
        <div className="shared-link-controls">
          <input
            type="text"
            placeholder="Paste wishlist link..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleAddLink} disabled={addingLink || !link.trim()}>
            <Plus size={16} /> {addingLink ? 'Adding...' : 'Add Link'}
          </button>
        </div>
        {linkError && <p className="shared-link-error">{linkError}</p>}
      </div>

      {/* States */}
      {loading && (
        <div className="shared-loading">
          <div className="loading-spinner" />
          <p className="text-secondary mt-3">Loading shared wishlists…</p>
        </div>
      )}

      {!loading && error && (
        <div className="shared-error card">
          <div className="shared-error-icon">
            <RefreshCw size={22} />
          </div>
          <div>
            <p className="text-danger font-medium">{error}</p>
            <p className="text-secondary">Check the server connection and try refreshing this page.</p>
          </div>
        </div>
      )}

      {!loading && !error && wishlists.length === 0 && (
        <div className="shared-empty">
          <div className="shared-empty-icon">
            <Share2 size={36} />
          </div>
          <h2 className="text-xl font-bold mb-2">Nothing shared yet</h2>
          <p className="text-secondary">
            When someone shares a wishlist with you, it will appear here.
          </p>
        </div>
      )}

      {!loading && !error && wishlists.length > 0 && (
        <div className="shared-grid">
          {wishlists.map((wl) => (
            <div
              key={wl._id}
              className="shared-card card"
              onClick={() => navigate(`/wishlists?id=${wl._id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(`/wishlists?id=${wl._id}`)}
            >
              <div className="shared-card-icon">
                {occasionEmoji[wl.occasion] || '🎁'}
              </div>

              <div className="shared-card-info">
                <div className="shared-card-header">
                  <h3 className="font-bold text-primary-dark">{wl.name}</h3>
                  <div className={`shared-visibility ${wl.visibility === 'public' ? 'is-public' : 'is-private'}`}>
                    {wl.visibility === 'public' ? <Globe size={13} /> : <Share2 size={13} />}
                    {wl.visibility === 'public' ? 'Public' : 'Private'}
                  </div>
                </div>
                <div className="shared-card-meta">
                  <span className="meta-chip">
                    <Users size={13} /> {wl.userId}
                  </span>
                  {wl.occasion && (
                    <span className="meta-chip">
                      <Gift size={13} /> {wl.occasion}
                    </span>
                  )}
                  <span className="meta-chip">
                    <Package size={13} /> {Array.isArray(wl.items) ? wl.items.length : (wl.itemCount ?? 0)} items
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
