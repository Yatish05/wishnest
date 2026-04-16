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
    // Vercel Edge functions don't get req.query automatically, we use URLSearchParams
    // The path will be handled by vercel.json rewrites or manual parsing
    const id = url.searchParams.get('id');

    if (!id || id.length < 10) {
      return new Response(JSON.stringify({ message: 'Wishlist not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('id', id)
      .single();

    if (error || !wishlist) {
      return new Response(JSON.stringify({ message: 'Wishlist not found.' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const isPublic = wishlist.is_public || wishlist.visibility === 'public';
    if (!isPublic) {
      return new Response(JSON.stringify({ message: 'This wishlist is private.' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(formatWishlist(wishlist, false)), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ message: 'Unable to load wishlist.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
