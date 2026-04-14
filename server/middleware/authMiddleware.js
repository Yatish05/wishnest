import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabase.js';

/**
 * protect — JWT authentication middleware.
 *
 * Reads the Bearer token from the Authorization header,
 * verifies it, fetches the matching user, and attaches
 * it to req.user so downstream handlers can use it.
 *
 * Returns 401 if the token is missing, malformed, or expired.
 */
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized — no token provided',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify signature + expiry
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the full user (minus password) to the request
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, preferences, created_at')
      .eq('id', decoded.id)
      .single();

    if (error || !user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

    // Assign _id for backward compatibility
    user._id = user.id;
    req.user = user;
    next();
  } catch (err) {
    console.error('❌ Token verification failed:', err.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized — invalid or expired token',
    });
  }
};
