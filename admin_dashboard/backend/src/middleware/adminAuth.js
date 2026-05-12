// Middleware xác thực admin đơn giản dùng token tĩnh.
// Nếu sau này cần JWT thật thì chỉ cần thay hàm getCurrentAdmin.

const ADMIN_TOKEN = "fake-super-secret-token";

function getCurrentAdmin(req) {
  const authorization = req.header("authorization") || "";
  if (!authorization.startsWith("Bearer ")) {
    return { ok: false, error: { status: 401, body: { detail: "Not authenticated" } } };
  }
  const token = authorization.slice(7); // cắt "Bearer "
  if (token !== ADMIN_TOKEN) {
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
