import React, { useState, useEffect, useCallback } from 'react';
import { Bell, CheckCheck, Trash2, ShoppingBag, Gift, Info, Star } from 'lucide-react';
import api from '../utils/api';
import './Notifications.css';

/* ── Helpers ─────────────────────────────────────── */
function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

const TYPE_META = {
  purchase: { icon: <ShoppingBag size={18} />, color: '#10b981', bg: '#d1fae5' },
  share:    { icon: <Gift size={18} />,         color: '#6366f1', bg: '#ede9fe' },
  info:     { icon: <Info size={18} />,          color: '#3b82f6', bg: '#dbeafe' },
  new:      { icon: <Star size={18} />,          color: '#f59e0b', bg: '#fef3c7' },
};

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.info;
}

/* ── Component ───────────────────────────────────── */
export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [clearing, setClearing]           = useState(false);

  /* ─ Fetch ─ */
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/notifications');
      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError('Failed to load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  /* ─ Mark single as read ─ */
  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Mark read error:', err);
    }
  };

  /* ─ Mark all as read ─ */
  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Mark all read error:', err);
    }
  };

  /* ─ Clear all ─ */
  const clearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      setClearing(true);
      await api.delete('/notifications');
      setNotifications([]);
    } catch (err) {
      console.error('Clear notifications error:', err);
    } finally {
      setClearing(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  /* ── Render ── */
  return (
    <div className="notif-page animate-fade-in">

      {/* Header */}
      <div className="notif-header">
        <div>
          <h1 className="notif-title">
            Notifications
            {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
          </h1>
          <p className="text-secondary">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>

        {notifications.length > 0 && (
          <div className="notif-actions">
            {unreadCount > 0 && (
              <button className="btn btn-secondary" onClick={markAllRead}>
                <CheckCheck size={16} /> Mark all read
              </button>
            )}
            <button className="btn btn-danger" onClick={clearAll} disabled={clearing}>
              <Trash2 size={16} /> {clearing ? 'Clearing…' : 'Clear all'}
            </button>
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="notif-loading">
          <div className="notif-spinner" />
          <p className="text-secondary">Loading notifications…</p>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="notif-error card">{error}</div>
      )}

      {/* Empty */}
      {!loading && !error && notifications.length === 0 && (
        <div className="notif-empty">
          <div className="notif-empty-icon"><Bell size={36} /></div>
          <h2 className="text-xl font-bold mb-2">No notifications yet</h2>
          <p className="text-secondary">We'll let you know when something happens!</p>
        </div>
      )}

      {/* List */}
      {!loading && !error && notifications.length > 0 && (
        <div className="notif-list">
          {notifications.map((n) => {
            const meta = getTypeMeta(n.type);
            return (
              <div
                key={n._id}
                className={`notif-item ${n.read ? '' : 'notif-item--unread'}`}
                onClick={() => !n.read && markRead(n._id)}
                role={n.read ? undefined : 'button'}
                tabIndex={n.read ? undefined : 0}
                onKeyDown={(e) => e.key === 'Enter' && !n.read && markRead(n._id)}
                title={n.read ? undefined : 'Click to mark as read'}
              >
                {/* Icon */}
                <div
                  className="notif-icon"
                  style={{ background: meta.bg, color: meta.color }}
                >
                  {meta.icon}
                </div>

                {/* Content */}
                <div className="notif-content">
                  <p className={`notif-message ${n.read ? '' : 'notif-message--bold'}`}>
                    {n.message}
                  </p>
                  <p className="notif-time">{timeAgo(n.createdAt)}</p>
                </div>

                {/* Unread dot */}
                {!n.read && <div className="notif-dot" />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
