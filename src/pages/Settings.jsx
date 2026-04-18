import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Mail, Bell, Trash2, LogOut,
  Save, Shield, Check
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import './Settings.css';

/* ── Small helper ── */
function Section({ icon, title, children }) {
  return (
    <section className="settings-section card">
      <div className="settings-section-header">
        <div className="settings-section-icon">{icon}</div>
        <h2 className="settings-section-title">{title}</h2>
      </div>
      <div className="settings-section-body">{children}</div>
    </section>
  );
}

export default function Settings() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const settingsKey = [
    user?.id || 'guest',
    user?.name || '',
    user?.email || '',
    user?.preferences?.theme || 'light',
    user?.preferences?.notificationsEnabled ?? true,
    user?.preferences?.defaultVisibility || 'public',
  ].join(':');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <SettingsForm
      key={settingsKey}
      user={user}
      updateUser={updateUser}
      onLogout={handleLogout}
    />
  );
}

function SettingsForm({ user, updateUser, onLogout }) {
  const isGuest = false;
  const prefs = user?.preferences || {};

  const [name,                 setName]                 = useState(() => user?.name || '');
  const [email,                setEmail]                = useState(() => user?.email || '');
  const [theme]                                     = useState(() => prefs.theme || 'light');
  const [notifEnabled,         setNotifEnabled]         = useState(() => prefs.notificationsEnabled ?? true);
  const [defaultVisibility,    setDefaultVisibility]    = useState(() => prefs.defaultVisibility || 'public');
  const [profileSaved,         setProfileSaved]         = useState(false);
  const userId = user?.id || '—';

  /* ── Apply theme to <body> whenever it changes ── */
  useEffect(() => {
    document.body.className = theme === 'dark' ? 'dark' : '';
  }, [theme]);

  /* ── Save profile ── */
  const saveProfile = async () => {
    if (isGuest) return;

    try {
      const response = await api.put('/auth/profile', {
        name: name.trim(),
        email: email.trim(),
      });

      if (response.data?.user) {
        updateUser(response.data.user);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      }
    } catch (error) {
      console.error('Save profile error:', error);
    }
  };

  /* ── Toggle notifications pref ── */
  const savePreferences = async (nextPrefs) => {
    try {
      const response = await api.put('/auth/preferences', nextPrefs);
      if (response.data?.user) {
        updateUser(response.data.user);
      }
    } catch (error) {
      console.error('Save preferences error:', error);
    }
  };

  const toggleNotif = (val) => {
    setNotifEnabled(val);
    savePreferences({ notificationsEnabled: val });
  };

  const saveVisibility = (val) => {
    setDefaultVisibility(val);
    savePreferences({ defaultVisibility: val });
  };

  /* ── Clear local data ── */
  const clearData = () => {
    if (!window.confirm('Clear all local app data? This cannot be undone.')) return;
    [
      'token',
      'user',
      'authType',
      'userName',
      'userEmail',
      'defaultVisibility',
      'notificationsEnabled',
      'theme',
    ].forEach((key) => localStorage.removeItem(key));
    window.location.reload();
  };

  return (
    <div className="settings-page animate-fade-in">

      {/* Page title */}
      <div className="settings-header">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-secondary">Manage your profile and app preferences.</p>
      </div>

      {/* ── Profile ── */}
      <Section icon={<User size={20} />} title="Profile Information">
        <div className="settings-field">
          <label><User size={15} /> Display Name</label>
          <input
            type="text"
            className="input-field"
            placeholder={isGuest ? 'Guest account' : 'Your name'}
            value={name}
            onChange={e => setName(e.target.value)}
            disabled={isGuest}
          />
        </div>

        {isGuest ? (
          <div className="guest-settings-note">
            <div className="guest-settings-note-icon">
              <Shield size={18} />
            </div>
            <div>
              <p className="guest-settings-note-title">Guest account</p>
              <p className="guest-settings-note-copy">
                Guest mode keeps things lightweight. Email and user ID stay hidden until you log in with a full account.
              </p>
            </div>
          </div>
        ) : (
          <div className="settings-field">
            <label><Mail size={15} /> Email Address</label>
            <input
              type="email"
              className="input-field"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
        )}

        <div className="settings-field-row">
          {!isGuest && (
            <div className="settings-id-chip">
              <Shield size={14} />
              <span>User ID:</span>
              <code>{userId}</code>
            </div>
          )}
          {!isGuest && (
            <button
              className={`btn ${profileSaved ? 'btn-success' : 'btn-primary'}`}
              onClick={saveProfile}
            >
              {profileSaved
                ? <><Check size={16} /> Saved!</>
                : <><Save size={16} /> Save Profile</>
              }
            </button>
          )}
        </div>
      </Section>


      {/* ── Preferences ── */}
      <Section icon={<Bell size={20} />} title="Preferences">
        {/* Notifications toggle */}
        <div className="settings-toggle-row">
          <div>
            <p className="settings-toggle-label">Enable Notifications</p>
            <p className="settings-toggle-desc text-secondary">Receive alerts when items are purchased or lists are shared.</p>
          </div>
          <button
            className={`toggle-switch ${notifEnabled ? 'toggle-switch--on' : ''}`}
            onClick={() => toggleNotif(!notifEnabled)}
            aria-label="Toggle notifications"
          >
            <span className="toggle-thumb" />
          </button>
        </div>

        <div className="settings-divider" />

        {/* Default visibility */}
        <div className="settings-toggle-row">
          <div>
            <p className="settings-toggle-label">Default Wishlist Visibility</p>
            <p className="settings-toggle-desc text-secondary">New wishlists will default to this visibility setting.</p>
          </div>
          <select
            className="input-field settings-select"
            value={defaultVisibility}
            onChange={e => saveVisibility(e.target.value)}
          >
            <option value="public">🌍 Public</option>
            <option value="private">🔒 Private</option>
          </select>
        </div>
      </Section>

      {/* ── Account ── */}
      <Section icon={<Shield size={20} />} title="Account">
        <div className="settings-action-row">
          <div>
            <p className="settings-toggle-label">Clear Local Data</p>
            <p className="settings-toggle-desc text-secondary">Remove all locally cached wishlists and app data.</p>
          </div>
          <button className="btn btn-outline-danger" onClick={clearData}>
            <Trash2 size={16} /> Clear Data
          </button>
        </div>

        <div className="settings-divider" />

        <div className="settings-action-row">
          <div>
            <p className="settings-toggle-label">Sign Out</p>
            <p className="settings-toggle-desc text-secondary">Log out of your WishNest account.</p>
          </div>
          <button className="btn btn-danger-solid" onClick={onLogout}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </Section>

    </div>
  );
}
