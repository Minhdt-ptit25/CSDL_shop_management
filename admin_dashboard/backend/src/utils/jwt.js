const jwt = require("jsonwebtoken");

function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (!s || String(s).trim() === "") {
    if (process.env.NODE_ENV === "production") {
      throw new Error("JWT_SECRET must be set in production");
    }
    return "dev-only-change-me";
  }
  return s;
}

function signAccessToken(payload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

function verifyAccessToken(token) {
  return jwt.verify(token, getJwtSecret());
}

module.exports = { signAccessToken, verifyAccessToken, getJwtSecret };
