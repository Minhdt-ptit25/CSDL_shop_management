const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

function serialize(row) {
  return {
    ma_ncc:  row.ma_ncc,
    ten_ncc: row.ten_ncc,
    dia_chi: row.dia_chi,
    sdt:     row.sdt,
    email:   row.email,
  };
}

// GET /suppliers/:ma_ncc
router.get("/:ma_ncc", async (req, res, next) => {
  try {
    const { ma_ncc } = req.params;
    const row = await prisma.nhaCungCap.findUnique({ where: { ma_ncc } });
    if (!row) return res.status(404).json({ detail: "Nhà cung cấp không tồn tại" });
    res.json(serialize(row));
  } catch (err) {
    next(err);
  }
});

// GET /suppliers
router.get("/", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip  || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.nhaCungCap.findMany({ skip, take, orderBy: { ma_ncc: "asc" } });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /suppliers
router.post("/", checkRole("admin", "warehouse"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const created = await prisma.nhaCungCap.create({
      data: {
        ma_ncc:  String(data.ma_ncc),
        ten_ncc: String(data.ten_ncc),
        dia_chi: String(data.dia_chi),
        sdt:     String(data.sdt),
        email:   String(data.email),
      },
    });
    res.status(201).json(serialize(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

// PUT /suppliers/:ma_ncc
router.put("/:ma_ncc", checkRole("admin", "warehouse"), async (req, res, next) => {
  try {
    const { ma_ncc } = req.params;
    const existing = await prisma.nhaCungCap.findUnique({ where: { ma_ncc } });
    if (!existing) return res.status(404).json({ detail: "Nhà cung cấp không tồn tại" });

    const data = req.body || {};
    const updated = await prisma.nhaCungCap.update({
      where: { ma_ncc },
      data: {
        ten_ncc: data.ten_ncc ? String(data.ten_ncc) : undefined,
        dia_chi: data.dia_chi ? String(data.dia_chi) : undefined,
        sdt:     data.sdt     ? String(data.sdt)     : undefined,
        email:   data.email   ? String(data.email)   : undefined,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /suppliers/:ma_ncc
router.delete("/:ma_ncc", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_ncc } = req.params;
    const existing = await prisma.nhaCungCap.findUnique({ where: { ma_ncc } });
    if (!existing) return res.status(404).json({ detail: "Nhà cung cấp không tồn tại" });

    const products = await prisma.sanPham.findMany({ where: { ma_ncc }, select: { ma_sp: true } });
    const productIds = products.map((p) => p.ma_sp);

    const skus = await prisma.bienTheSKU.findMany({
      where: { ma_sp: { in: productIds } },
      select: { ma_sku: true },
    });
    const skuIds = skus.map((s) => s.ma_sku);

    await prisma.chiTietHoaDon.deleteMany({ where: { ma_sku: { in: skuIds } } });
    await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_sku: { in: skuIds } } });
    await prisma.bienTheSKU.deleteMany({ where: { ma_sp: { in: productIds } } });
    await prisma.sanPham.deleteMany({ where: { ma_ncc } });

    const imports = await prisma.phieuNhap.findMany({ where: { ma_ncc }, select: { ma_pn: true } });
    const importIds = imports.map((i) => i.ma_pn);
    await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_pn: { in: importIds } } });
    await prisma.phieuNhap.deleteMany({ where: { ma_ncc } });

    await prisma.nhaCungCap.delete({ where: { ma_ncc } });
    res.json({ message: "Xóa nhà cung cấp thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
