const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { requireAdmin } = require("../middleware/adminAuth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

// ── Serializers ───────────────────────────────────────────────────────────────

function serializeVoucher(row) {
  return {
    ma_voucher:           row.ma_voucher,
    mo_ta:                row.mo_ta ?? null,
    phan_tram_giam:       row.phan_tram_giam,
    so_tien_giam_toida:   toNumber(row.so_tien_giam_toida),
    gia_tri_don_toithieu: toNumber(row.gia_tri_don_toithieu),
    ngay_bat_dau:         toDateOnlyString(row.ngay_bat_dau),
    ngay_het_han:         toDateOnlyString(row.ngay_het_han),
    so_luong_phat_hanh:   row.so_luong_phat_hanh,
    so_luong_da_dung:     row.so_luong_da_dung,
  };
}

function serializeHang(row) {
  return {
    ten_hang:        row.ten_hang,
    diem_toithieu:   row.diem_toithieu,
    phan_tram_uudai: row.phan_tram_uudai,
  };
}

// ── VOUCHER ───────────────────────────────────────────────────────────────────

router.get("/vouchers", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip  || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.voucher.findMany({ skip, take, orderBy: { ma_voucher: "asc" } });
    res.json(rows.map(serializeVoucher));
  } catch (err) { next(err); }
});

router.get("/vouchers/:ma_voucher", async (req, res, next) => {
  try {
    const row = await prisma.voucher.findUnique({ where: { ma_voucher: req.params.ma_voucher } });
    if (!row) return res.status(404).json({ detail: "Voucher không tồn tại" });
    res.json(serializeVoucher(row));
  } catch (err) { next(err); }
});

