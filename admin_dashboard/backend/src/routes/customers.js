const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");
const { determineTier } = require("../utils/customerTier");

const router = Router();

function serialize(row) {
  return {
    ma_kh:          row.ma_kh,
    ho_ten_kh:      row.ho_ten_kh,
    dia_chi:        row.dia_chi,
    sdt:            row.sdt,
    email:          row.email,
    diem_tich_luy:  row.diem_tich_luy  ?? 0,
    ten_hang:       row.ten_hang ?? "Vô hạng",
  };
}

// GET /customers/:ma_kh
router.get("/:ma_kh", async (req, res, next) => {
  try {
    const { ma_kh } = req.params;
    const row = await prisma.khachHang.findUnique({ where: { ma_kh } });
    if (!row) return res.status(404).json({ detail: "Khách hàng không tồn tại" });
    res.json(serialize(row));
  } catch (err) {
    next(err);
  }
});

// GET /customers
router.get("/", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip  || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.khachHang.findMany({ skip, take, orderBy: { ma_kh: "asc" } });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /customers
router.post("/", checkRole("admin", "cashier"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const points = Number(data.diem_tich_luy || 0);
    const tier = await determineTier(points);

    const created = await prisma.khachHang.create({
      data: {
        ma_kh:          String(data.ma_kh),
        ho_ten_kh:      String(data.ho_ten_kh),
        dia_chi:        data.dia_chi ? String(data.dia_chi) : null,
        sdt:            String(data.sdt),
        email:          data.email ? String(data.email) : null,
        diem_tich_luy:  points,
        ten_hang:       tier,
      },
    });
    res.status(201).json(serialize(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

// PUT /customers/:ma_kh
router.put("/:ma_kh", checkRole("admin", "cashier"), async (req, res, next) => {
  try {
    const { ma_kh } = req.params;
    const existing = await prisma.khachHang.findUnique({ where: { ma_kh } });
    if (!existing) return res.status(404).json({ detail: "Khách hàng không tồn tại" });

    const data = req.body || {};
    const points = data.diem_tich_luy !== undefined ? Number(data.diem_tich_luy) : existing.diem_tich_luy;
    const tier = await determineTier(points);

    const updated = await prisma.khachHang.update({
      where: { ma_kh },
      data: {
        ho_ten_kh:      data.ho_ten_kh ? String(data.ho_ten_kh) : undefined,
        dia_chi:        data.dia_chi !== undefined ? String(data.dia_chi) : undefined,
        sdt:            data.sdt ? String(data.sdt) : undefined,
        email:          data.email !== undefined ? String(data.email) : undefined,
        diem_tich_luy:  points,
        ten_hang:       tier,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /customers/:ma_kh
router.delete("/:ma_kh", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_kh } = req.params;
    const existing = await prisma.khachHang.findUnique({ where: { ma_kh } });
    if (!existing) return res.status(404).json({ detail: "Khách hàng không tồn tại" });

    const orders = await prisma.hoaDon.findMany({ where: { ma_kh }, select: { ma_hd: true } });
    const orderIds = orders.map((o) => o.ma_hd);

    await prisma.chiTietHoaDon.deleteMany({ where: { ma_hd: { in: orderIds } } });
    await prisma.hoaDon.deleteMany({ where: { ma_kh } });
    await prisma.khachHang.delete({ where: { ma_kh } });

    res.json({ message: "Xóa khách hàng thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
