import jwt from 'jsonwebtoken';
import { supabase } from './supabase.js';

export const protect = async (req) => {
  let authHeader = req.headers.authorization;
  // Account for weird Vercel lowercase headers sometimes
  if (!authHeader) authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Not authorized — no token provided');
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, preferences, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) throw new Error('User not found');
    user._id = user.id;
    return user;
  } catch (err) {
    throw new Error('Not authorized — invalid or expired token');
  }
};
