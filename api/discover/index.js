import { supabase } from '../../_utils/supabase.js';
import { formatWishlist } from '../../_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const query = req.query.q?.toLowerCase().trim() || '';
    let gender = 'unisex';
    if (/(boy|boys|male|men|man)\b/.test(query)) gender = 'male';
    if (/(girl|girls|female|women|woman)\b/.test(query)) gender = 'female';

    const genderFilter = gender === 'unisex' ? ['unisex', 'male', 'female'] : [gender, 'unisex'];

    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .in('gender', genderFilter)
      .or('is_public.eq.true,visibility.eq.public')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const items = wishlists.flatMap(w => {
      const formatted = formatWishlist(w, false);
      return formatted.items.map(item => ({
        ...item,
        wishlistId: w.id,
        wishlistName: w.name,
        wishlistOccasion: w.occasion,
        wishlistGender: w.gender,
        wishlistOwnerId: w.user_id,
      }));
    });

    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
