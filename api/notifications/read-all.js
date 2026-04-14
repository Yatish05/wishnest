import { supabase } from '../../_utils/supabase.js';
import { protect } from '../../_utils/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
