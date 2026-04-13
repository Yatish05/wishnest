import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

/**
 * initPassport()
 *
 * WHY THIS PATTERN:
 * In ES modules every `import` statement is hoisted and evaluated
 * before any executable code runs. That means even though index.js
 * calls dotenv.config() at the top, ALL imports — including this
 * file — have already been evaluated with an empty process.env.
 *
 * Wrapping the strategy registration in a plain function and calling
 * it explicitly from index.js (after dotenv.config()) is the only
 * safe way to read env vars inside a passport config with ESM.
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
    return; // ← no crash; /api/auth/google simply won't be usable yet
  }

  // ── Register the strategy (env vars are now guaranteed to be real) ──
  passport.use(
    new GoogleStrategy(
      { clientID, clientSecret, callbackURL },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;

          if (!email) {
            return done(new Error('No email returned from Google'), null);
          }

          // Find an existing user or create a new one
          let user = await User.findOne({ email });

          if (user) {
            console.log(`✅ Google OAuth — existing user signed in: ${email}`);
            return done(null, user);
          }

          // New user — placeholder password (OAuth users never log in with a password)
          user = await User.create({
            name:     profile.displayName || email.split('@')[0],
            email,
            password: `google_oauth_${profile.id}_${Date.now()}`,
          });

          console.log(`✅ Google OAuth — new user created: ${email}`);
          return done(null, user);
        } catch (err) {
          console.error('❌ Google OAuth strategy error:', err.message);
          return done(err, null);
        }
      }
    )
  );

  console.log('✅ Passport — Google OAuth strategy registered');

  // Serialise / deserialise (only used when express-session is active)
  passport.serializeUser((user, done) => done(null, user._id));

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id).select('-password');
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
}

export default passport;
