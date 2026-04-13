import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    console.log(`✅ Token verified — userId: ${decoded.id}`);

    // Attach the full user (minus password) to the request
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized — user not found',
      });
    }

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
