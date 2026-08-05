import jwt from 'jsonwebtoken';
import { supabase } from './supabase.js';

export const protect = async (req) => {
  let token = null;

  // 1. Try reading token from HttpOnly cookie header
  const cookieHeader = req.headers.cookie || req.headers.Cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
      const [key, ...v] = cookie.trim().split('=');
      if (key && v.length) acc[key] = decodeURIComponent(v.join('='));
      return acc;
    }, {});
    if (cookies.token) {
      token = cookies.token;
    }
  }

  // 2. Fallback to Authorization: Bearer header
  if (!token) {
    let authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    throw new Error('Not authorized — no token provided');
  }

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
  } catch {
    throw new Error('Not authorized — invalid or expired token');
  }
};
