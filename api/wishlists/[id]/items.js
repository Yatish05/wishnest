import { supabase } from '../../../_utils/supabase.js';
import { protect } from '../../../_utils/authMiddleware.js';
import { formatItem } from '../../../_utils/formatters.js';

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
      .select('user_id')
      .eq('id', id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: "Wishlist not found" });
    if (wishlist.user_id !== user.id) return res.status(403).json({ error: "Only the owner can add items" });

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        wishlist_id: id,
        name: req.body.name,
        link: req.body.link,
        img: req.body.img,
        notes: req.body.notes,
        hidden_from_owner: req.body.hiddenFromOwner || false
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(formatItem(item));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
