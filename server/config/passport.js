import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { supabase } from './supabase.js';

/**
 * initPassport()
 */
export function initPassport() {
  const clientID     = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL  = process.env.GOOGLE_CALLBACK_URL;

  // ── Guard: skip silently if credentials are placeholders / missing ──
  if (
    !clientID     || clientID     === 'your_google_client_id'     ||
    !clientSecret || clientSecret === 'your_google_client_secret' ||
    !callbackURL
  ) {
    console.warn(
      '⚠️  Google OAuth is DISABLED.\n' +
      '   Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL\n' +
      '   in server/.env with real values from Google Cloud Console.\n' +
      '   The rest of the server (JWT login, register, etc.) will work normally.'
    );
    return;
  }

  // ── Register the strategy ──
  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email returned from Google'), null);
          }

          const { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

          if (user) {
            console.log(`✅ Google OAuth — existing user signed in: ${email}`);
            user._id = user.id; // backward compat
            return done(null, user);
          }

          const { data: newUser, error } = await supabase
            .from('users')
            .insert({
              name:     profile.displayName || email.split('@')[0],
              email,
              password: `google_oauth_${profile.id}_${Date.now()}`,
            })
            .select()
            .single();

          if (error) throw error;

          console.log(`✅ Google OAuth — new user created: ${email}`);
          newUser._id = newUser.id;
          return done(null, newUser);
        } catch (err) {
          console.error('❌ Google OAuth strategy error:', err.message);
          return done(err, null);
        }
      }
    )
  );

  console.log('✅ Passport — Google OAuth strategy registered');

  passport.serializeUser((user, done) => done(null, user.id || user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const { data: user, error } = await supabase
        .from('users')
        .select('id, name, email, role, preferences, created_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (user) user._id = user.id;

      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

export default passport;
