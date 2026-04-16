const jwt = require("jsonwebtoken");

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      console.log("=== PATIENT PROTECT MIDDLEWARE ===");
      console.log("Decoded token role:", decoded.role);
      console.log("Decoded token refId:", decoded.refId);

      // ✅ Set user object correctly
      req.user = {
        id: decoded.refId,
        userId: decoded.userId,
        role: decoded.role,
      };

      console.log("req.user.role set to:", req.user.role);

      next();
    } catch (error) {
      console.error("Token error:", error);
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    console.log("=== PATIENT AUTHORIZE MIDDLEWARE ===");
    console.log("User role:", req.user?.role);
    console.log("Allowed roles:", roles);

    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role ${req.user?.role} is not authorized. Allowed roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
