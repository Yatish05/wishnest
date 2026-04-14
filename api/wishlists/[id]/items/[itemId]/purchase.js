import { supabase } from '../../../../_utils/supabase.js';
import { protect } from '../../../../_utils/authMiddleware.js';
import { formatWishlist } from '../../../../_utils/formatters.js';
import { sendNotification } from '../../../../_utils/notifications.js';

export default async function handler(req, res) {
  if (req.method !== 'PATCH') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  // File structure: api/wishlists/[id]/items/[itemId]/purchase.js
  const { id, itemId } = req.query; 

  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('id, user_id, name')
      .eq('id', id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const { data: item, error: iErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .eq('wishlist_id', id)
      .single();

    if (iErr || !item) return res.status(404).json({ message: "Item not found" });

    if (item.is_purchased) return res.status(400).json({ message: "Item already purchased" });
    if (wishlist.user_id === user.id) return res.status(403).json({ message: "You cannot purchase your own item" });

    await supabase.from('items').update({
      is_purchased: true,
      purchased_at: new Date().toISOString(),
      purchased_by: user.id
    }).eq('id', itemId);

    const msg = item.hidden_from_owner
      ? "Someone purchased a surprise gift from your wishlist!"
      : `Someone purchased "${item.name}" from your wishlist!`;
    await sendNotification(wishlist.user_id, msg, 'purchase');

    const { data: updatedWishlist } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('id', id)
      .single();

    res.json(formatWishlist(updatedWishlist, false));
  } catch (error) {
    console.error('❌ Mark purchased error:', error);
    res.status(500).json({ message: "Failed to mark item as purchased" });
  }
}
