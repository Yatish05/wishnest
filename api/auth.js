import bcrypt from 'bcryptjs';
import { supabase } from './_utils/supabase.js';
import generateToken from './_utils/generateToken.js';
import { protect } from './_utils/authMiddleware.js';
import { serializeUser } from './_utils/formatters.js';
import { checkRateLimit } from './_utils/rateLimiter.js';

export default async function handler(req, res) {
  const path = req.url.split('?')[0].replace('/api/auth', '').replace(/\/$/, '') || '/';
  const clientIp = req.headers['x-forwarded-for']?.split(',')[0] || req.headers['x-real-ip'] || req.socket?.remoteAddress || '127.0.0.1';

  // Secure attribute is strictly enabled in production HTTPS, omitted for localhost HTTP
  const isProd = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production';
  const secureFlag = isProd ? 'Secure; ' : '';
  const cookieFlags = `HttpOnly; ${secureFlag}SameSite=Lax; Path=/`;

  // Helper to determine accurate callback redirect URI
  const getGoogleRedirectUri = (request) => {
    if (process.env.GOOGLE_CALLBACK_URL) {
      return process.env.GOOGLE_CALLBACK_URL;
    }
    const host = request.headers['x-forwarded-host'] || request.headers.host || 'localhost:5173';
    const proto = request.headers['x-forwarded-proto'] || 'http';
    return `${proto}://${host}/api/auth/google/callback`;
  };

  // =============== REGISTER ===============
  if (path === '/register' && req.method === 'POST') {
    const rateCheck = await checkRateLimit(`register_${clientIp}`, 10, 900);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: 'Too many registration attempts. Please try again later.' });
    }

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

      const token = generateToken(user.id);
      res.setHeader('Set-Cookie', `token=${token}; ${cookieFlags}; Max-Age=2592000`);

      return res.status(201).json({ success: true, message: 'User registered', user: serializeUser(user), token });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }

  // =============== LOGIN ===============
  if (path === '/login' && req.method === 'POST') {
    const rateCheck = await checkRateLimit(`login_${clientIp}`, 10, 900);
    if (!rateCheck.allowed) {
      return res.status(429).json({ success: false, message: 'Too many login attempts. Please try again in 15 minutes.' });
    }

    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password are required' });

      const { data: user, error } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
      if (error || !user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const token = generateToken(user.id);
      res.setHeader('Set-Cookie', `token=${token}; ${cookieFlags}; Max-Age=2592000`);

      return res.status(200).json({ success: true, message: 'Login successful', user: serializeUser(user), token });
    } catch (err) {
      return res.status(500).json({ success: false, message: 'Server error', error: err.message });
    }
  }

  // =============== LOGOUT ===============
  if (path === '/logout' && req.method === 'POST') {
    res.setHeader('Set-Cookie', `token=; ${cookieFlags}; Max-Age=0`);
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
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
    const redirectURI = getGoogleRedirectUri(req);
    if (!clientID) return res.status(500).json({ message: 'Google OAuth client ID not configured' });
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=profile%20email&access_type=offline`;
    return res.redirect(url);
  }

  // =============== GOOGLE CALLBACK ===============
  if (path === '/google/callback' && req.method === 'GET') {
    const { code } = req.query;
    if (!code) return res.redirect('/login?error=auth_failed');
    const redirectURI = getGoogleRedirectUri(req);
    
    try {
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID, client_secret: process.env.GOOGLE_CLIENT_SECRET, redirect_uri: redirectURI, grant_type: 'authorization_code' })
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) {
        console.error('[Google OAuth] Token exchange failed:', tokenData.error_description || tokenData.error);
        return res.redirect('/login?error=auth_failed');
      }
      
      const profile = await (await fetch('https://www.googleapis.com/oauth2/v2/userinfo', { headers: { Authorization: `Bearer ${tokenData.access_token}` }})).json();
      if (!profile.email) return res.redirect('/login?error=no_email_provided');
      
      let { data: user } = await supabase.from('users').select('*').eq('email', profile.email).single();
      if (!user) {
        const oauthPassword = await bcrypt.hash(`g_${Date.now()}_${Math.random()}`, 10);
        const { data: newUser, error } = await supabase.from('users').insert({
          name: profile.name || profile.email.split('@')[0], email: profile.email, password: oauthPassword, role: 'user', preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }
        }).select().single();
        if (error) throw error;
        user = newUser;
      }
      const token = generateToken(user.id);
      res.setHeader('Set-Cookie', `token=${token}; ${cookieFlags}; Max-Age=2592000`);

      const targetHost = req.headers['x-forwarded-host'] || req.headers.host || '';
      let targetUrl = '/auth/callback';
      if (targetHost.includes('5001') || targetHost.includes('3000')) {
        targetUrl = 'http://localhost:5173/auth/callback';
      }
      return res.redirect(targetUrl);
    } catch (err) {
      console.error('[Google OAuth] Callback exception:', err);
      return res.redirect('/login?error=auth_failed');
    }
  }

  return res.status(404).json({ message: 'Route not found' });
}
