import Wishlist from '../models/Wishlist.js';
import Notification from '../models/Notification.js';

/* ────────────────────────────────────────────────────────────
   PATCH /api/wishlists/:wishlistId/items/:itemId/purchase
   Logic: Mark item as purchased, with self-purchase protection.
──────────────────────────────────────────────────────────── */
export const markItemAsPurchased = async (req, res) => {
  try {
    const { wishlistId, itemId } = req.params;

    const wishlist = await Wishlist.findById(wishlistId);

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    const item = wishlist.items.id(itemId);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.isPurchased) {
      return res.status(400).json({ message: "Item already purchased" });
    }

    // Self-purchase protection
    if (wishlist.userId.toString() === req.user.id) {
      return res.status(403).json({ message: "You cannot purchase your own item" });
    }

    item.isPurchased = true;
    item.purchasedAt = new Date();
    item.purchasedBy = req.user.id;

    await wishlist.save();

    // Notify the owner
    const msg = item.hiddenFromOwner
      ? "Someone purchased a surprise gift from your wishlist!"
      : `Someone purchased "${item.name}" from your wishlist!`;

    const notif = new Notification({
      userId: wishlist.userId,
      message: msg,
      type: 'purchase'
    });
    await notif.save();

    console.log(`✅ Item "${item.name}" purchased in wishlist: ${wishlist.name}`);

    // Return the full updated wishlist as requested
    res.json(wishlist);
  } catch (error) {
    console.error('❌ Mark purchased error:', error);
    res.status(500).json({ message: "Failed to mark item as purchased" });
  }
};

/* ────────────────────────────────────────────────────────────
   GET /api/wishlists
   Internal helper or future route to list all wishlists for user.
──────────────────────────────────────────────────────────── */
export const getWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(wishlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getSharedWishlists = async (req, res) => {
  try {
    const wishlists = await Wishlist.find({ sharedWith: req.user.id }).sort({ createdAt: -1 });
    res.json(wishlists);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getPublicWishlistById = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id).lean();

    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found.' });
    }

    const isPublic = wishlist.isPublic || wishlist.visibility === 'public';
    if (!isPublic) {
      return res.status(403).json({ message: 'This wishlist is private.' });
    }

    wishlist.items = (wishlist.items || []).map((item) => ({
      ...item,
      purchased: item.isPurchased ?? item.purchased ?? false,
    }));

    res.json(wishlist);
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

    const genderFilter = gender === 'unisex'
      ? ['unisex', 'male', 'female']
      : [gender, 'unisex'];

    const wishlists = await Wishlist.find({
      $or: [
        { isPublic: true },
        { visibility: 'public' }
      ],
      gender: { $in: genderFilter }
    }).sort({ createdAt: -1 });

    const items = wishlists.flatMap((wishlist) =>
      (wishlist.items || []).map((item) => ({
        ...item.toObject(),
        wishlistId: wishlist._id,
        wishlistName: wishlist.name,
        wishlistOccasion: wishlist.occasion,
        wishlistGender: wishlist.gender,
        wishlistOwnerId: wishlist.userId,
      }))
    );

    res.json(items);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

/* ────────────────────────────────────────────────────────────
   GET /api/wishlists/:id
   Logic: Fetch single wishlist with embedded items.
   Includes: Privacy masking for surprise gifts.
──────────────────────────────────────────────────────────── */
export const getWishlistById = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);

    if (!wishlist) {
      return res.status(404).json({ message: "Wishlist not found" });
    }

    // Determine if the requester is the owner
    const isOwner = req.user?.id === wishlist.userId;

    // items are now embedded sub-documents
    const wishlistObj = wishlist.toObject();

    // Privacy Masking: If owner, hide items marked as hiddenFromOwner
    wishlistObj.items = wishlistObj.items.map(item => {
      if (isOwner && item.hiddenFromOwner) {
        // Return a masked version for the owner
        return {
          ...item,
          isPurchased: false,
          status: "Available"
        };
      }
      return {
        ...item,
        status: item.isPurchased ? "Purchased" : "Available"
      };
    });

    res.json(wishlistObj);
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    res.status(500).json({ message: "Failed to fetch wishlist" });
  }
};

