import bcrypt from 'bcryptjs';
import { supabase } from '../_utils/supabase.js';
import generateToken from '../_utils/generateToken.js';
import { serializeUser } from '../_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
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
      if (error.code === '23505') {
        return res.status(400).json({ success: false, message: 'An account with that email already exists' });
      }
      throw error;
    }

    const token = generateToken(user.id);

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('Register error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during registration', error: err.message });
  }
}
