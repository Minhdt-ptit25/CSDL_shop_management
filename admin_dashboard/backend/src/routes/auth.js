const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { comparePassword } = require("../utils/password");
const { signAccessToken } = require("../utils/jwt");

const router = Router();

// POST /login
router.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({ detail: "Thiếu tên đăng nhập hoặc mật khẩu" });
    }

    const employee = await prisma.nhanVien.findUnique({
      where: { ten_dang_nhap: username },
    });

    if (!employee) {
      return res.status(401).json({ detail: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const isValid = await comparePassword(password, employee.mat_khau_hash);
    if (!isValid) {
      return res.status(401).json({ detail: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    const token = signAccessToken({
      ma_nv: employee.ma_nv,
      vai_tro: employee.vai_tro,
      ho_ten: employee.ho_ten_nv,
    });

    return res.json({
      access_token: token,
      token_type: "bearer",
      success: true,
      user: {
        ma_nv: employee.ma_nv,
        ho_ten: employee.ho_ten_nv,
        vai_tro: employee.vai_tro,
      },
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
