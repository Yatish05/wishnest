import { supabase } from '../_utils/supabase.js';
import { serializeUser } from '../_utils/formatters.js';
import { protect } from '../_utils/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  try {
    const { theme, notificationsEnabled, defaultVisibility } = req.body;
    
    const newPreferences = {
      ...user.preferences,
      ...(theme ? { theme } : {}),
      ...(typeof notificationsEnabled === 'boolean' ? { notificationsEnabled } : {}),
      ...(defaultVisibility ? { defaultVisibility } : {}),
    };

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ preferences: newPreferences })
      .eq('id', user.id)
      .select('id, name, email, role, preferences, created_at')
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      user: serializeUser(updatedUser),
    });
  } catch (err) {
    console.error('Update preferences error:', err.message);
    return res.status(500).json({ success: false, message: 'Server error updating preferences', error: err.message });
  }
}
