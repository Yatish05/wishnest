import { supabase } from '../../../_utils/supabase.js';
import { formatWishlist } from '../../../_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { id } = req.query;
    
    // Some basic validation for 'id' to be a valid UUID could go here
    if (!id || id.length < 10) return res.status(404).json({ message: 'Wishlist not found.' });

    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('id', id)
      .single();

    if (error || !wishlist) return res.status(404).json({ message: 'Wishlist not found.' });

    const isPublic = wishlist.is_public || wishlist.visibility === 'public';
    if (!isPublic) return res.status(403).json({ message: 'This wishlist is private.' });

    res.json(formatWishlist(wishlist, false));
  } catch (error) {
    console.error('Public wishlist fetch error:', error);
    res.status(500).json({ message: 'Unable to load wishlist.' });
  }
}
