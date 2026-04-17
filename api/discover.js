import { supabase } from './_utils/supabase.js';
import { formatWishlist } from './_utils/formatters.js';

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ message: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit')) || 10;
    const offset = parseInt(url.searchParams.get('offset')) || 0;
    const q = url.searchParams.get('q')?.toLowerCase().trim() || '';
    
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
        // Mocking fields for Discovery filter requirements since they aren't in DB yet
        category: 'Gift', 
        relationship: 'Someone special',
        price: 999 
      }));
    });

    return new Response(JSON.stringify(items.slice(0, limit)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
