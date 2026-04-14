import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

import express from 'express';
import cors from 'cors';
import passport from 'passport';
import session from 'express-session';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import discoverRoutes from './routes/discoverRoutes.js';
import { initPassport } from './config/passport.js';
import { protect } from './middleware/authMiddleware.js';
import { supabase } from './config/supabase.js';

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
  origin: function (origin, callback) {
    if (!isProduction) {
      return callback(null, true);
    }
    if (!origin || origin === frontendUrl) {
      return callback(null, origin);
    }
    const urlObj = new URL(frontendUrl);
    const wwwUrl = `${urlObj.protocol}//www.${urlObj.hostname}`;
    if (origin === wwwUrl) {
      return callback(null, origin);
    }
    return callback(new Error('Not allowed by CORS'));
  },
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

app.get('/api/health', (_req, res) => res.json({ success: true, status: 'ok' }));
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/wishlists', wishlistRoutes);
app.use('/api/discover', discoverRoutes);

// --- Notifications ---
app.get('/api/notifications', protect, async (req, res) => {
  try {
    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
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

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id: req.user.id,
        message: message.trim(),
        type: type || 'info'
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(notification);
  } catch (error) {
    console.error('Create notification error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/:id/read', protect, async (req, res) => {
  try {
    const { data: notification, error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', req.params.id)
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return res.status(404).json({ error: 'Not found' });
      throw error;
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification read error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/notifications/read-all', protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', req.user.id)
      .eq('read', false);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Mark all notifications read error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notifications', protect, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', req.user.id);

    if (error) throw error;
    res.json({ success: true, message: 'All notifications cleared' });
  } catch (error) {
    console.error('Clear notifications error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- Search ---
app.get('/api/search', protect, async (req, res) => {
  const query = req.query.q?.trim();
  if (!query) return res.status(400).json({ error: 'Query parameter "q" is required' });

  try {
    const { data: wishlists, error: hlErr } = await supabase
      .from('wishlists')
      .select('*, items(*)')
      .eq('user_id', req.user.id)
      .ilike('name', `%${query}%`)
      .order('created_at', { ascending: false })
      .limit(20);

    if (hlErr) throw hlErr;

    const { data: items, error: itErr } = await supabase
      .from('items')
      .select('*, wishlists!inner(id, name, user_id)')
      .eq('wishlists.user_id', req.user.id)
      .ilike('name', `%${query}%`)
      .limit(20);
      
    if (itErr) throw itErr;

    // Mongoose mapped ID to _id conventionally. Supabase returns `id`. 
    // We'll leave `id` mappings mostly up to the frontend assuming it handles `id` or we can alias `id as _id` if needed.
    // The previous code returned normal object structure but mongoose models have both _id and id.
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
});

const startServer = async () => {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('❌ SUPABASE credentials are not set.');
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET is not set.');
    process.exit(1);
  }

  try {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
