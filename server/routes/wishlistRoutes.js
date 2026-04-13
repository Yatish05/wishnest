import express from 'express';
import {
  markItemAsPurchased,
  getWishlists,
  getSharedWishlists,
  getPublicWishlistById,
  getWishlistById,
  createWishlist,
  addItemToWishlist,
  shareWishlist,
  saveSharedWishlist,
  purchaseItem,
  deleteWishlistItem,
  deleteWishlist,
  updateWishlist
} from '../controllers/wishlistController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - no login required
router.get('/public/:id', getPublicWishlistById);

/* ────────────────────────────────────────────────────────────
   Protected Routes (Require JWT)
──────────────────────────────────────────────────────────── */

// GET /api/wishlists - Get all wishlists for the logged-in user
router.get('/', protect, getWishlists);

// GET /api/wishlists/shared - Get wishlists shared with the logged-in user
router.get('/shared', protect, getSharedWishlists);

// GET /api/wishlists/:id - Get single wishlist with embedded items
router.get('/:id', protect, getWishlistById);

// POST /api/wishlists - Create a new wishlist
router.post('/', protect, createWishlist);

// POST /api/wishlists/:id/items - Add item to wishlist
router.post('/:id/items', protect, addItemToWishlist);

// PUT /api/wishlists/:id - Update wishlist details
router.put('/:id', protect, updateWishlist);

// POST /api/wishlists/:id/share - Share wishlist
router.post('/:id/share', protect, shareWishlist);

// POST /api/wishlists/:id/save - Save a public wishlist to Shared With Me
router.post('/:id/save', protect, saveSharedWishlist);

// POST /api/wishlists/:wishlistId/purchase - Purchase item (alternative pattern)
router.post('/:wishlistId/purchase', protect, purchaseItem);

// PATCH /api/wishlists/:wishlistId/items/:itemId/purchase - Mark item as purchased
router.patch('/:wishlistId/items/:itemId/purchase', protect, markItemAsPurchased);

// DELETE /api/wishlists/:id/items/:itemId - Delete an item from wishlist
router.delete('/:id/items/:itemId', protect, deleteWishlistItem);

// DELETE /api/wishlists/:id - Delete a wishlist entirely
router.delete('/:id', protect, deleteWishlist);

export default router;
