import { supabase } from '../../_utils/supabase.js';
import { protect } from '../../_utils/authMiddleware.js';
import { formatWishlist } from '../../_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  try {
    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .contains('shared_with', [user.id])
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(wishlists.map(w => formatWishlist(w, false)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
