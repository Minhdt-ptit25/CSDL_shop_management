const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireAdmin } = require("../middleware/adminAuth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

function serialize(row) {
  return {
    ma_hd:                  row.ma_hd,
    ngay_tao:               toDateOnlyString(row.ngay_tao),
    tong_tien:              toNumber(row.tong_tien),
    phuong_thuc_thanh_toan: row.phuong_thuc_thanh_toan,
    trang_thai:             row.trang_thai,
    ma_kh:                  row.ma_kh,
    ma_nv:                  row.ma_nv,
  };
}

// GET /orders
router.get("/", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip  || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.hoaDon.findMany({ skip, take, orderBy: { ma_hd: "asc" } });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /orders
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const data = req.body || {};
    const ngay_tao = toDateOnlyString(data.ngay_tao);
    if (!ngay_tao) return res.status(400).json({ detail: "Trường ngay_tao không hợp lệ" });

    const created = await prisma.hoaDon.create({
      data: {
        ma_hd:                  String(data.ma_hd),
        ngay_tao,
        tong_tien:              data.tong_tien,
        phuong_thuc_thanh_toan: String(data.phuong_thuc_thanh_toan),
        trang_thai:             String(data.trang_thai),
        ma_kh:                  String(data.ma_kh),
        ma_nv:                  String(data.ma_nv),
      },
    });
    res.status(201).json(serialize(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

// PUT /orders/:ma_hd
router.put("/:ma_hd", requireAdmin, async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const existing = await prisma.hoaDon.findUnique({ where: { ma_hd } });
    if (!existing) return res.status(404).json({ detail: "Hóa đơn không tồn tại" });

    const data = req.body || {};
    const updated = await prisma.hoaDon.update({
      where: { ma_hd },
      data: {
        ngay_tao:               data.ngay_tao ? toDateOnlyString(data.ngay_tao) : undefined,
        tong_tien:              data.tong_tien != null ? data.tong_tien : undefined,
        phuong_thuc_thanh_toan: data.phuong_thuc_thanh_toan ? String(data.phuong_thuc_thanh_toan) : undefined,
        trang_thai:             data.trang_thai ? String(data.trang_thai) : undefined,
        ma_kh:                  data.ma_kh ? String(data.ma_kh) : undefined,
        ma_nv:                  data.ma_nv ? String(data.ma_nv) : undefined,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    next(err);
  }
});

// DELETE /orders/:ma_hd
router.delete("/:ma_hd", requireAdmin, async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const existing = await prisma.hoaDon.findUnique({ where: { ma_hd } });
    if (!existing) return res.status(404).json({ detail: "Hóa đơn không tồn tại" });

    await prisma.chiTietHoaDon.deleteMany({ where: { ma_hd } });
    await prisma.hoaDon.delete({ where: { ma_hd } });

    res.json({ message: "Xóa hóa đơn thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
