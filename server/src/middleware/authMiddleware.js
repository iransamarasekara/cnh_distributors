const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Invalid token" });
  }
};

// For role-based authorization (optional enhancement)
exports.authorize = (roles = []) => {
  // roles param can be a single role string (e.g., 'admin') or an array (e.g., ['admin', 'manager'])
  if (typeof roles === "string") {
    roles = [roles];
  }

  return (req, res, next) => {
    if (roles.length && !roles.includes(req.user.role)) {
      // User's role is not authorized
      return res
        .status(403)
        .json({ message: "Forbidden: insufficient permissions" });
    }

    // Authentication and authorization successful
    next();
  };
};
