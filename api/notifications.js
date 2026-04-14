import { supabase } from './_utils/supabase.js';
import { protect } from './_utils/authMiddleware.js';

export default async function handler(req, res) {
  const path = req.url.split('?')[0].replace('/api/notifications', '').replace(/\/$/, '') || '/';

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  if (path === '/' && req.method === 'GET') {
    try {
      const { data: notifications, error } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(notifications);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (path === '/' && req.method === 'POST') {
    try {
      const { message, type } = req.body;
      if (!message?.trim()) return res.status(400).json({ error: 'message is required' });
      const { data: notification, error } = await supabase.from('notifications').insert({ user_id: user.id, message: message.trim(), type: type || 'info' }).select().single();
      if (error) throw error;
      return res.status(201).json(notification);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (path === '/' && req.method === 'DELETE') {
    try {
      const { error } = await supabase.from('notifications').delete().eq('user_id', user.id);
      if (error) throw error;
      return res.json({ success: true, message: 'All notifications cleared' });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (path === '/read-all' && req.method === 'PUT') {
    try {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
      if (error) throw error;
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  const readMatch = path.match(/^\/([^\/]+)\/read$/);
  if (readMatch && req.method === 'PUT') {
    const id = readMatch[1];
    try {
      const { data: notification, error } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id).select().single();
      if (error) {
        if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
        throw error;
      }
      return res.json(notification);
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  return res.status(404).json({ message: 'Route not found' });
}