/* ────────────────────────────────────────────────────────────
   POST /api/wishlists
   Logic: Create a new wishlist for the logged-in user.
──────────────────────────────────────────────────────────── */
export const createWishlist = async (req, res) => {
  try {
    const visibility = req.body.visibility || (req.body.isPublic ? 'public' : 'private');
    const wishlist = new Wishlist({
      ...req.body,
      visibility,
      isPublic: req.body.isPublic ?? visibility === 'public',
      userId: req.user.id
    });
    await wishlist.save();
    res.status(201).json({ success: true, wishlist });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   PUT /api/wishlists/:id
   Logic: Update an existing wishlist.
──────────────────────────────────────────────────────────── */
export const updateWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ error: 'Wishlist not found' });
    }

    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized to edit this wishlist' });
    }

    const { name, occasion, visibility, isPublic, gender } = req.body;
    
    if (name) wishlist.name = name;
    if (occasion) wishlist.occasion = occasion;
    if (gender) wishlist.gender = gender;
    
    if (visibility) {
      wishlist.visibility = visibility;
      wishlist.isPublic = visibility === 'public';
    } else if (isPublic !== undefined) {
      wishlist.isPublic = isPublic;
      wishlist.visibility = isPublic ? 'public' : 'private';
    }

    await wishlist.save();
    
    // Privacy Masking matching getWishlistById
    const wishlistObj = wishlist.toObject();
    wishlistObj.items = wishlistObj.items.map(item => {
      // Since owner is requesting, we apply owner masking logic
      if (item.hiddenFromOwner) {
        return {
          ...item,
          isPurchased: false,
          status: "Available"
        };
      }
      return {
        ...item,
        status: item.isPurchased ? "Purchased" : "Available"
      };
    });

    res.json({ success: true, wishlist: wishlistObj });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   POST /api/wishlists/:id/items
   Logic: Add a new item to a wishlist (sub-document).
──────────────────────────────────────────────────────────── */
export const addItemToWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    // Ensure only the owner can add items
    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Only the owner can add items" });
    }

    wishlist.items.push(req.body);
    await wishlist.save();

    res.status(201).json(wishlist.items[wishlist.items.length - 1]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   POST /api/wishlists/:wishlistId/share
   Logic: Invite a user to a wishlist.
──────────────────────────────────────────────────────────── */
export const shareWishlist = async (req, res) => {
  try {
    const { shareUserId } = req.body;
    if (!shareUserId) return res.status(400).json({ error: "shareUserId is required" });

    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return res.status(404).json({ error: "Wishlist not found" });

    if (!wishlist.sharedWith.includes(shareUserId)) {
      wishlist.sharedWith.push(shareUserId);
      await wishlist.save();

      const notif = new Notification({
        userId: shareUserId,
        message: `${req.user.id} shared a wishlist with you: "${wishlist.name}"`,
        type: 'share'
      });
      await notif.save();
    }

    res.json({ success: true, sharedWith: wishlist.sharedWith });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const saveSharedWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ message: 'Wishlist not found' });
    }

    const isPublic = wishlist.isPublic || wishlist.visibility === 'public';
    if (!isPublic) {
      return res.status(403).json({ message: 'Only public wishlists can be saved from links' });
    }

    if (wishlist.userId === req.user.id) {
      return res.status(400).json({ message: 'You already own this wishlist' });
    }

    if (wishlist.sharedWith.includes(req.user.id)) {
      return res.status(400).json({ message: 'This wishlist is already in Shared With Me' });
    }

    wishlist.sharedWith.push(req.user.id);
    await wishlist.save();

    res.json({ success: true, wishlist });
  } catch (err) {
    console.error('Save shared wishlist error:', err);
    res.status(500).json({ message: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   POST /api/wishlists/:wishlistId/purchase
   Logic: Alternative endpoint requested by the user.
   Matches the (req.params.wishlistId, req.body.itemId) pattern.
──────────────────────────────────────────────────────────── */
export const purchaseItem = async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const { itemId, hiddenFromOwner } = req.body;

    console.log(`Processing purchase for Wishlist: ${wishlistId}, Item: ${itemId}`);

    const wishlist = await Wishlist.findById(wishlistId);
    if (!wishlist) return res.status(404).json({ message: "Wishlist not found" });

    const item = wishlist.items.id(itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const wasPurchased = item.isPurchased;

    if (wasPurchased) {
      item.isPurchased = false;
      item.purchasedAt = undefined;
      item.purchasedBy = undefined;
      item.hiddenFromOwner = false;
      await wishlist.save();
      return res.json(wishlist);
    }

    item.isPurchased = true;
    item.purchasedAt = new Date();
    item.purchasedBy = req.user?.id;
    if (hiddenFromOwner !== undefined) item.hiddenFromOwner = hiddenFromOwner;

    await wishlist.save();

    // Notify owner
    const msg = item.hiddenFromOwner
      ? "Someone purchased a surprise gift from your wishlist!"
      : `Someone purchased "${item.name}" from your wishlist!`;

    const notif = new Notification({
      userId: wishlist.userId,
      message: msg,
      type: 'purchase'
    });
    await notif.save();

    res.json(wishlist);
  } catch (error) {
    console.error("Purchase error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ────────────────────────────────────────────────────────────
   DELETE /api/wishlists/:id/items/:itemId
   Logic: Remove an item from a wishlist.
──────────────────────────────────────────────────────────── */
export const deleteWishlistItem = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return res.status(404).json({ error: 'Not found' });
    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    wishlist.items = wishlist.items.filter(
      item => item._id.toString() !== req.params.itemId
    );
    await wishlist.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ────────────────────────────────────────────────────────────
   DELETE /api/wishlists/:id
   Logic: Delete the entire wishlist.
──────────────────────────────────────────────────────────── */
export const deleteWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) return res.status(404).json({ error: 'Not found' });
    if (wishlist.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await Wishlist.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
