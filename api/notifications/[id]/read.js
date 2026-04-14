import { supabase } from '../../../_utils/supabase.js';
import { protect } from '../../../_utils/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method !== 'PUT') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  const { id } = req.query;

  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
