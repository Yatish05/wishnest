import { supabase } from '../../_utils/supabase.js';
import { protect } from '../../_utils/authMiddleware.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  let user;
  try {
    user = await protect(req);
  } catch (err) {
    return res.status(401).json({ success: false, message: err.message });
  }

  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const { data: wishlists, error: hlErr } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('user_id', user.id)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (hlErr) throw hlErr;

    const { data: items, error: itErr } = await supabase
      .from('items')
      .select('*, wishlists!inner(id, name, user_id)')
      .eq('wishlists.user_id', user.id)
      .ilike('name', `%${query}%`)
      .limit(20);
      
    if (itErr) throw itErr;

    const matchedWishlists = wishlists.map(w => ({ ...w, _id: w.id }));

    const matchedItems = items.map(item => ({
      ...item,
      _id: item.id,
      wishlistId: item.wishlists.id,
      wishlistName: item.wishlists.name,
      wishlists: undefined
    }));

    res.json({
      wishlists: matchedWishlists,
      items: matchedItems,
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
}
