import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';
import { supabase } from '../config/supabase.js';

const serializeUser = (user) => ({
  id: user.id || user._id,
  name: user.name,
  email: user.role === 'guest' ? '' : user.email,
  role: user.role,
  isGuest: user.role === 'guest',
  createdAt: user.created_at || user.createdAt,
  preferences: {
    theme: user.preferences?.theme || 'light',
    notificationsEnabled: user.preferences?.notificationsEnabled ?? true,
    defaultVisibility: user.preferences?.defaultVisibility || 'public',
  },
});

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are all required' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: 'user',
        preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // unique_violation
        return res.status(400).json({ success: false, message: 'An account with that email already exists' });
      }
      throw error;
    }

    const token = generateToken(user.id);
    console.log(`✅ User registered: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('❌ Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();

    if (error || !user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = generateToken(user.id);
    console.log(`✅ User logged in: ${user.email}`);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('❌ Login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during login', error: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: serializeUser(user),
    });
  } catch (err) {
    console.error('❌ Get profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error fetching profile', error: err.message });
  }
};

export const guestLogin = async (req, res) => {
  try {
    const timestamp = Date.now();
    const guestData = {
      name: 'Guest User',
      email: `guest_${timestamp}@guest.local`,
      role: 'guest',
      preferences: { theme: 'light', notificationsEnabled: true, defaultVisibility: 'public' }
    };

    const { data: user, error } = await supabase
      .from('users')
      .insert(guestData)
      .select()
      .single();

    if (error) throw error;

    const token = generateToken(user.id);
    console.log(`✅ Guest user created: ${user.email}`);

    return res.status(201).json({
      success: true,
      message: 'Guest login successful',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('❌ Guest login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during guest login', error: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    if (req.user.role === 'guest') {
      return res.status(403).json({ success: false, message: 'Guest accounts cannot update profile details' });
    }

    const { name, email } = req.body;
    if (!name?.trim() || !email?.trim()) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .neq('id', req.user.id)
      .single();

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with that email already exists' });
    }

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ name: name.trim(), email: normalizedEmail })
      .eq('id', req.user.id)
      .select('id, name, email, role, preferences, created_at')
      .single();

    if (error) {
       if (error.code === '23505') {
         return res.status(400).json({ success: false, message: 'An account with that email already exists' });
       }
       throw error;
    }

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(updatedUser),
    });
  } catch (err) {
    console.error('❌ Update profile error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating profile', error: err.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const { theme, notificationsEnabled, defaultVisibility } = req.body;
    
    // Merge new preferences with existing ones
    const newPreferences = {
      ...req.user.preferences,
      ...(theme ? { theme } : {}),
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
      ...(defaultVisibility ? { defaultVisibility } : {}),
    };

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ preferences: newPreferences })
      .eq('id', req.user.id)
      .select('id, name, email, role, preferences, created_at')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user: serializeUser(updatedUser),
    });
  } catch (err) {
    console.error('❌ Update preferences error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating preferences', error: err.message });
  }
};
