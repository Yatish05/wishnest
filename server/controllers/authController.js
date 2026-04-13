import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.role === 'guest' ? '' : user.email,
  role: user.role,
  isGuest: user.role === 'guest',
  createdAt: user.createdAt,
  preferences: {
    theme: user.preferences?.theme || 'light',
    notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
    defaultVisibility: user.preferences?.defaultVisibility || 'public',
  },
});

/* ────────────────────────────────────────────────────────────
   POST /api/auth/register
   Body: { name, email, password }
──────────────────────────────────────────────────────────── */
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are all required',
      });
    }

    // 2. Check for duplicate email
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists',
      });
    }

    // 3. Create user (pre-save hook handles bcrypt hashing)
    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    console.log(`✅ User registered: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);

    // Mongoose duplicate-key error
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────────────────
   POST /api/auth/login
   Body: { email, password }
──────────────────────────────────────────────────────────── */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    // 2. Find user (select password explicitly — it's excluded by default in protect middleware)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // 3. Compare password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id);
    console.log(`✅ User logged in: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────────────────
   GET /api/auth/profile   (protected)
   Returns the logged-in user's public profile.
──────────────────────────────────────────────────────────── */
export const getProfile = async (req, res) => {
  try {
    // req.user is already populated by the protect middleware
    const user = req.user;

    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: serializeUser(user),
    });
  } catch (err) {
    console.error('❌ Get profile error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching profile',
      error: err.message,
    });
  }
};

/* ────────────────────────────────────────────────────────────
   POST /api/auth/guest
   Creates a temporary guest user in MongoDB.
──────────────────────────────────────────────────────────── */
export const guestLogin = async (req, res) => {
  try {
    const timestamp = Date.now();
    const guestData = {
      name: 'Guest User',
      email: `guest_${timestamp}@guest.local`,
      role: 'guest',
    };

    const user = await User.create(guestData);
    const token = generateToken(user._id);

    console.log(`✅ Guest user created: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'Guest login successful',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('❌ Guest login error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during guest login',
      error: err.message,
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      return res.status(403).json({
        success: false,
        message: 'Guest accounts cannot update profile details',
      });
    }

    const { name, email } = req.body;

    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required',
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: req.user._id },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with that email already exists',
      });
    }

    req.user.name = name.trim();
    req.user.email = normalizedEmail;
    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(req.user),
    });
  } catch (err) {
    console.error('❌ Update profile error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile',
      error: err.message,
    });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const {
      theme,
      notificationsEnabled,
      defaultVisibility,
    } = req.body;

    req.user.preferences = {
      ...req.user.preferences,
      ...(theme ? { theme } : {}),
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
      ...(defaultVisibility ? { defaultVisibility } : {}),
    };

    await req.user.save();

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user: serializeUser(req.user),
    });
  } catch (err) {
    console.error('❌ Update preferences error:', err.message);
    return res.status(500).json({
      success: false,
      message: 'Server error updating preferences',
      error: err.message,
    });
  }
};
