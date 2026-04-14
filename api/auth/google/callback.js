import { supabase } from '../../_utils/supabase.js';
import generateToken from '../../_utils/generateToken.js';

export default async function handler(req, res) {
  const { code } = req.query;

  if (!code) {
    return res.redirect('/login?error=auth_failed');
  }

  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectURI = process.env.GOOGLE_CALLBACK_URL;

  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientID,
        client_secret: clientSecret,
        redirect_uri: redirectURI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token exchange error:', tokenData);
      return res.redirect('/login?error=auth_failed');
    }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    const profile = await profileResponse.json();

    if (!profile.email) {
      return res.redirect('/login?error=no_email_provided');
    }

    let { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', profile.email)
      .single();

    if (!user) {
      const { data: newUser, error } = await supabase
        .from('users')
        .insert({
          name: profile.name || profile.email.split('@')[0],
          email: profile.email,
          password: `google_oauth_${profile.id}_${Date.now()}`,
          role: 'user',
          preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }
        })
        .select()
        .single();
        
      if (error) throw error;
      user = newUser;
    }

    const token = generateToken(user.id);
    
    // Redirect to frontend auth-success with the token
    res.redirect(`/auth-success?token=${token}`);
  } catch (err) {
    console.error('Google OAuth callback error:', err);
    res.redirect('/login?error=auth_failed');
  }
}
