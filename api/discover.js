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
    const q = url.searchParams.get('q')?.toLowerCase().trim() || '';
    
    let gender = 'unisex';
    if (/(boy|boys|male|men|man)\b/.test(q)) gender = 'male';
    if (/(girl|girls|female|women|woman)\b/.test(q)) gender = 'female';

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
        wishlistOwnerId: w.user_id
      }));
    });

    return new Response(JSON.stringify(items), {
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
