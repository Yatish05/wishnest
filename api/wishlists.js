import { supabase } from './_utils/supabase.js';
import { protect } from './_utils/authMiddleware.js';
import { formatWishlist, formatItem } from './_utils/formatters.js';
import { sendNotification } from './_utils/notifications.js';

export default async function handler(req, res) {
  const path = req.url.split('?')[0].replace('/api/wishlists', '').replace(/\/$/, '') || '/';

  // =============== PUBLIC WISHLIST ===============
  const publicMatch = path.match(/^\/public\/([^\/]+)$/);
  if (publicMatch && req.method === 'GET') {
    try {
      const id = publicMatch[1];
      if (!id || id.length < 10) return res.status(404).json({ message: 'Wishlist not found.' });
      const { data: wishlist, error } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
      if (error || !wishlist) return res.status(404).json({ message: 'Wishlist not found.' });
      const isPublic = wishlist.is_public || wishlist.visibility === 'public';
      if (!isPublic) return res.status(403).json({ message: 'This wishlist is private.' });
      return res.json(formatWishlist(wishlist, false));
    } catch (err) { return res.status(500).json({ message: 'Unable to load wishlist.' }); }
  }

  // ===========================================
  // ALL OTHER ROUTES REQUIRE AUTH
  // ===========================================
  let user;
  try { user = await protect(req); } catch (err) { return res.status(401).json({ success: false, message: err.message }); }

  if (path === '/' && req.method === 'GET') {
    try {
      const { data: wishlists, error } = await supabase.from('wishlists').select('*, items(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(wishlists.map(w => formatWishlist(w, true)));
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (path === '/' && req.method === 'POST') {
    try {
      const visibility = req.body.visibility || (req.body.isPublic ? 'public' : 'private');
      const isPublic = req.body.isPublic ?? visibility === 'public';
      
      const { data: wishlist, error } = await supabase.from('wishlists').insert({
        name: req.body.name, occasion: req.body.occasion || 'Other', visibility, gender: req.body.gender || 'unisex', is_public: isPublic, user_id: user.id
      }).select().single();
      if (error) throw error;
      
      let createdItems = [];
      if (req.body.items && req.body.items.length > 0) {
        const itemsToInsert = req.body.items.map(item => ({ wishlist_id: wishlist.id, name: item.name, link: item.link, img: item.img, notes: item.notes, is_purchased: item.isPurchased || false, hidden_from_owner: item.hiddenFromOwner || false }));
        const { data: iData, error: iErr } = await supabase.from('items').insert(itemsToInsert).select();
        if (!iErr) createdItems = iData;
      }
      wishlist.items = createdItems;
      return res.status(201).json({ success: true, wishlist: formatWishlist(wishlist, true) });
    } catch (err) { return res.status(400).json({ error: err.message }); }
  }

  if (path === '/shared' && req.method === 'GET') {
    try {
      const { data: wishlists, error } = await supabase.from('wishlists').select('*, items(*)').contains('shared_with', [user.id]).order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(wishlists.map(w => formatWishlist(w, false)));
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  const idMatch = path.match(/^\/([^\/]+)$/);
  if (idMatch) {
    const id = idMatch[1];
    if (req.method === 'GET') {
      try {
        const { data: wishlist, error } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
        if (error || !wishlist) return res.status(404).json({ message: "Wishlist not found" });
        return res.json(formatWishlist(wishlist, user.id === wishlist.user_id));
      } catch (err) { return res.status(500).json({ message: "Failed to fetch wishlist" }); }
    }
    if (req.method === 'PUT') {
      try {
        const { data: existing, error: eErr } = await supabase.from('wishlists').select('user_id').eq('id', id).single();
        if (eErr || !existing) return res.status(404).json({ error: 'Wishlist not found' });
        if (existing.user_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });
        
        const { name, occasion, visibility, isPublic, gender } = req.body;
        const updates = {};
        if (name !== undefined) updates.name = name;
        if (occasion !== undefined) updates.occasion = occasion;
        if (gender !== undefined) updates.gender = gender;
        if (visibility !== undefined) { updates.visibility = visibility; updates.is_public = visibility === 'public'; } else if (isPublic !== undefined) { updates.is_public = isPublic; updates.visibility = isPublic ? 'public' : 'private'; }

        const { data: updated, error } = await supabase.from('wishlists').update(updates).eq('id', id).select('*, items(*)').single();
        if (error) throw error;
        return res.json({ success: true, wishlist: formatWishlist(updated, true) });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
    if (req.method === 'DELETE') {
      try {
        const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('user_id').eq('id', id).single();
        if (wErr || !wishlist) return res.status(404).json({ error: 'Not found' });
        if (wishlist.user_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });
        await supabase.from('wishlists').delete().eq('id', id);
        return res.json({ success: true });
      } catch (err) { return res.status(500).json({ error: err.message }); }
    }
  }

  const itemsMatch = path.match(/^\/([^\/]+)\/items$/);
  if (itemsMatch && req.method === 'POST') {
    const id = itemsMatch[1];
    try {
      const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('user_id').eq('id', id).single();
      if (wErr || !wishlist) return res.status(404).json({ error: "Wishlist not found" });
      if (wishlist.user_id !== user.id) return res.status(403).json({ error: "Only the owner can add items" });
      const { data: item, error } = await supabase.from('items').insert({
        wishlist_id: id, name: req.body.name, link: req.body.link, img: req.body.img, notes: req.body.notes, hidden_from_owner: req.body.hiddenFromOwner || false
      }).select().single();
      if (error) throw error;
      return res.status(201).json(formatItem(item));
    } catch (err) { return res.status(400).json({ error: err.message }); }
  }

  const itemDeleteMatch = path.match(/^\/([^\/]+)\/items\/([^\/]+)$/);
  if (itemDeleteMatch && req.method === 'DELETE') {
    const id = itemDeleteMatch[1];
    const itemId = itemDeleteMatch[2];
    try {
      const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('user_id').eq('id', id).single();
      if (wErr || !wishlist) return res.status(404).json({ error: 'Not found' });
      if (wishlist.user_id !== user.id) return res.status(403).json({ error: 'Unauthorized' });
      await supabase.from('items').delete().eq('id', itemId).eq('wishlist_id', id);
      return res.json({ success: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  const shareMatch = path.match(/^\/([^\/]+)\/share$/);
  if (shareMatch && req.method === 'POST') {
    const id = shareMatch[1];
    try {
      const { shareUserId } = req.body;
      if (!shareUserId) return res.status(400).json({ error: "shareUserId is required" });
      const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('shared_with, name').eq('id', id).single();
      if (wErr || !wishlist) return res.status(404).json({ error: "Wishlist not found" });
      let sharedWith = wishlist.shared_with || [];
      if (!sharedWith.includes(shareUserId)) {
        sharedWith.push(shareUserId);
        await supabase.from('wishlists').update({ shared_with: sharedWith }).eq('id', id);
        await sendNotification(shareUserId, `${user.id} shared a wishlist with you: "${wishlist.name}"`, 'share');
      }
      return res.json({ success: true, sharedWith });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  const saveMatch = path.match(/^\/([^\/]+)\/save$/);
  if (saveMatch && req.method === 'POST') {
    const id = saveMatch[1];
    try {
      const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('*').eq('id', id).single();
      if (wErr || !wishlist) return res.status(404).json({ message: 'Wishlist not found' });
      const isPublic = wishlist.is_public || wishlist.visibility === 'public';
      if (!isPublic) return res.status(403).json({ message: 'Only public wishlists can be saved from links' });
      if (wishlist.user_id === user.id) return res.status(400).json({ message: 'You already own this wishlist' });
      let sharedWith = wishlist.shared_with || [];
      if (sharedWith.includes(user.id)) return res.status(400).json({ message: 'This wishlist is already in Shared With Me' });
      sharedWith.push(user.id);
      await supabase.from('wishlists').update({ shared_with: sharedWith }).eq('id', id);
      wishlist.shared_with = sharedWith;
      return res.json({ success: true, wishlist: formatWishlist(wishlist, false) });
    } catch (err) { return res.status(500).json({ message: err.message }); }
  }

  const purchaseMatch = path.match(/^\/([^\/]+)\/purchase$/);
  if (purchaseMatch && req.method === 'POST') {
    const id = purchaseMatch[1];
    try {
      const { itemId, hiddenFromOwner } = req.body;
      const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('id, user_id, name').eq('id', id).single();
      if (wErr || !wishlist) return res.status(404).json({ message: "Wishlist not found" });
      const { data: item, error: iErr } = await supabase.from('items').select('*').eq('id', itemId).eq('wishlist_id', id).single();
      if (iErr || !item) return res.status(404).json({ message: "Item not found" });

      if (item.is_purchased) {
        await supabase.from('items').update({ is_purchased: false, purchased_at: null, purchased_by: null, hidden_from_owner: false }).eq('id', itemId);
        const { data: hw } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
        return res.json(formatWishlist(hw, wishlist.user_id === user.id));
      }

      const updates = { is_purchased: true, purchased_at: new Date().toISOString(), purchased_by: user.id };
      if (hiddenFromOwner !== undefined) updates.hidden_from_owner = hiddenFromOwner;
      await supabase.from('items').update(updates).eq('id', itemId);

      const msg = updates.hidden_from_owner || item.hidden_from_owner ? "Someone purchased a surprise gift from your wishlist!" : `Someone purchased "${item.name}" from your wishlist!`;
      await sendNotification(wishlist.user_id, msg, 'purchase');

      const { data: hw } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
      return res.json(formatWishlist(hw, false));
    } catch (err) { return res.status(500).json({ message: err.message }); }
  }

  const itemPurchaseMatch = path.match(/^\/([^\/]+)\/items\/([^\/]+)\/purchase$/);
  if (itemPurchaseMatch && req.method === 'PATCH') {
    const id = itemPurchaseMatch[1];
    const itemId = itemPurchaseMatch[2];
    try {
      const { data: wishlist, error: wErr } = await supabase.from('wishlists').select('id, user_id, name').eq('id', id).single();
      if (wErr || !wishlist) return res.status(404).json({ message: "Wishlist not found" });
      const { data: item, error: iErr } = await supabase.from('items').select('*').eq('id', itemId).eq('wishlist_id', id).single();
      if (iErr || !item) return res.status(404).json({ message: "Item not found" });
      if (item.is_purchased) return res.status(400).json({ message: "Item already purchased" });
      if (wishlist.user_id === user.id) return res.status(403).json({ message: "You cannot purchase your own item" });

      await supabase.from('items').update({ is_purchased: true, purchased_at: new Date().toISOString(), purchased_by: user.id }).eq('id', itemId);
      const msg = item.hidden_from_owner ? "Someone purchased a surprise gift from your wishlist!" : `Someone purchased "${item.name}" from your wishlist!`;
      await sendNotification(wishlist.user_id, msg, 'purchase');
      const { data: updatedWishlist } = await supabase.from('wishlists').select('*, items(*)').eq('id', id).single();
      return res.json(formatWishlist(updatedWishlist, false));
    } catch (err) { return res.status(500).json({ message: "Failed to mark item as purchased" }); }
  }

  return res.status(404).json({ message: 'Route not found' });
}
