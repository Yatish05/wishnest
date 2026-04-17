import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Edit3, Share2, ExternalLink, X, Image as ImageIcon, Lock, Globe, Eye, Check, Gift, Sparkles, Users, Package2, VenusAndMars } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, getCurrencySymbol } from '../utils/currency';
import './WishlistPage.css';

export default function WishlistPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const wishlistId = searchParams.get('id');
  const isGuest = user?.isGuest || user?.role === 'guest';

  const [wishlist, setWishlist] = useState(null);
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(!!wishlistId);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showCreateWishlist, setShowCreateWishlist] = useState(false);
  const [showEditWishlist, setShowEditWishlist] = useState(false);

  const [newItem, setNewItem] = useState({ name: '', link: '', notes: '', img: '' });
  const [editWishlistData, setEditWishlistData] = useState({ name: '', occasion: 'Birthday', visibility: 'public', gender: 'unisex' });
  const [imgPreview, setImgPreview] = useState(null);
  const [newWishlist, setNewWishlist] = useState({ name: '', occasion: 'Birthday', visibility: 'public', gender: 'unisex' });
  const [saving, setSaving] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(null);
  const [isSurprise, setIsSurprise] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  useEffect(() => {
    const handleClickOutside = () => setOpenMenuId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        callback(canvas.toDataURL('image/jpeg', 0.75));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleCopyLink = async () => {
    try {
      const shareUrl = `${window.location.origin}/wishlist/${wishlist._id}`;

      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }

      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);

    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Failed to copy link. Please copy manually.');
    }
  };

  useEffect(() => {
    if (wishlistId) {
      setLoading(true);
      const fetchWishlistData = async () => {
        try {
          const res = await api.get(`/wishlists/${wishlistId}`);
          if (res.data) {
            setWishlist(res.data);
          } else {
            setWishlist(null);
          }
        } catch (error) {
          console.error("Fetch wishlist error:", error);
          setWishlist(null);
        } finally {
          setLoading(false);
        }
      };
      fetchWishlistData();
    } else {
      setWishlist(null);
      setLoading(false);
    }
  }, [wishlistId]);


  useEffect(() => {
    if (!user?.id) return;
    const fetchAllWishlists = async () => {
      try {
        const res = await api.get('/wishlists');
        if (res.data) {
          setWishlists(Array.isArray(res.data) ? res.data : []);
        }
      } catch (error) {
        console.error("Fetch all wishlists error:", error);
      }
    };
    fetchAllWishlists();
  }, [user?.id]);

  const handleCreateWishlist = async () => {
    if (isGuest) {
      toast.error('Please log in to create more wishlists.');
      setShowCreateWishlist(false);
      return;
    }

    const { name, occasion, visibility, gender } = newWishlist;

    if (!user?.id) {
      alert("Please login to create a wishlist");
      return;
    }

    // Smart Default Name logic
    let finalName = name.trim();
    if (!finalName) {
      if (occasion === 'Birthday') finalName = 'Birthday Wishlist';
      else if (occasion === 'Wedding') finalName = 'Wedding Registry';
      else if (occasion === 'Anniversary') finalName = 'Anniversary Wishlist';
      else finalName = 'My Wishlist';
    }

    setSaving(true);
    try {
      // Use the new modular POST endpoint
      const response = await api.post('/wishlists', {
        name: finalName,
        occasion,
        visibility,
        isPublic: visibility === 'public',
        gender
      });

      if (response.data && response.data.success) {
        setWishlists(prev => [...prev, response.data.wishlist]);
        toast.success("Wishlist created! 🎁");
        
        // Auto-close modal after success
        setShowCreateWishlist(false);
        // Reset form
        setNewWishlist({ name: '', occasion: 'Birthday', visibility: 'public', gender: 'Myself' });

        if (response.data.wishlist?._id) {
          navigate(`/wishlists?id=${response.data.wishlist._id}`);
        }
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Create wishlist failed:", error);
      toast.error("Failed to create wishlist");
    } finally {
      setSaving(false);
      setShowCreateWishlist(false);
    }
  };

  const handleUpdateWishlist = async () => {
    setSaving(true);
    try {
      const response = await api.put(`/wishlists/${wishlistId}`, editWishlistData);
      if (response.data && response.data.success) {
        setWishlist(response.data.wishlist);
        setWishlists(prev => prev.map(w => w._id === wishlistId ? {
          ...w,
          name: editWishlistData.name,
          occasion: editWishlistData.occasion,
          visibility: editWishlistData.visibility,
          gender: editWishlistData.gender
        } : w));
        toast.success("Wishlist updated!");
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Update wishlist failed:", error);
      toast.error("Failed to update wishlist");
    } finally {
      setSaving(false);
      setShowEditWishlist(false);
    }
  };

  const handleAddItem = async () => {
    setSaving(true);
    try {
      const res = await api.post(`/wishlists/${wishlistId}/items`, newItem);
      if (res.data) {
        toast.success("Item added to wishlist!");
        setWishlist(prev => ({
          ...prev,
          items: [...(prev?.items || []), res.data]
        }));
        setNewItem({ name: '', link: '', notes: '', img: '' });
        setImgPreview(null);
        setShowAddItem(false);
      }
    } catch (error) {
      console.error("Add item error:", error);
      toast.error(error.response?.data?.error || "Failed to add item");
    } finally {
      setSaving(false);
    }
  };
  const items = Array.isArray(wishlist?.items) ? wishlist.items : [];
  const isOwner = user?.id === wishlist?.userId;
  const sharedCount = wishlist?.sharedWith?.length || 0;
  const visibleWishlists = isGuest ? wishlists.slice(0, 3) : wishlists;
  const hiddenWishlistCount = Math.max(wishlists.length - visibleWishlists.length, 0);
  const visibilityLabel = wishlist?.visibility
    ? wishlist.visibility.charAt(0).toUpperCase() + wishlist.visibility.slice(1)
    : 'Public';

  const handlePurchase = async (itemId) => {
    try {
      console.log("Wishlist ID:", wishlistId);
      console.log("Item ID:", itemId);

      if (!wishlistId) {
        console.error("Wishlist ID is missing");
        toast.error("Wishlist ID missing from URL");
        return;
      }

      const res = await api.post(`/wishlists/${wishlistId}/purchase`, {
        itemId,
        hiddenFromOwner: isSurprise
      });

      if (res.data) {
        setWishlist(res.data);
        const updatedItem = Array.isArray(res.data.items)
          ? res.data.items.find((item) => item._id === itemId)
          : null;
        toast.success(updatedItem?.isPurchased ? "Item marked as purchased! ✅" : "Item reset and available again.");
        console.log("Item purchased successfully");
      }
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error(error.response?.data?.message || "Failed to mark as purchased");
    } finally {
      setShowPurchaseModal(null);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm('Remove this item from your wishlist?')) return;
    try {
      await api.delete(`/wishlists/${wishlistId}/items/${itemId}`);
      setWishlist(prev => ({
        ...prev,
        items: prev.items.filter(item => item._id !== itemId)
      }));
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const handleDeleteWishlist = async () => {
    if (!window.confirm('Are you sure you want to delete this entire wishlist? This cannot be undone.')) return;
    try {
      await api.delete(`/wishlists/${wishlistId}`);
      toast.success('Wishlist deleted');
      navigate('/wishlists');
    } catch {
      toast.error('Failed to delete wishlist');
    }
  };

  return (
    <>
      <div className="wishlist-page animate-fade-in">

        {wishlist ? (
          <div className="wishlist-detail mb-8">
            <div className="wishlist-header-main">
              <div className="wishlist-hero">
                <div className="wishlist-title-block">
                  <div className="wishlist-kicker">
                    <Sparkles size={14} />
                    <span>Curated wishlist</span>
                  </div>
                  <h2 className="text-xl font-bold">{wishlist.name} 🎁</h2>
                  <div className="wishlist-meta">
                    <span className={`wishlist-meta-pill ${wishlist.visibility === 'private' ? 'is-private' : 'is-public'}`}>
                      {wishlist.visibility === 'private' ? <Lock size={14} /> : <Globe size={14} />}
                      {visibilityLabel}
                    </span>
                    <span>{items.length} items</span>
                    <span className="meta-dot"></span>
                    <span>{sharedCount} shared</span>
                  </div>
                </div>

                <div className="wishlist-header-actions">
                  {isOwner && (
                    <button className="btn btn-secondary" onClick={() => {
                        setEditWishlistData({
                           name: wishlist.name,
                           occasion: wishlist.occasion || 'Other',
                           visibility: wishlist.visibility || (wishlist.isPublic ? 'public' : 'private'),
                           gender: wishlist.gender || 'unisex'
                        });
                        setShowEditWishlist(true);
                    }}>
                      <Edit3 size={18} /> Edit
                    </button>
                  )}
                  <button
                    className="btn btn-primary"
                    onClick={handleCopyLink}
                    disabled={!wishlist || !wishlist._id || copied}
                    title={wishlist?.visibility === 'private' ? 'Make wishlist public to share' : 'Copy share link'}
                    style={{
                      opacity: copied ? 0.8 : 1,
                      cursor: copied ? 'default' : 'pointer'
                    }}
                  >
                    {copied ? <><Check size={18} /> ✓ Copied!</> : <><Share2 size={18} /> Copy Link</>}
                  </button>
                  {isOwner && (
                    <button
                      className="wishlist-icon-action wishlist-delete-action"
                      onClick={handleDeleteWishlist}
                      title="Delete wishlist"
                    >
                      🗑
                    </button>
                  )}
                </div>
              </div>

              <div className="wishlist-stats-row">
                <div className="wishlist-stat-card">
                  <div className="wishlist-stat-icon">
                    <Package2 size={18} />
                  </div>
                  <div>
                    <p className="wishlist-stat-label">Total items</p>
                    <strong className="wishlist-stat-value">{items.length}</strong>
                  </div>
                </div>
                <div className="wishlist-stat-card">
                  <div className="wishlist-stat-icon">
                    <Users size={18} />
                  </div>
                  <div>
                    <p className="wishlist-stat-label">People invited</p>
                    <strong className="wishlist-stat-value">{sharedCount}</strong>
                  </div>
                </div>
                <div className="wishlist-stat-card">
                  <div className="wishlist-stat-icon">
                    {wishlist.visibility === 'private' ? <Lock size={18} /> : <Globe size={18} />}
                  </div>
                  <div>
                    <p className="wishlist-stat-label">Visibility</p>
                    <strong className="wishlist-stat-value">{visibilityLabel}</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className="wishlist-items-surface">
              <div className={`items-grid ${items.length === 0 ? 'items-grid-empty' : ''}`}>
                {items.length > 0 ? items.map((item, i) => {
                const isPurchased = item.isPurchased;
                const isHidden = item.hiddenFromOwner;

                // Logic for status badge
                let displayStatus = isPurchased ? 'Purchased' : 'Available';
                if (isPurchased && isHidden && isOwner) displayStatus = 'Available';

                  return (
                    <div key={i} className="item-card">
                    {isOwner && (
                      <div className="item-card-menu-shell">
                        <button
                          className="item-card-menu-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(openMenuId === item._id ? null : item._id);
                          }}
                        >
                          ⋯
                        </button>

                        {openMenuId === item._id && (
                          <div className="item-card-menu">
                            <button
                              className="item-card-menu-delete"
                              onClick={() => {
                                handleDeleteItem(item._id);
                                setOpenMenuId(null);
                              }}
                            >
                              🗑 Delete item
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                    <div className="item-img-container">
                      {item.img ? (
                        <img src={item.img} alt={item.name} className="item-img" />
                      ) : (
                        <div className="item-img-placeholder">
                          <Gift size={48} strokeWidth={1.5} />
                        </div>
                      )}

                      <div className={`status-badge ${isPurchased ? 'badge-purchased' : 'badge-available'}`}>
                        {displayStatus}
                      </div>
                    </div>

                    <div className="item-content">
                      <div className="item-copy">
                        <div className="item-chip-row">
                          <span className="item-chip">{item.link ? 'Link attached' : 'No link yet'}</span>
                        </div>
                        <h3 className="item-name">{item.name}</h3>
                        <p className="item-notes">{item.notes || 'No additional notes provided.'}</p>
                      </div>

                      <div className="item-actions">
                        {displayStatus === 'Available' ? (
                          <button
                            className="btn btn-secondary flex-1"
                            onClick={() => setShowPurchaseModal(item)}
                          >
                            Mark Purchased
                          </button>
                        ) : (
                          <button
                            className="btn btn-secondary flex-1"
                            onClick={() => handlePurchase(item._id)}
                          >
                            Redo
                          </button>
                        )}
                        <button
                          className="btn btn-secondary icon-only"
                          disabled={!item.link}
                          onClick={() => item.link && window.open(item.link, '_blank', 'noopener,noreferrer')}
                        >
                          <ExternalLink size={18} />
                        </button>
                      </div>
                    </div>
                    </div>
                  );
                }) : (
                  <div className="wishlist-empty-state col-span-3">
                    <div className="wishlist-empty-copy text-center text-muted">
                      <p className="text-lg font-medium">No items in this wishlist.</p>
                      <p className="text-sm">Start this list with your first gift idea, product link, or note.</p>
                    </div>
                    <button className="add-item-panel wishlist-empty-action" onClick={() => setShowAddItem(true)}>
                      <div className="add-item-card">
                        <div className="add-icon-box">
                          <Plus size={24} />
                        </div>
                        <span className="font-bold text-sm">Add New Item</span>
                        <p className="add-item-subtitle">Drop in another product, note, or surprise idea.</p>
                      </div>
                    </button>
                  </div>
                )}

                {items.length > 0 && (
                  <button className="add-item-panel" onClick={() => setShowAddItem(true)}>
                    <div className="add-item-card">
                      <div className="add-icon-box">
                        <Plus size={24} />
                      </div>
                      <span className="font-bold text-sm">Add New Item</span>
                      <p className="add-item-subtitle">Drop in another product, note, or surprise idea.</p>
                    </div>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : wishlistId && !loading ? (
          <div className="text-center py-20 card mb-8">
            <h2 className="text-xl font-bold mb-2">Wishlist not found</h2>
            <p className="text-secondary">The wishlist you're looking for doesn't exist or you don't have access.</p>
          </div>
        ) : !wishlistId && !loading ? (
          <div className="wishlists-list-view">
            <div className="wishlists-overview">
              <div className="wishlists-overview-copy">
                <div className="wishlist-kicker">
                  <Sparkles size={14} />
                  <span>Your registry hub</span>
                </div>
                <h1 className="wishlists-overview-title">Wishlists that feel organized, shareable, and easy to manage.</h1>
                <p className="wishlists-overview-subtitle">
                  {isGuest
                    ? 'Browse a few saved lists in guest mode. Log in to unlock every wishlist and start creating your own.'
                    : 'Keep every occasion in one place, jump back into active lists, and create a new registry in seconds.'}
                </p>
              </div>
              {isGuest ? (
                <button className="btn btn-primary" onClick={() => navigate('/login')}>
                  <Eye size={18} /> Login To See More
                </button>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowCreateWishlist(true)}>
                  <Plus size={18} /> Create Wishlist
                </button>
              )}
            </div>

            <div className="wishlists-summary-row">
              <div className="wishlists-summary-card">
                <span className="wishlists-summary-label">Total wishlists</span>
                <strong className="wishlists-summary-value">{wishlists.length}</strong>
              </div>
              <div className="wishlists-summary-card">
                <span className="wishlists-summary-label">Public lists</span>
                <strong className="wishlists-summary-value">
                  {wishlists.filter((wl) => wl.visibility === 'public').length}
                </strong>
              </div>
              <div className="wishlists-summary-card">
                <span className="wishlists-summary-label">Occasions planned</span>
                <strong className="wishlists-summary-value">
                  {new Set(wishlists.map((wl) => wl.occasion)).size}
                </strong>
              </div>
            </div>

            {wishlists.length > 0 ? (
              <div className="wishlists-grid">
                {visibleWishlists.map((wl) => (
                  <div
                    key={wl._id}
                    className="wishlist-list-card card"
                    onClick={() => navigate(`/wishlists?id=${wl._id}`)}
                  >
                    <div className="wishlist-list-card-top">
                      <div className="wishlist-list-card-icon">🎁</div>
                      <div className={`wishlist-list-visibility ${wl.visibility === 'public' ? 'is-public' : 'is-private'}`}>
                        {wl.visibility === 'public' ? <Globe size={14} /> : <Lock size={14} />}
                        {wl.visibility === 'public' ? 'Public' : 'Private'}
                      </div>
                    </div>
                    <div className="wishlist-list-card-info">
                      <h3 className="font-bold">{wl.name}</h3>
                      <p className="text-sm text-secondary">
                        {wl.occasion} wishlist
                      </p>
                    </div>
                    <div className="wishlist-list-card-footer">
                      <div className="wishlist-list-meta">
                        <span>{Array.isArray(wl.items) ? wl.items.length : 0} items</span>
                        <span className="meta-dot"></span>
                        <span>{wl.sharedWith?.length || 0} shared</span>
                      </div>
                      <div className="wishlist-list-card-arrow">
                        <Eye size={18} />
                      </div>
                    </div>
                  </div>
                ))}
                {!isGuest && (
                  <button
                    className="wishlist-list-card card wishlist-list-card--add"
                    onClick={() => setShowCreateWishlist(true)}
                  >
                    <div className="wishlist-list-card-top">
                      <div className="wishlist-list-card-icon"><Plus size={22} /></div>
                    </div>
                    <div className="wishlist-list-card-info">
                      <h3 className="font-bold">New Wishlist</h3>
                      <p className="text-sm text-secondary">Create a new registry for your next occasion.</p>
                    </div>
                    <div className="wishlist-list-card-footer">
                      <div className="wishlist-list-meta">
                        <span>Fresh start</span>
                        <span className="meta-dot"></span>
                        <span>Ready in seconds</span>
                      </div>
                    </div>
                  </button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-10 w-full mb-12">
                {/* Guest / Empty Banners Group */}
                <div className="empty-state-centered">
                  <div className="text-center card" style={{ padding: '4rem 5rem' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎁</div>
                    <h2 className="text-xl font-bold mb-2">No wishlists yet</h2>
                    <p className="text-secondary" style={{ marginBottom: '1.5rem' }}>
                      {isGuest
                        ? 'Guest mode is view-only. Log in to create and manage your own wishlists.'
                        : 'Create your first wishlist and start adding items!'}
                    </p>
                    <button className="btn btn-primary" onClick={() => (isGuest ? navigate('/login') : setShowCreateWishlist(true))}>
                      {isGuest ? <><Eye size={18} /> Login To Continue</> : <><Plus size={18} /> Create Wishlist</>}
                    </button>
                  </div>
                </div>

                {hiddenWishlistCount > 0 && (
                  <div className="wishlists-guest-banner card" style={{ marginTop: 0 }}>
                    <div>
                      <p className="wishlists-guest-banner-title">More wishlists are hidden in guest mode</p>
                      <p className="wishlists-guest-banner-copy">
                        You can view 3 lists for now. Log in to unlock the remaining {hiddenWishlistCount} wishlist{hiddenWishlistCount > 1 ? 's' : ''}.
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={() => navigate('/login')}>
                      Login To See More
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="wishlist-detail-skeleton">
            <div className="wishlist-header-main skeleton">
              <div className="skeleton-line skeleton-titleLarge"></div>
              <div className="skeleton-line skeleton-meta"></div>
              <div className="wishlist-stats-row">
                <div className="skeleton-pill"></div>
                <div className="skeleton-pill"></div>
                <div className="skeleton-pill"></div>
              </div>
            </div>
            <div className="items-grid">
              {[1, 2, 3].map(i => (
                <div key={i} className="item-card skeleton">
                  <div className="skeleton-img"></div>
                  <div className="item-content">
                    <div className="skeleton-line skeleton-title"></div>
                    <div className="skeleton-line skeleton-text"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Add Item Modal */}
      {showAddItem && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in">
            <div className="modal-header flex-between">
              <h3 className="font-bold text-lg">Add New Item</h3>
              <button className="btn-text" onClick={() => setShowAddItem(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label>Item Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Apple Watch Series 9"
                    value={newItem.name}
                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Product Link</label>
                  <input
                    type="url"
                    className="input-field"
                    placeholder="https://..."
                    value={newItem.link}
                    onChange={(e) => setNewItem({ ...newItem, link: e.target.value })}
                  />
                </div>
                <div className="form-group mb-2">
                  <label>Upload Image</label>
                  <div
                    className="image-upload-area"
                    onClick={() => document.getElementById('item-img-input').click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        compressImage(file, (compressed) => {
                          setImgPreview(compressed);
                          setNewItem(prev => ({ ...prev, img: compressed }));
                        });
                      }
                    }}
                    style={{ cursor: 'pointer', position: 'relative' }}
                  >
                    <input
                      id="item-img-input"
                      type="file"
                      accept="image/*"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        compressImage(file, (compressed) => {
                          setImgPreview(compressed);
                          setNewItem(prev => ({ ...prev, img: compressed }));
                        });
                      }}
                    />
                    {imgPreview ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={imgPreview}
                          alt="Preview"
                          style={{ width: '100%', maxHeight: '160px', objectFit: 'cover', borderRadius: '10px' }}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setImgPreview(null);
                            setNewItem(prev => ({ ...prev, img: '' }));
                          }}
                          style={{
                            position: 'absolute', top: 6, right: 6,
                            background: 'rgba(0,0,0,0.5)', color: '#fff',
                            border: 'none', borderRadius: '50%', width: 28, height: 28,
                            cursor: 'pointer', fontSize: 14, display: 'flex',
                            alignItems: 'center', justifyContent: 'center'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <>
                        <ImageIcon size={32} color="var(--color-text-muted)" />
                        <p className="text-sm mt-2">Click or drag image here</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="form-group">
                  <label>Notes</label>
                  <textarea
                    className="input-field"
                    rows="3"
                    placeholder="Size, color, etc."
                    value={newItem.notes}
                    onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  ></textarea>
                </div>
                <div className="modal-footer mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddItem(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleAddItem}
                    disabled={saving || !newItem.name}
                  >
                    {saving ? 'Saving...' : 'Save Item'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Wishlist Modal */}
      {showCreateWishlist && !isGuest && (
        <div className="modal-overlay">
          <div className="modal card premium-modal">
            <div className="modal-header flex-between">
              <div>
                <h3 className="premium-modal-title">🎁 Create your wishlist</h3>
                <p className="modal-subtitle">Takes less than 10 seconds.</p>
              </div>
              <button className="btn-text" onClick={() => setShowCreateWishlist(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label className="premium-label">Wishlist Name</label>
                  <input
                    type="text"
                    className="input-field premium-input"
                    placeholder="e.g. Wedding Registry"
                    value={newWishlist.name}
                    autoFocus
                    onChange={(e) => setNewWishlist({ ...newWishlist, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="premium-label">Occasion</label>
                  <select
                    className="input-field premium-input"
                    value={newWishlist.occasion}
                    onChange={(e) => setNewWishlist({ ...newWishlist, occasion: e.target.value })}
                  >
                    <option>Birthday</option>
                    <option>Wedding</option>
                    <option>Anniversary</option>
                    <option>Holiday</option>
                    <option>Moving In</option>
                    <option>Baby Shower</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="premium-label">Visibility</label>
                  <select
                    className="input-field premium-input"
                    value={newWishlist.visibility}
                    onChange={(e) => setNewWishlist({ ...newWishlist, visibility: e.target.value })}
                  >
                    <option value="public">🌍 Public (Anyone with link)</option>
                    <option value="private">🔒 Private (Only me)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="premium-label">Who is this for?</label>
                  <select
                    className="input-field premium-input"
                    value={newWishlist.gender}
                    onChange={(e) => setNewWishlist({ ...newWishlist, gender: e.target.value })}
                  >
                    <option value="Myself">Myself</option>
                    <option value="Him">Him</option>
                    <option value="Her">Her</option>
                    <option value="Kids">Kids</option>
                    <option value="Anyone">Anyone</option>
                  </select>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-primary premium-create-btn"
                    disabled={saving}
                    onClick={handleCreateWishlist}
                  >
                    {saving ? 'Creating...' : 'Create Wishlist'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Edit Wishlist Modal */}
      {showEditWishlist && !isGuest && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in">
            <div className="modal-header flex-between">
              <h3 className="font-bold text-lg">Edit Wishlist</h3>
              <button className="btn-text" onClick={() => setShowEditWishlist(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <form className="modal-form">
                <div className="form-group">
                  <label>Wishlist Name</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Wedding Registry"
                    value={editWishlistData.name}
                    onChange={(e) => setEditWishlistData({ ...editWishlistData, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Occasion</label>
                  <select
                    className="input-field"
                    value={editWishlistData.occasion}
                    onChange={(e) => setEditWishlistData({ ...editWishlistData, occasion: e.target.value })}
                  >
                    <option>Birthday</option>
                    <option>Wedding</option>
                    <option>Holiday</option>
                    <option>Moving In</option>
                    <option>Baby Shower</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Visibility</label>
                  <select
                    className="input-field"
                    value={editWishlistData.visibility}
                    onChange={(e) => setEditWishlistData({ ...editWishlistData, visibility: e.target.value })}
                  >
                    <option value="public">🌍 Public (Anyone with link)</option>
                    <option value="private">🔒 Private (Only me)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label><VenusAndMars size={15} /> Discover Gender</label>
                  <select
                    className="input-field"
                    value={editWishlistData.gender}
                    onChange={(e) => setEditWishlistData({ ...editWishlistData, gender: e.target.value })}
                  >
                    <option value="unisex">Unisex</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="modal-footer mt-4">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditWishlist(false)}>Cancel</button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={saving || !editWishlistData.name}
                    onClick={handleUpdateWishlist}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && (
        <div className="modal-overlay">
          <div className="modal card animate-fade-in" style={{ maxWidth: '400px' }}>
            <div className="modal-header flex-between">
              <h3 className="font-bold text-lg">Confirm Purchase</h3>
              <button className="btn-text" onClick={() => setShowPurchaseModal(null)}><X size={20} /></button>
            </div>
            <div className="modal-body text-center">
              <p className="mb-6">Are you sure you want to mark <strong>{showPurchaseModal.name}</strong> as purchased?</p>

              <div className="form-group mb-6" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="surprise"
                  checked={isSurprise}
                  onChange={(e) => setIsSurprise(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="surprise" style={{ cursor: 'pointer', fontSize: '0.9rem' }}>Keep this purchase a surprise</label>
              </div>

              <div className="modal-footer flex-center gap-3">
                <button type="button" className="btn btn-secondary w-full" onClick={() => setShowPurchaseModal(null)}>Cancel</button>
                <button
                  type="button"
                  className="btn btn-primary w-full"
                  onClick={() => handlePurchase(showPurchaseModal._id)}
                >
                  Confirm
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
