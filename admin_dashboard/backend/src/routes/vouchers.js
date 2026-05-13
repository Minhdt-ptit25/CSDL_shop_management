const { Router } = require("express");
const { Prisma } = require("@prisma/client");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();
const adminOnly = checkRole("admin");

function serialize(v) {
  return {
    ma_voucher: v.ma_voucher,
    mo_ta: v.mo_ta,
    phan_tram_giam: v.phan_tram_giam,
    so_tien_giam_toida: toNumber(v.so_tien_giam_toida),
    gia_tri_don_toithieu: toNumber(v.gia_tri_don_toithieu),
    ngay_bat_dau: v.ngay_bat_dau instanceof Date ? v.ngay_bat_dau.toISOString() : v.ngay_bat_dau,
    ngay_het_han: v.ngay_het_han instanceof Date ? v.ngay_het_han.toISOString() : v.ngay_het_han,
    so_luong_phat_hanh: v.so_luong_phat_hanh,
    so_luong_da_dung: v.so_luong_da_dung,
  };
}

router.get("/", async (_req, res, next) => {
  try {
    const rows = await prisma.voucher.findMany({ orderBy: { ma_voucher: "asc" } });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

router.get("/:ma_voucher", async (req, res, next) => {
  try {
    const row = await prisma.voucher.findUnique({ where: { ma_voucher: req.params.ma_voucher } });
    if (!row) return res.status(404).json({ detail: "Voucher không tồn tại" });
    res.json(serialize(row));
  } catch (err) {
    next(err);
  }
});

router.post("/", adminOnly, async (req, res, next) => {
  try {
    const d = req.body || {};
    const ngay_bat_dau = d.ngay_bat_dau ? new Date(d.ngay_bat_dau) : null;
    const ngay_het_han = d.ngay_het_han ? new Date(d.ngay_het_han) : null;
    if (!ngay_bat_dau || !ngay_het_han || Number.isNaN(ngay_bat_dau.getTime()) || Number.isNaN(ngay_het_han.getTime())) {
      return res.status(400).json({ detail: "Ngày bắt đầu / hết hạn không hợp lệ" });
    }
    const created = await prisma.voucher.create({
      data: {
        ma_voucher: String(d.ma_voucher),
        mo_ta: d.mo_ta != null ? String(d.mo_ta) : null,
        phan_tram_giam: Number(d.phan_tram_giam) || 0,
        so_tien_giam_toida: new Prisma.Decimal(String(d.so_tien_giam_toida != null ? d.so_tien_giam_toida : 0)),
        gia_tri_don_toithieu: new Prisma.Decimal(String(d.gia_tri_don_toithieu != null ? d.gia_tri_don_toithieu : 0)),
        ngay_bat_dau,
        ngay_het_han,
        so_luong_phat_hanh: Number(d.so_luong_phat_hanh) || 0,
        so_luong_da_dung: Number(d.so_luong_da_dung) || 0,
      },
    });
    res.status(201).json(serialize(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

router.put("/:ma_voucher", adminOnly, async (req, res, next) => {
  try {
    const { ma_voucher } = req.params;
    const existing = await prisma.voucher.findUnique({ where: { ma_voucher } });
    if (!existing) return res.status(404).json({ detail: "Voucher không tồn tại" });
    const d = req.body || {};
    const updated = await prisma.voucher.update({
      where: { ma_voucher },
      data: {
        mo_ta: d.mo_ta !== undefined ? (d.mo_ta == null ? null : String(d.mo_ta)) : undefined,
        phan_tram_giam: d.phan_tram_giam != null ? Number(d.phan_tram_giam) : undefined,
        so_tien_giam_toida: d.so_tien_giam_toida != null ? new Prisma.Decimal(String(d.so_tien_giam_toida)) : undefined,
        gia_tri_don_toithieu: d.gia_tri_don_toithieu != null ? new Prisma.Decimal(String(d.gia_tri_don_toithieu)) : undefined,
        ngay_bat_dau: d.ngay_bat_dau ? new Date(d.ngay_bat_dau) : undefined,
        ngay_het_han: d.ngay_het_han ? new Date(d.ngay_het_han) : undefined,
        so_luong_phat_hanh: d.so_luong_phat_hanh != null ? Number(d.so_luong_phat_hanh) : undefined,
        so_luong_da_dung: d.so_luong_da_dung != null ? Number(d.so_luong_da_dung) : undefined,
      },
    });
    res.json(serialize(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/:ma_voucher", adminOnly, async (req, res, next) => {
  try {
    const { ma_voucher } = req.params;
    const existing = await prisma.voucher.findUnique({ where: { ma_voucher } });
    if (!existing) return res.status(404).json({ detail: "Voucher không tồn tại" });
    const used = await prisma.hoaDon.count({ where: { ma_voucher } });
    if (used > 0) {
      return res.status(400).json({ detail: "Không xóa được: đã có hóa đơn dùng voucher này" });
    }
    await prisma.voucher.delete({ where: { ma_voucher } });
    res.json({ message: "Đã xóa voucher" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
