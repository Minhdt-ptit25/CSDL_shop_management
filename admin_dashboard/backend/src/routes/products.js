const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

function serialize(row) {
  return {
    ma_sp:    row.ma_sp,
    ten_sp:   row.ten_sp,
    danh_muc: row.danh_muc,
    chat_lieu: row.chat_lieu,
    gioi_tinh: row.gioi_tinh,
    ma_ncc:   row.ma_ncc,
  };
}

// GET /products/:ma_sp
router.get("/:ma_sp", async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const row = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!row) return res.status(404).json({ detail: "Sản phẩm không tồn tại" });
    res.json(serialize(row));
  } catch (err) {
    next(err);
  }
});

// GET /products
router.get("/", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip  || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.sanPham.findMany({ skip, take, orderBy: { ma_sp: "asc" } });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /products
router.post("/", checkRole("admin", "warehouse"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const created = await prisma.sanPham.create({
      data: {
        ma_sp:    String(data.ma_sp),
        ten_sp:   String(data.ten_sp),
        danh_muc: String(data.danh_muc),
        chat_lieu: String(data.chat_lieu),
        gioi_tinh: String(data.gioi_tinh),
        ma_ncc:   String(data.ma_ncc),
      },
    });
    res.status(201).json(serialize(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

// PUT /products/:ma_sp
router.put("/:ma_sp", checkRole("admin", "warehouse"), async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const existing = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!existing) return res.status(404).json({ detail: "Sản phẩm không tồn tại" });

    const data = req.body || {};
    const updated = await prisma.sanPham.update({
      where: { ma_sp },
      data: {
        ten_sp:    data.ten_sp ? String(data.ten_sp) : undefined,
        danh_muc:  data.danh_muc ? String(data.danh_muc) : undefined,
        chat_lieu: data.chat_lieu ? String(data.chat_lieu) : undefined,
        gioi_tinh: data.gioi_tinh ? String(data.gioi_tinh) : undefined,
        ma_ncc:    data.ma_ncc ? String(data.ma_ncc) : undefined,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /products/:ma_sp
router.delete("/:ma_sp", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const existing = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!existing) return res.status(404).json({ detail: "Sản phẩm không tồn tại" });

    const skus = await prisma.bienTheSKU.findMany({ where: { ma_sp } });
    const skuIds = skus.map((s) => s.ma_sku);

    await prisma.chiTietHoaDon.deleteMany({ where: { ma_sku: { in: skuIds } } });
    await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_sku: { in: skuIds } } });
    await prisma.bienTheSKU.deleteMany({ where: { ma_sp } });
    await prisma.sanPham.delete({ where: { ma_sp } });

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