router.post("/vouchers", requireAdmin, async (req, res, next) => {
  try {
    const data = req.body || {};

    const ngay_bat_dau = toDateOnlyString(data.ngay_bat_dau);
    if (!ngay_bat_dau) return res.status(400).json({ detail: "Trường ngay_bat_dau không hợp lệ" });

    const ngay_het_han = toDateOnlyString(data.ngay_het_han);
    if (!ngay_het_han) return res.status(400).json({ detail: "Trường ngay_het_han không hợp lệ" });

    if (ngay_bat_dau > ngay_het_han)
      return res.status(400).json({ detail: "ngay_bat_dau phải trước ngay_het_han" });

    const created = await prisma.voucher.create({
      data: {
        ma_voucher:           String(data.ma_voucher),
        mo_ta:                data.mo_ta ? String(data.mo_ta) : null,
        phan_tram_giam:       Number(data.phan_tram_giam       || 0),
        so_tien_giam_toida:   data.so_tien_giam_toida   != null ? data.so_tien_giam_toida   : 0,
        gia_tri_don_toithieu: data.gia_tri_don_toithieu != null ? data.gia_tri_don_toithieu : 0,
        ngay_bat_dau,
        ngay_het_han,
        so_luong_phat_hanh:   Number(data.so_luong_phat_hanh || 0),
        so_luong_da_dung:     Number(data.so_luong_da_dung   || 0),
      },
    });
    res.status(201).json(serializeVoucher(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

router.put("/vouchers/:ma_voucher", requireAdmin, async (req, res, next) => {
  try {
    const { ma_voucher } = req.params;
    const existing = await prisma.voucher.findUnique({ where: { ma_voucher } });
    if (!existing) return res.status(404).json({ detail: "Voucher không tồn tại" });

    const data = req.body || {};
    const updated = await prisma.voucher.update({
      where: { ma_voucher },
      data: {
        mo_ta:                "mo_ta" in data ? (data.mo_ta ? String(data.mo_ta) : null) : undefined,
        phan_tram_giam:       data.phan_tram_giam       != null ? Number(data.phan_tram_giam)       : undefined,
        so_tien_giam_toida:   data.so_tien_giam_toida   != null ? data.so_tien_giam_toida            : undefined,
        gia_tri_don_toithieu: data.gia_tri_don_toithieu != null ? data.gia_tri_don_toithieu           : undefined,
        ngay_bat_dau:         data.ngay_bat_dau         ? toDateOnlyString(data.ngay_bat_dau)        : undefined,
        ngay_het_han:         data.ngay_het_han         ? toDateOnlyString(data.ngay_het_han)        : undefined,
        so_luong_phat_hanh:   data.so_luong_phat_hanh   != null ? Number(data.so_luong_phat_hanh)   : undefined,
        so_luong_da_dung:     data.so_luong_da_dung     != null ? Number(data.so_luong_da_dung)     : undefined,
      },
    });
    res.json(serializeVoucher(updated));
  } catch (err) { next(err); }
});

router.delete("/vouchers/:ma_voucher", requireAdmin, async (req, res, next) => {
  try {
    const { ma_voucher } = req.params;
    const existing = await prisma.voucher.findUnique({ where: { ma_voucher } });
    if (!existing) return res.status(404).json({ detail: "Voucher không tồn tại" });

    // Gỡ voucher khỏi hóa đơn trước khi xóa
    await prisma.hoaDon.updateMany({
      where: { ma_voucher },
      data:  { ma_voucher: null, giam_gia_voucher: 0 },
    });
    await prisma.voucher.delete({ where: { ma_voucher } });
    res.json({ message: "Xóa voucher thành công" });
  } catch (err) { next(err); }
});

// ── HẠNG THÀNH VIÊN ──────────────────────────────────────────────────────────

router.get("/tiers", async (_req, res, next) => {
  try {
    const rows = await prisma.hangThanhVien.findMany({ orderBy: { diem_toithieu: "asc" } });
    res.json(rows.map(serializeHang));
  } catch (err) { next(err); }
});

router.post("/tiers", requireAdmin, async (req, res, next) => {
  try {
    const data = req.body || {};
    const created = await prisma.hangThanhVien.create({
      data: {
        ten_hang:        String(data.ten_hang),
        diem_toithieu:   Number(data.diem_toithieu   || 0),
        phan_tram_uudai: Number(data.phan_tram_uudai || 0),
      },
    });
    res.status(201).json(serializeHang(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    next(err);
  }
});

router.put("/tiers/:ten_hang", requireAdmin, async (req, res, next) => {
  try {
    const { ten_hang } = req.params;
    const existing = await prisma.hangThanhVien.findUnique({ where: { ten_hang } });
    if (!existing) return res.status(404).json({ detail: "Hạng thành viên không tồn tại" });

    const data = req.body || {};
    const updated = await prisma.hangThanhVien.update({
      where: { ten_hang },
      data: {
        diem_toithieu:   data.diem_toithieu   != null ? Number(data.diem_toithieu)   : undefined,
        phan_tram_uudai: data.phan_tram_uudai != null ? Number(data.phan_tram_uudai) : undefined,
      },
    });
    res.json(serializeHang(updated));
  } catch (err) { next(err); }
});

router.delete("/tiers/:ten_hang", requireAdmin, async (req, res, next) => {
  try {
    const { ten_hang } = req.params;
    const existing = await prisma.hangThanhVien.findUnique({ where: { ten_hang } });
    if (!existing) return res.status(404).json({ detail: "Hạng thành viên không tồn tại" });

    // Hạ khách hàng về Vô hạng trước khi xóa hạng
    await prisma.khachHang.updateMany({
      where: { ten_hang },
      data:  { ten_hang: "Vô hạng" },
    });
    await prisma.hangThanhVien.delete({ where: { ten_hang } });
    res.json({ message: "Xóa hạng thành viên thành công" });
  } catch (err) { next(err); }
});

// ── REPORTS ───────────────────────────────────────────────────────────────────

// Doanh thu theo hạng khách hàng
router.get("/report/by-tier", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        kh.ten_hang,
        COUNT(hd.ma_hd)               AS so_hoa_don,
        SUM(hd.tong_tien_sau_giam)    AS doanh_thu,
        SUM(hd.giam_gia_hang)         AS tong_giam_hang,
        SUM(hd.giam_gia_voucher)      AS tong_giam_voucher
      FROM hoadon hd
      JOIN khachhang kh ON kh.ma_kh = hd.ma_kh
      GROUP BY kh.ten_hang
      ORDER BY doanh_thu DESC
    `;
    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        ten_hang:          r.ten_hang,
        so_hoa_don:        Number(r.so_hoa_don        || 0),
        doanh_thu:         Number(r.doanh_thu         || 0),
        tong_giam_hang:    Number(r.tong_giam_hang    || 0),
        tong_giam_voucher: Number(r.tong_giam_voucher || 0),
      }))
    );
  } catch (err) { next(err); }
});

// Thống kê sử dụng voucher
router.get("/report/voucher-usage", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        v.ma_voucher,
        v.mo_ta,
        v.phan_tram_giam,
        v.so_luong_phat_hanh,
        v.so_luong_da_dung,
        COUNT(h.ma_hd)          AS so_hd_ap_dung,
        SUM(h.giam_gia_voucher) AS tong_tien_giam
      FROM voucher v
      LEFT JOIN hoadon h ON h.ma_voucher = v.ma_voucher
      GROUP BY v.ma_voucher
      ORDER BY so_hd_ap_dung DESC
    `;
    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        ma_voucher:          r.ma_voucher,
        mo_ta:               r.mo_ta,
        phan_tram_giam:      Number(r.phan_tram_giam      || 0),
        so_luong_phat_hanh:  Number(r.so_luong_phat_hanh  || 0),
        so_luong_da_dung:    Number(r.so_luong_da_dung    || 0),
        so_hd_ap_dung:       Number(r.so_hd_ap_dung       || 0),
        tong_tien_giam:      Number(r.tong_tien_giam       || 0),
      }))
    );
  } catch (err) { next(err); }
});

module.exports = router;
