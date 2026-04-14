import { supabase } from '../_utils/supabase.js';
import { serializeUser } from '../_utils/formatters.js';
import { protect } from '../_utils/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      message: 'Profile fetched successfully',
      user: serializeUser(user),
    });
  }

  if (req.method === 'PUT') {
    try {
      if (user.role === 'guest') {
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
        .neq('id', user.id)
        .single();

      if (existingUser) {
        return res.status(400).json({ success: false, message: 'An account with that email already exists' });
      }

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update({ name: name.trim(), email: normalizedEmail })
        .eq('id', user.id)
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
      console.error('Update profile error:', err.message);
      return res.status(500).json({ success: false, message: 'Server error updating profile', error: err.message });
    }
  }
}
