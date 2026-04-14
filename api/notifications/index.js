import { supabase } from '../../_utils/supabase.js';
import { protect } from '../../_utils/authMiddleware.js';

export default async function handler(req, res) {
  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  if (req.method === 'GET') {
    try {
      const { data: notifications, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(notifications);
    } catch (error) {
      console.error('Get notifications error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const { message, type } = req.body;
      if (!message?.trim()) {
        return res.status(400).json({ error: 'message is required' });
      }

      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: user.id,
          message: message.trim(),
          type: type || 'info'
        })
        .select()
        .single();

      if (error) throw error;
      return res.status(201).json(notification);
    } catch (error) {
      console.error('Create notification error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;
      return res.json({ success: true, message: 'All notifications cleared' });
    } catch (error) {
      console.error('Clear notifications error:', error.message);
      return res.status(500).json({ error: error.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
