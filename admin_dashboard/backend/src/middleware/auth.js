const { verifyAccessToken } = require("../utils/jwt");

function requireAuth(req, res, next) {
  const authorization = req.header("authorization") || "";
  const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
  if (!token) {
    return res.status(401).json({ detail: "Not authenticated" });
  }
  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    return next();
  } catch {
    return res.status(401).json({ detail: "Invalid or expired token" });
  }
}

/** @param {...string} allowedRoles */
function checkRole(...allowedRoles) {
  return (req, res, next) => {
    requireAuth(req, res, () => {
      const role = req.user && req.user.vai_tro;
      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ detail: "Forbidden" });
      }
      return next();
    });
  };
}

module.exports = { requireAuth, checkRole };
