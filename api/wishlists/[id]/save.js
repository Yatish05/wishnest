import { supabase } from '../../../_utils/supabase.js';
import { protect } from '../../../_utils/authMiddleware.js';
import { formatWishlist } from '../../../_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  const { id } = req.query;

  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('*')
      .eq('id', id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    const isPublic = wishlist.is_public || wishlist.visibility === 'public';
    if (!isPublic) return res.status(403).json({ message: 'Only public wishlists can be saved from links' });
    if (wishlist.user_id === user.id) return res.status(400).json({ message: 'You already own this wishlist' });

    let sharedWith = wishlist.shared_with || [];
    if (sharedWith.includes(user.id)) return res.status(400).json({ message: 'This wishlist is already in Shared With Me' });

    sharedWith.push(user.id);
    await supabase.from('wishlists').update({ shared_with: sharedWith }).eq('id', id);

    wishlist.shared_with = sharedWith;
    res.json({ success: true, wishlist: formatWishlist(wishlist, false) });
  } catch (err) {
    console.error('Save shared wishlist error:', err);
    res.status(500).json({ message: err.message });
  }
}
