const jwt = require('jsonwebtoken');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  // Expect: "Bearer <jwt>"
  const isBearer = authHeader.toLowerCase().startsWith('bearer ');
  if (!isBearer) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  const token = authHeader.slice(7).trim();
  if (!token || token === 'undefined' || token === 'null') {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  // Fast validation to avoid noisy jwt.verify() stack traces for obvious bad tokens
  if (token.split('.').length !== 3) {
    return res.status(401).json({ message: 'Not authorized, token malformed' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Mapping JWT payload {userId, role, refId} to service middleware interface
    req.user = { id: decoded.refId, userId: decoded.userId, role: decoded.role };

    return next();
  } catch (error) {
    console.warn('JWT verify failed:', error.message);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route.`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
