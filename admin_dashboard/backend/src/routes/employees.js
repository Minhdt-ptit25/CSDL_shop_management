const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { toDateOnlyString } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

function serialize(row) {
  return {
    ma_nv:        row.ma_nv,
    ho_ten_nv:    row.ho_ten_nv,
    ngay_sinh:    toDateOnlyString(row.ngay_sinh),
    gioi_tinh:    row.gioi_tinh,
    dia_chi:      row.dia_chi,
    sdt:          row.sdt,
    email:        row.email,
    ngay_vao_lam: toDateOnlyString(row.ngay_vao_lam),
    ma_vi_tri:    row.ma_vi_tri,
    ma_ch:        row.ma_ch,
  };
}

// GET /employees/me - Get current employee info (for all roles)
router.get("/me", async (req, res, next) => {
  try {
    const authorization = req.header("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
    
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    try {
      const { verifyAccessToken } = require("../utils/jwt");
      const decoded = verifyAccessToken(token);
      const ma_nv = decoded.ma_nv;

      const employee = await prisma.nhanVien.findUnique({ where: { ma_nv } });
      if (!employee) {
        return res.status(404).json({ detail: "Nhân viên không tồn tại" });
      }

      res.json(serialize(employee));
    } catch {
      return res.status(401).json({ detail: "Invalid or expired token" });
    }
  } catch (err) {
    next(err);
  }
});

// PUT /employees/me - Update current employee info (only allow non-sensitive fields)
router.put("/me", async (req, res, next) => {
  try {
    const authorization = req.header("authorization") || "";
    const token = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : null;
    
    if (!token) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    try {
      const { verifyAccessToken } = require("../utils/jwt");
      const decoded = verifyAccessToken(token);
      const ma_nv = decoded.ma_nv;

      const existing = await prisma.nhanVien.findUnique({ where: { ma_nv } });
      if (!existing) {
        return res.status(404).json({ detail: "Nhân viên không tồn tại" });
      }

      const data = req.body || {};
      const updateData = {};

      // Only allow updating non-sensitive fields
      if (data.dia_chi) updateData.dia_chi = String(data.dia_chi);
      if (data.email) updateData.email = String(data.email);
      if (data.sdt) updateData.sdt = String(data.sdt);

      const updated = await prisma.nhanVien.update({
        where: { ma_nv },
        data: updateData,
      });

      res.json(serialize(updated));
    } catch {
      return res.status(401).json({ detail: "Invalid or expired token" });
    }
  } catch (err) {
    next(err);
  }
});

// GET /employees/:ma_nv
router.get("/:ma_nv", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_nv } = req.params;
    const row = await prisma.nhanVien.findUnique({ where: { ma_nv } });
    if (!row) return res.status(404).json({ detail: "Nhân viên không tồn tại" });
    res.json(serialize(row));
  } catch (err) {
    next(err);
  }
});

// GET /employees
router.get("/", checkRole("admin"), async (req, res, next) => {
  try {
    const skip = Number(req.query.skip  || 0);
    const take = Number(req.query.limit || 100);
    const totalCount = await prisma.nhanVien.count();
    const rows = await prisma.nhanVien.findMany({ skip, take, orderBy: { ma_nv: "asc" } });
    res.set("X-Total-Count", String(totalCount));
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /employees
router.post("/", checkRole("admin"), async (req, res, next) => {
  try {
    const data = req.body || {};

    const ngay_sinh = toDateOnlyString(data.ngay_sinh);
    if (!ngay_sinh) return res.status(400).json({ detail: "Trường ngay_sinh không hợp lệ" });

    const ngay_vao_lam = toDateOnlyString(data.ngay_vao_lam);
    if (!ngay_vao_lam) return res.status(400).json({ detail: "Trường ngay_vao_lam không hợp lệ" });

    const created = await prisma.nhanVien.create({
      data: {
        ma_nv:        String(data.ma_nv),
        ho_ten_nv:    String(data.ho_ten_nv),
        ngay_sinh:    new Date(ngay_sinh),
        gioi_tinh:    String(data.gioi_tinh),
        dia_chi:      String(data.dia_chi),
        sdt:          String(data.sdt),
        email:        String(data.email),
        ngay_vao_lam: new Date(ngay_vao_lam),
        ma_vi_tri:    String(data.ma_vi_tri),
        ma_ch:        String(data.ma_ch),
        ten_dang_nhap: String(data.ten_dang_nhap || data.ma_nv),
        mat_khau_hash: "$2b$10$5XbCCqwl7PgTQlCgSm2bWusPPTA3kYWiqaXjD.mAlymWBsBRc/MyW",
        vai_tro:      String(data.vai_tro || "cashier"),
      },
    });
    res.status(201).json(serialize(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

// PUT /employees/:ma_nv
router.put("/:ma_nv", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_nv } = req.params;
    const existing = await prisma.nhanVien.findUnique({ where: { ma_nv } });
    if (!existing) return res.status(404).json({ detail: "Nhân viên không tồn tại" });

    const data = req.body || {};
    const updated = await prisma.nhanVien.update({
      where: { ma_nv },
      data: {
        ho_ten_nv:    data.ho_ten_nv    ? String(data.ho_ten_nv)                : undefined,
        ngay_sinh:    data.ngay_sinh    ? new Date(toDateOnlyString(data.ngay_sinh)) : undefined,
        gioi_tinh:    data.gioi_tinh    ? String(data.gioi_tinh)                : undefined,
        dia_chi:      data.dia_chi      ? String(data.dia_chi)                  : undefined,
        sdt:          data.sdt          ? String(data.sdt)                      : undefined,
        email:        data.email        ? String(data.email)                    : undefined,
        ngay_vao_lam: data.ngay_vao_lam ? new Date(toDateOnlyString(data.ngay_vao_lam)) : undefined,
        ma_vi_tri:    data.ma_vi_tri    ? String(data.ma_vi_tri)                : undefined,
        ma_ch:        data.ma_ch        ? String(data.ma_ch)                    : undefined,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /employees/:ma_nv
router.delete("/:ma_nv", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_nv } = req.params;
    const existing = await prisma.nhanVien.findUnique({ where: { ma_nv } });
    if (!existing) return res.status(404).json({ detail: "Nhân viên không tồn tại" });

    const orders = await prisma.hoaDon.findMany({ where: { ma_nv }, select: { ma_hd: true } });
    const orderIds = orders.map((o) => o.ma_hd);
    await prisma.chiTietHoaDon.deleteMany({ where: { ma_hd: { in: orderIds } } });
    await prisma.hoaDon.deleteMany({ where: { ma_nv } });

    const imports = await prisma.phieuNhap.findMany({ where: { ma_nv }, select: { ma_pn: true } });
    const importIds = imports.map((i) => i.ma_pn);
    await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_pn: { in: importIds } } });
    await prisma.phieuNhap.deleteMany({ where: { ma_nv } });

    await prisma.nhanVien.delete({ where: { ma_nv } });
    res.json({ message: "Xóa nhân viên thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
