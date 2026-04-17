import bcrypt from 'bcryptjs';
import { supabase } from './_utils/supabase.js';
import generateToken from './_utils/generateToken.js';
import { protect } from './_utils/authMiddleware.js';
import { serializeUser } from './_utils/formatters.js';

export default async function handler(req, res) {
  const path = req.url.split('?')[0].replace('/api/auth', '').replace(/\/$/, '') || '/';

  // =============== REGISTER ===============
  if (path === '/register' && req.method === 'POST') {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) return res.status(400).json({ success: false, message: 'Name, email, and password are required' });

      const { data: existingUser } = await supabase.from('users').select('id').eq('email', email.toLowerCase()).single();
      if (existingUser) return res.status(400).json({ success: false, message: 'An account with that email already exists' });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const { data: user, error } = await supabase.from('users').insert({
        name, email: email.toLowerCase(), password: hashedPassword, role: 'user',
        preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }
      }).select().single();

      if (error && error.code === '23505') return res.status(400).json({ success: false, message: 'An account with that email already exists' });
      if (error) throw error;

      return res.status(201).json({ success: true, message: 'User registered', user: serializeUser(user), token: generateToken(user.id) });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }

  // =============== LOGIN ===============
  if (path === '/login' && req.method === 'POST') {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

      const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
      if (error || !user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      return res.status(200).json({ success: true, message: 'Login successful', user: serializeUser(user), token: generateToken(user.id) });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }

  // =============== GUEST ===============
  if (path === '/guest' && req.method === 'POST') {
    try {
      const guestData = { name: 'Guest User', email: `guest_${Date.now()}@guest.local`, role: 'guest', preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }};
      const { data: user, error } = await supabase.from('users').insert(guestData).select().single();
      if (error) throw error;
      return res.status(201).json({ success: true, message: 'Guest login successful', user: serializeUser(user), token: generateToken(user.id) });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }

  // =============== PROFILE ===============
  if (path === '/profile') {
    let user;
    try { user = await protect(req); } catch (err) { return res.status(401).json({ success: false, message: err.message }); }

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, user: serializeUser(user) });
    }
    
    if (req.method === 'PUT') {
      try {
        if (user.role === 'guest') return res.status(403).json({ success: false, message: 'Guest accounts cannot update profile details' });
        const { name, email } = req.body;
        if (!name?.trim() || !email?.trim()) return res.status(400).json({ success: false, message: 'Name and email required' });

        const { data: existing } = await supabase.from('users').select('id').eq('email', email.trim().toLowerCase()).neq('id', user.id).single();
        if (existing) return res.status(400).json({ success: false, message: 'An account with that email already exists' });

        const { data: updatedUser, error } = await supabase.from('users').update({ name: name.trim(), email: email.trim().toLowerCase() }).eq('id', user.id).select('id, name, email, role, preferences, created_at').single();
        if (error && error.code === '23505') return res.status(400).json({ success: false, message: 'An account with that email already exists' });
        if (error) throw error;
        
        return res.status(200).json({ success: true, user: serializeUser(updatedUser) });
      } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
    }
  }

  // =============== PREFERENCES ===============
  if (path === '/preferences' && req.method === 'PUT') {
    let user;
    try { user = await protect(req); } catch (err) { return res.status(401).json({ success: false, message: err.message }); }
    try {
      const { theme, notificationsEnabled, defaultVisibility } = req.body;
      const newPref = { ...user.preferences, ...(theme && {theme}), ...(typeof notificationsEnabled === 'boolean' && {notificationsEnabled}), ...(defaultVisibility && {defaultVisibility}) };
      const { data: updatedUser, error } = await supabase.from('users').update({ preferences: newPref }).eq('id', user.id).select('id, name, email, role, preferences, created_at').single();
      if (error) throw error;
      return res.status(200).json({ success: true, user: serializeUser(updatedUser) });
    } catch (err) { return res.status(500).json({ success: false, error: err.message }); }
  }

  // =============== GOOGLE OAUTH URL ===============
  if (path === '/google' && req.method === 'GET') {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const redirectURI = process.env.GOOGLE_CALLBACK_URL;
    if (!clientID || !redirectURI) return res.status(500).json({ message: 'Google OAuth not configured' });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=profile%20email&access_type=offline`;
    return res.redirect(url);
  }

  // =============== GOOGLE CALLBACK ===============
  if (path === '/google/callback' && req.method === 'GET') {
    const { code } = req.query;
    if (!code) return res.redirect('/login?error=auth_failed');
    
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: process.env.GOOGLE_CALLBACK_URL, grant_type: 'authorization_code' })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) return res.redirect('/login?error=auth_failed');
      
      const profile = await (await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` }})).json();
      if (!profile.email) return res.redirect('/login?error=no_email_provided');
      
      let { data: user } = await supabase.from('users').select('*').eq('email', profile.email).single();
      if (!user) {
        const { data: newUser, error } = await supabase.from('users').insert({
          name: profile.name || profile.email.split('@')[0], email: profile.email, password: `g_${Date.now()}`, role: 'user', preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }
        }).select().single();
        if (error) throw error;
        user = newUser;
      }
      return res.redirect(`/auth/callback?token=${generateToken(user.id)}`);
    } catch (err) { return res.redirect('/login?error=auth_failed'); }
  }

  return res.status(404).json({ message: 'Route not found' });
}
