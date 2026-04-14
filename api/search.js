import { supabase } from './_utils/supabase.js';
import { protect } from './_utils/authMiddleware.js';
import { formatWishlist } from './_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  if (req.query.type === 'discover') {
    try {
      const query = req.query.q?.toLowerCase().trim() || '';
      let gender = 'unisex';
      if (/(boy|boys|male|men|man)\b/.test(query)) gender = 'male';
      if (/(girl|girls|female|women|woman)\b/.test(query)) gender = 'female';

      const genderFilter = gender === 'unisex' ? ['unisex', 'male', 'female'] : [gender, 'unisex'];
      const { data: wishlists, error } = await supabase.from('wishlists').select('*, items(*)').in('gender', genderFilter).or('is_public.eq.true,visibility.eq.public').order('created_at', { ascending: false });
      if (error) throw error;

      const items = wishlists.flatMap(w => {
        const formatted = formatWishlist(w, false);
        return formatted.items.map(item => ({ ...item, wishlistId: w.id, wishlistName: w.name, wishlistOccasion: w.occasion, wishlistGender: w.gender, wishlistOwnerId: w.user_id }));
      });
      return res.json(items);
    } catch (err) { return res.status(500).json({ message: err.message }); }
  }

  // STANDARD SEARCH
  let user;
  try { user = await protect(req); } catch (err) { return res.status(401).json({ success: false, message: err.message }); }

  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const { data: wishlists, error: hlErr } = await supabase.from('wishlists').select('*, items(*)').eq('user_id', user.id).ilike('name', `%${query}%`).order('created_at', { ascending: false }).limit(20);
    if (hlErr) throw hlErr;
    const { data: items, error: itErr } = await supabase.from('items').select('*, wishlists!inner(id, name, user_id)').eq('wishlists.user_id', user.id).ilike('name', `%${query}%`).limit(20);
    if (itErr) throw itErr;

    const matchedWishlists = wishlists.map(w => ({ ...w, _id: w.id }));
    const matchedItems = items.map(item => ({ ...item, _id: item.id, wishlistId: item.wishlists.id, wishlistName: item.wishlists.name, wishlists: undefined }));
    return res.json({ wishlists: matchedWishlists, items: matchedItems });
  } catch (err) { return res.status(500).json({ error: err.message }); }
}
