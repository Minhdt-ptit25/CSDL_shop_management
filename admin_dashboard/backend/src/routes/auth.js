const { Router } = require("express");

const router = Router();

// POST /login
// Xác thực đơn giản — nếu cần bảo mật thật thì thay bằng JWT + bcrypt
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "admin" && password === "12345") {
    return res.json({
      access_token: "fake-super-secret-token",
      token_type:   "bearer",
      success:      true,
      message:      "Login successful",
    });
  }
  return res.status(401).json({ detail: "Sai tên đăng nhập hoặc mật khẩu" });
});

module.exports = router;
