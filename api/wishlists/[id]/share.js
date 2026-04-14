import { supabase } from '../../../_utils/supabase.js';
import { protect } from '../../../_utils/authMiddleware.js';
import { sendNotification } from '../../../_utils/notifications.js';

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
    const { shareUserId } = req.body;
    if (!shareUserId) return res.status(400).json({ error: "shareUserId is required" });

    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('shared_with, name')
      .eq('id', id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: "Wishlist not found" });

    let sharedWith = wishlist.shared_with || [];
    if (!sharedWith.includes(shareUserId)) {
      sharedWith.push(shareUserId);
      
      await supabase
        .from('wishlists')
        .update({ shared_with: sharedWith })
        .eq('id', id);

      await sendNotification(shareUserId, `${user.id} shared a wishlist with you: "${wishlist.name}"`, 'share');
    }

    res.json({ success: true, sharedWith });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
