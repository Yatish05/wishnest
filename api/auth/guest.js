import { supabase } from '../_utils/supabase.js';
import generateToken from '../_utils/generateToken.js';
import { serializeUser } from '../_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

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

    return res.status(201).json({
      success: true,
      message: 'Guest login successful',
      user: serializeUser(user),
      token,
    });
  } catch (err) {
    console.error('Guest login error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error during guest login', error: err.message });
  }
}
