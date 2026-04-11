function getCurrentAdmin(req) {
  const authorization = req.header("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    return { ok: false, error: { status: 401, body: { detail: "Not authenticated" } } };
  }
  const token = authorization.split("Bearer ")[1];
  if (token !== "fake-super-secret-token") {
    return { ok: false, error: { status: 401, body: { detail: "Invalid admin token" } } };
  }
  return { ok: true, admin: { username: "admin" } };
}

function requireAdmin(req, res, next) {
  const result = getCurrentAdmin(req);
  if (!result.ok) {
    return res.status(result.error.status).json(result.error.body);
  }
  req.admin = result.admin;
  return next();
}

module.exports = { requireAdmin };

