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

  if (req.method === 'GET') {
    try {
      const { data: wishlists, error } = await supabase
        .from('wishlists')
        .select('*, items(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return res.json(wishlists.map(w => formatWishlist(w, true)));
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  if (req.method === 'POST') {
    try {
      const visibility = req.body.visibility || (req.body.isPublic ? 'public' : 'private');
      const isPublic = req.body.isPublic ?? visibility === 'public';
      
      const { data: wishlist, error } = await supabase
        .from('wishlists')
        .insert({
          name: req.body.name,
          occasion: req.body.occasion || 'Other',
          visibility,
          gender: req.body.gender || 'unisex',
          is_public: isPublic,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      let createdItems = [];
      if (req.body.items && req.body.items.length > 0) {
        const itemsToInsert = req.body.items.map(item => ({
          wishlist_id: wishlist.id,
          name: item.name,
          link: item.link,
          img: item.img,
          notes: item.notes,
          is_purchased: item.isPurchased || false,
          hidden_from_owner: item.hiddenFromOwner || false
        }));
        
        const { data: iData, error: iErr } = await supabase
          .from('items')
          .insert(itemsToInsert)
          .select();
          
        if (!iErr) createdItems = iData;
      }

      wishlist.items = createdItems;
      return res.status(201).json({ success: true, wishlist: formatWishlist(wishlist, true) });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  return res.status(405).json({ message: 'Method Not Allowed' });
}
