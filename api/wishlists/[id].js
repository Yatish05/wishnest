import { supabase } from '../../_utils/supabase.js';
import { protect } from '../../_utils/authMiddleware.js';
import { formatWishlist } from '../../_utils/formatters.js';

export default async function handler(req, res) {
  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  const { id } = req.query;

  if (req.method === 'GET') {
    try {
      const { data: wishlist, error } = await supabase
        .from('wishlists')
        .select('*, items(*)')
        .eq('id', id)
        .single();

      if (error || !wishlist) return res.status(404).json({ message: "Wishlist not found" });

      const isOwner = user.id === wishlist.user_id;
      return res.json(formatWishlist(wishlist, isOwner));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      return res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { data: existing, error: eErr } = await supabase
        .from('wishlists')
        .select('user_id')
        .eq('id', id)
        .single();

      if (eErr || !existing) return res.status(404).json({ error: 'Wishlist not found' });
      if (existing.user_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });

      const { name, occasion, visibility, isPublic, gender } = req.body;
      
      const updates = {};
      if (name !== undefined) updates.name = name;
      if (occasion !== undefined) updates.occasion = occasion;
      if (gender !== undefined) updates.gender = gender;
      
      if (visibility !== undefined) {
        updates.visibility = visibility;
        updates.is_public = visibility === 'public';
      } else if (isPublic !== undefined) {
        updates.is_public = isPublic;
        updates.visibility = isPublic ? 'public' : 'private';
      }

      const { data: updated, error } = await supabase
        .from('wishlists')
        .update(updates)
        .eq('id', id)
        .select('*, items(*)')
        .single();

      if (error) throw error;
      
      return res.json({ success: true, wishlist: formatWishlist(updated, true) });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { data: wishlist, error: wErr } = await supabase
        .from('wishlists')
        .select('user_id')
        .eq('id', id)
        .single();

      if (wErr || !wishlist) return res.status(404).json({ error: 'Not found' });
      if (wishlist.user_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });

      await supabase.from('wishlists').delete().eq('id', id);
      return res.json({ success: true });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
