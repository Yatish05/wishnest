import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  link: String,
  img: String,
  notes: String,
  isPurchased: { type: Boolean, default: false },
  purchasedAt: { type: Date },
  purchasedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  hiddenFromOwner: { type: Boolean, default: false },
  wishlistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wishlist' } // keep for backward compatibility during transition if needed
});

const wishlistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  occasion: { type: String, default: 'Other' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  gender: {
    type: String,
    enum: ['male', 'female', 'unisex'],
    default: 'unisex'
  },
  isPublic: {
    type: Boolean,
    default: function defaultPublicState() {
      return this.visibility === 'public';
    }
  },
  userId: { type: String, required: true },
  items: [itemSchema],
  sharedWith: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

export default Wishlist;
