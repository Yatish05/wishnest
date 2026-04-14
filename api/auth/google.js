export default async function handler(req, res) {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const redirectURI = process.env.GOOGLE_CALLBACK_URL;
  
  if (!clientID || !redirectURI) {
    console.warn('⚠️ Google OAuth not configured');
    return res.status(500).json({ message: 'Google OAuth not configured' });
  }

  const scope = 'profile email';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientID}&redirect_uri=${encodeURIComponent(redirectURI)}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline`;
  
  res.redirect(url);
}
