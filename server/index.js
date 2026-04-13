import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import passport from 'passport';
import session from 'express-session';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import discoverRoutes from './routes/discoverRoutes.js';
import { initPassport } from './config/passport.js';
import { protect } from './middleware/authMiddleware.js';
import Notification from './models/Notification.js';
import Wishlist from './models/Wishlist.js';

const app = express();
const PORT = process.env.PORT || 5001;
const isProduction = process.env.NODE_ENV === 'production';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

if (isProduction) {
  app.set('trust proxy', 1);
}

app.use(helmet({
  crossOriginResourcePolicy: false,
}));

app.use(cors({
  origin: isProduction ? frontendUrl : true,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      httpOnly: true,
    },
  })
);

initPassport();
app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/discover', discoverRoutes);

app.get('/api/notifications', protect, async (req, res) => {
  try {
    const notifications = await Notification
      .find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notifications', protect, async (req, res) => {
  try {
    const { message, type } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ error: 'message is required' });
    }

    const notification = await Notification.create({
      userId: req.user._id.toString(),
      message: message.trim(),
      type: type || 'info',
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id.toString() },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id.toString(), read: false },
      { read: true }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notifications', protect, async (req, res) => {
  try {
    await Notification.deleteMany({ userId: req.user._id.toString() });
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/search', protect, async (req, res) => {
  const query = req.query.q?.trim();

  if (!query) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  try {
    const regex = new RegExp(query, 'i');
    const wishlists = await Wishlist.find({ userId: req.user._id.toString() })
      .sort({ createdAt: -1 })
      .lean();

    const matchedWishlists = wishlists
      .filter((wishlist) => regex.test(wishlist.name))
      .slice(0, 20);

    const matchedItems = wishlists
      .flatMap((wishlist) =>
        (wishlist.items || [])
          .filter((item) => regex.test(item.name))
          .map((item) => ({
            ...item,
            wishlistId: wishlist._id,
            wishlistName: wishlist.name,
          }))
      )
      .slice(0, 20);

    res.json({
      wishlists: matchedWishlists,
      items: matchedItems,
    });
  } catch (error) {
    console.error('Search error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

const connectDB = async () => {
  console.log('Mongo URI defined:', !!process.env.MONGO_URI);

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    console.error(
      'URI used:',
      process.env.MONGO_URI ? 'URI exists in env' : 'URI is undefined/missing'
    );
    process.exit(1);
  }
};

const startServer = async () => {
  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not set.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set.');
    process.exit(1);
  }

  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
