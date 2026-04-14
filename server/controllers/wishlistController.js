import { supabase } from '../config/supabase.js';

const sendNotification = async (userId, message, type = 'info') => {
  try {
    await supabase.from('notifications').insert({ user_id: userId, message, type });
  } catch (err) {
    console.error('Failed to send notification:', err);
  }
};

const formatItem = (item) => ({
  ...item,
  _id: item.id,
  isPurchased: item.is_purchased,
  purchasedAt: item.purchased_at,
  purchasedBy: item.purchased_by,
  hiddenFromOwner: item.hidden_from_owner,
});

const formatWishlist = (wishlist, isOwner = false) => {
  if (!wishlist) return null;
  
  const items = (wishlist.items || []).map(item => {
    const formatted = formatItem(item);
    
    if (isOwner && formatted.hiddenFromOwner) {
      return {
        ...formatted,
        isPurchased: false,
        status: "Available"
      };
    }
    return {
      ...formatted,
      status: formatted.isPurchased ? "Purchased" : "Available"
    };
  });

  return {
    ...wishlist,
    _id: wishlist.id,
    userId: wishlist.user_id,
    isPublic: wishlist.is_public,
    sharedWith: wishlist.shared_with,
    items
  };
};

export const markItemAsPurchased = async (req, res) => {
  try {
    const { wishlistId, itemId } = req.params;

    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('id, user_id, name')
      .eq('id', wishlistId)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const { data: item, error: iErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .eq('wishlist_id', wishlistId)
      .single();

    if (iErr || !item) return res.status(404).json({ message: "Item not found" });

    if (item.is_purchased) return res.status(400).json({ message: "Item already purchased" });
    if (wishlist.user_id === req.user.id) return res.status(403).json({ message: "You cannot purchase your own item" });

    await supabase.from('items').update({
      is_purchased: true,
      purchased_at: new Date().toISOString(),
      purchased_by: req.user.id
    }).eq('id', itemId);

    const msg = item.hidden_from_owner
      ? "Someone purchased a surprise gift from your wishlist!"
      : `Someone purchased "${item.name}" from your wishlist!`;
    await sendNotification(wishlist.user_id, msg, 'purchase');

    const { data: updatedWishlist } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('id', wishlistId)
      .single();

    res.json(formatWishlist(updatedWishlist, false));
  } catch (error) {
    console.error('❌ Mark purchased error:', error);
    res.status(500).json({ message: "Failed to mark item as purchased" });
  }
};

export const getWishlists = async (req, res) => {
  try {
    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(wishlists.map(w => formatWishlist(w, true)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSharedWishlists = async (req, res) => {
  try {
    const { data: wishlists, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .contains('shared_with', [req.user.id])
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(wishlists.map(w => formatWishlist(w, false)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPublicWishlistById = async (req, res) => {
  try {
    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !wishlist) return res.status(404).json({ message: 'Wishlist not found.' });

    const isPublic = wishlist.is_public || wishlist.visibility === 'public';
    if (!isPublic) return res.status(403).json({ message: 'This wishlist is private.' });

    res.json(formatWishlist(wishlist, false));
  } catch (error) {
    console.error('Public wishlist fetch error:', error);
    res.status(500).json({ message: 'Unable to load wishlist.' });
  }
};

export const discoverGifts = async (req, res) => {
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
};

export const getWishlistById = async (req, res) => {
  try {
    const { data: wishlist, error } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('id', req.params.id)
      .single();

    if (error || !wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const isOwner = req.user?.id === wishlist.user_id;
    res.json(formatWishlist(wishlist, isOwner));
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

export const createWishlist = async (req, res) => {
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
        user_id: req.user.id
      })
      .select()
      .single();

    if (error) throw error;
    
    // Create items if any are passed during creation
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
    res.status(201).json({ success: true, wishlist: formatWishlist(wishlist, true) });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateWishlist = async (req, res) => {
  try {
    const { data: existing, error: eErr } = await supabase
      .from('wishlists')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (eErr || !existing) return res.status(404).json({ error: 'Wishlist not found' });
    if (existing.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    const { name, occasion, visibility, isPublic, gender } = req.body;
    
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (occasion !== undefined) updates.occasion = occasion;
    if (gender !== undefined) updates.gender = gender;
    
    if (visibility !== undefined) {
      updates.visibility = visibility;
      updates.is_public = visibility === 'public';
    } else if (isPublic !== undefined) {
      updates.is_public = isPublic;
      updates.visibility = isPublic ? 'public' : 'private';
    }

    const { data: updated, error } = await supabase
      .from('wishlists')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, items(*)')
      .single();

    if (error) throw error;
    
    res.json({ success: true, wishlist: formatWishlist(updated, true) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const addItemToWishlist = async (req, res) => {
  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: "Wishlist not found" });
    if (wishlist.user_id !== req.user.id) return res.status(403).json({ error: "Only the owner can add items" });

    const { data: item, error } = await supabase
      .from('items')
      .insert({
        wishlist_id: req.params.id,
        name: req.body.name,
        link: req.body.link,
        img: req.body.img,
        notes: req.body.notes,
        hidden_from_owner: req.body.hiddenFromOwner || false
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(formatItem(item));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const shareWishlist = async (req, res) => {
  try {
    const { shareUserId } = req.body;
    if (!shareUserId) return res.status(400).json({ error: "shareUserId is required" });

    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('shared_with, name')
      .eq('id', req.params.id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: "Wishlist not found" });

    let sharedWith = wishlist.shared_with || [];
    if (!sharedWith.includes(shareUserId)) {
      sharedWith.push(shareUserId);
      
      await supabase
        .from('wishlists')
        .update({ shared_with: sharedWith })
        .eq('id', req.params.id);

      await sendNotification(shareUserId, `${req.user.id} shared a wishlist with you: "${wishlist.name}"`, 'share');
    }

    res.json({ success: true, sharedWith });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveSharedWishlist = async (req, res) => {
  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ message: 'Wishlist not found' });

    const isPublic = wishlist.is_public || wishlist.visibility === 'public';
    if (!isPublic) return res.status(403).json({ message: 'Only public wishlists can be saved from links' });
    if (wishlist.user_id === req.user.id) return res.status(400).json({ message: 'You already own this wishlist' });

    let sharedWith = wishlist.shared_with || [];
    if (sharedWith.includes(req.user.id)) {
      return res.status(400).json({ message: 'This wishlist is already in Shared With Me' });
    }

    sharedWith.push(req.user.id);
    await supabase.from('wishlists').update({ shared_with: sharedWith }).eq('id', req.params.id);

    wishlist.shared_with = sharedWith;
    res.json({ success: true, wishlist: formatWishlist(wishlist, false) });
  } catch (err) {
    console.error('Save shared wishlist error:', err);
    res.status(500).json({ message: err.message });
  }
};

export const purchaseItem = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { itemId, hiddenFromOwner } = req.body;

    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('id, user_id, name')
      .eq('id', wishlistId)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const { data: item, error: iErr } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .eq('wishlist_id', wishlistId)
      .single();

    if (iErr || !item) return res.status(404).json({ message: "Item not found" });

    if (item.is_purchased) {
      // Undo purchase logic
      await supabase.from('items').update({
        is_purchased: false,
        purchased_at: null,
        purchased_by: null,
        hidden_from_owner: false
      }).eq('id', itemId);
      
      const { data: hw } = await supabase.from('wishlists').select('*, items(*)').eq('id', wishlistId).single();
      return res.json(formatWishlist(hw, wishlist.user_id === req.user.id));
    }

    const updates = {
      is_purchased: true,
      purchased_at: new Date().toISOString(),
      purchased_by: req.user.id
    };
    if (hiddenFromOwner !== undefined) updates.hidden_from_owner = hiddenFromOwner;

    await supabase.from('items').update(updates).eq('id', itemId);

    const msg = updates.hidden_from_owner || item.hidden_from_owner
      ? "Someone purchased a surprise gift from your wishlist!"
      : `Someone purchased "${item.name}" from your wishlist!`;
    await sendNotification(wishlist.user_id, msg, 'purchase');

    const { data: hw } = await supabase.from('wishlists').select('*, items(*)').eq('id', wishlistId).single();
    res.json(formatWishlist(hw, false));
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const deleteWishlistItem = async (req, res) => {
  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: 'Not found' });
    if (wishlist.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await supabase.from('items').delete().eq('id', req.params.itemId).eq('wishlist_id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteWishlist = async (req, res) => {
  try {
    const { data: wishlist, error: wErr } = await supabase
      .from('wishlists')
      .select('user_id')
      .eq('id', req.params.id)
      .single();

    if (wErr || !wishlist) return res.status(404).json({ error: 'Not found' });
    if (wishlist.user_id !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });

    await supabase.from('wishlists').delete().eq('id', req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
