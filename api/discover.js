import { supabase } from './_utils/supabase.js';
import { formatWishlist } from './_utils/formatters.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const q = (req.query.q || '').toLowerCase().trim();
    
    let query = supabase
      .from('wishlists')
      .select('*, items(*)')
      .or('is_public.eq.true,visibility.eq.public')
      .order('created_at', { ascending: false });

    if (q) {
      let gender = 'unisex';
      if (/(boy|boys|male|men|man)\b/.test(q)) gender = 'male';
      if (/(girl|girls|female|women|woman)\b/.test(q)) gender = 'female';
      const genderFilter = gender === 'unisex' ? ['unisex', 'male', 'female'] : [gender, 'unisex'];
      query = query.in('gender', genderFilter);
    }

    const { data: wishlists, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      console.error('Discover API Supabase error:', error);
      throw error;
    }

    if (!wishlists) return res.status(200).json([]);

    const items = wishlists.flatMap(w => {
      const formatted = formatWishlist(w, false);
      if (!formatted || !formatted.items) return [];
      return formatted.items.map(item => ({
        ...item,
        wishlistId: w.id,
        wishlistName: w.name,
        wishlistOccasion: w.occasion,
        wishlistGender: w.gender,
        wishlistOwnerId: w.user_id,
        // Mocking for frontend filter needs
        category: 'Gift', 
        relationship: 'Someone special',
        price: 999 
      }));
    });

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(items.slice(0, limit));
    
  } catch (err) {
    console.error('Discover API Error:', err.message);
    return res.status(500).json({ message: err.message });
  }
}
