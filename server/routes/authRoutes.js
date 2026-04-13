import express from 'express';
import passport from 'passport';
import {
  registerUser,
  loginUser,
  guestLogin,
  getProfile,
  updateProfile,
  updatePreferences,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import generateToken from '../utils/generateToken.js';

const router = express.Router();
const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

/* Public routes ─────────────────────────── */
router.post('/register', registerUser);   // POST /api/auth/register
router.post('/login',    loginUser);      // POST /api/auth/login
router.post('/guest',    guestLogin);     // POST /api/auth/guest

/* Protected routes ──────────────────────── */
router.get('/profile', protect, getProfile); // GET  /api/auth/profile
router.put('/profile', protect, updateProfile);
router.put('/preferences', protect, updatePreferences);

/* Google OAuth routes ───────────────────── */

// Step 1 — redirect the browser to Google's consent screen
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2 — Google redirects back here after the user grants permission
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${frontendUrl}/login?error=google_failed`,
    session: false,
  }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user._id);

    console.log('✅ Google OAuth callback — sending token:', token);
    res.redirect(`${frontendUrl}/auth-success?token=${token}`);
  }
);

export default router;
