import { supabase } from '../../../_utils/supabase.js';
import { protect } from '../../../_utils/authMiddleware.js';
import { formatWishlist } from '../../../_utils/formatters.js';
import { sendNotification } from '../../../_utils/notifications.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  const { id } = req.query; // wishlistId

  try {
    const { itemId, hiddenFromOwner } = req.body;

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

    if (item.is_purchased) {
      // Undo
      await supabase.from('items').update({
        is_purchased: false,
        purchased_at: null,
        purchased_by: null,
        hidden_from_owner: false
      }).eq('id', itemId);
      
      const { data: hw } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
      return res.json(formatWishlist(hw, wishlist.user_id === user.id));
    }

    const updates = {
      is_purchased: true,
      purchased_at: new Date().toISOString(),
      purchased_by: user.id
    };
    if (hiddenFromOwner !== undefined) updates.hidden_from_owner = hiddenFromOwner;

    await supabase.from('items').update(updates).eq('id', itemId);

    const msg = updates.hidden_from_owner || item.hidden_from_owner
      ? "Someone purchased a surprise gift from your wishlist!"
      : `Someone purchased "${item.name}" from your wishlist!`;
    await sendNotification(wishlist.user_id, msg, 'purchase');

    const { data: hw } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
    res.json(formatWishlist(hw, false));
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: error.message });
  }
}
