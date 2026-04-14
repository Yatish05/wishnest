import { supabase } from '../../../../_utils/supabase.js';
import { protect } from '../../../../_utils/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  const { id, itemId } = req.query;

  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: 'Not found' });
    if (wishlist.user_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });

    await supabase.from('items').delete().eq('id', itemId).eq('wishlist_id', id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
