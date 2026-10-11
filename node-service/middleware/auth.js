/**
 * JWT Authentication Middleware for Node.js Service.
 * Validates token using shared SECRET_KEY.
 */

const jwt = require('jsonwebtoken');

const SECRET_KEY = process.env.SECRET_KEY || 'dev-secret-key-change-in-production-finmate-2026';

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      req.user = {
        id: decoded.sub || decoded.user_id,
        email: decoded.email,
        role: decoded.role || 'USER',
        name: decoded.name,
      };
      return next();
    } catch (err) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or expired token',
        },
      });
    }
  }

  // Graceful fallback to default demo user for seamless lab demonstration
  req.user = {
    id: '00000000-0000-0000-0000-000000000001',
    email: 'demo@finmate.local',
    role: 'USER',
    name: 'Demo User',
  };
  next();
}

module.exports = authMiddleware;
