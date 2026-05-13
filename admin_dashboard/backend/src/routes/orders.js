const { Router } = require("express");
const { Prisma } = require("@prisma/client");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");
const { determineTier } = require("../utils/customerTier");

const router = Router();

function serialize(row) {
  return {
    ma_hd: row.ma_hd,
    ngay_tao: toDateOnlyString(row.ngay_tao),
    tong_tien_truoc_giam: toNumber(row.tong_tien_truoc_giam),
    giam_gia_hang: toNumber(row.giam_gia_hang),
    giam_gia_voucher: toNumber(row.giam_gia_voucher),
    tong_tien_sau_giam: toNumber(row.tong_tien_sau_giam),
    phuong_thuc_thanh_toan: row.phuong_thuc_thanh_toan,
    trang_thai: row.trang_thai,
    ma_kh: row.ma_kh,
    ma_nv: row.ma_nv,
    ma_voucher: row.ma_voucher,
    chitiet: (row.chitiet || []).map((c) => ({
      ma_sku: c.ma_sku,
      so_luong: c.so_luong,
      gia_ban: toNumber(c.gia_ban),
      thanh_tien: toNumber(c.thanh_tien),
    })),
  };
}

// GET /orders/:ma_hd
router.get("/:ma_hd", async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const row = await prisma.hoaDon.findUnique({
      where: { ma_hd },
      include: { chitiet: true },
    });
    if (!row) return res.status(404).json({ detail: "Hóa đơn không tồn tại" });
    res.json(serialize(row));
  } catch (err) {
    next(err);
  }
});

// GET /orders
router.get("/", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.hoaDon.findMany({
      skip,
      take,
      orderBy: { ma_hd: "desc" },
      include: { chitiet: true },
    });
    res.json(rows.map(serialize));
  } catch (err) {
    next(err);
  }
});

// POST /orders
router.post("/", checkRole("admin", "cashier"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const items = Array.isArray(data.items) ? data.items : [];
    if (items.length === 0) {
      return res.status(400).json({ detail: "Đơn hàng phải có ít nhất một sản phẩm" });
    }

    const ma_hd = String(data.ma_hd || `HD-${Date.now()}`);
    const ngay_tao = new Date(data.ngay_tao || Date.now());
    const ma_kh = String(data.ma_kh);
    const ma_nv = req.user.ma_nv;
    const ma_voucher = data.ma_voucher ? String(data.ma_voucher) : null;

    const result = await prisma.$transaction(async (tx) => {
      let tong_tien_truoc_giam = 0;
      const orderDetails = [];

      for (const item of items) {
        const sku = await tx.bienTheSKU.findUnique({
          where: { ma_sku: item.ma_sku },
          include: { sanpham: true },
        });

        if (!sku) throw new Error(`SKU ${item.ma_sku} không tồn tại`);
        if (sku.so_luong_ton < item.so_luong) {
          throw new Error(`Sản phẩm ${sku.sanpham.ten_sp} (${sku.mau_sac}, ${sku.kich_co}) không đủ hàng (Tồn: ${sku.so_luong_ton})`);
        }

        const thanh_tien = toNumber(sku.gia_ban) * Number(item.so_luong);
        tong_tien_truoc_giam += thanh_tien;

        orderDetails.push({
          ma_sku: item.ma_sku,
          so_luong: Number(item.so_luong),
          gia_ban: sku.gia_ban,
          thanh_tien: new Prisma.Decimal(String(thanh_tien)),
        });

        await tx.bienTheSKU.update({
          where: { ma_sku: item.ma_sku },
          data: { so_luong_ton: { decrement: Number(item.so_luong) } },
        });
      }

      let giam_gia_voucher = 0;
      if (ma_voucher) {
        const voucher = await tx.voucher.findUnique({ where: { ma_voucher } });
        if (!voucher) throw new Error("Mã giảm giá không tồn tại");
        
        const now = new Date();
        if (now < voucher.ngay_bat_dau || now > voucher.ngay_het_han) {
          throw new Error("Mã giảm giá đã hết hạn hoặc chưa đến thời gian sử dụng");
        }
        if (voucher.so_luong_da_dung >= voucher.so_luong_phat_hanh) {
          throw new Error("Mã giảm giá đã hết lượt sử dụng");
        }
        if (tong_tien_truoc_giam < toNumber(voucher.gia_tri_don_toithieu)) {
          throw new Error(`Đơn hàng tối thiểu ${toNumber(voucher.gia_tri_don_toithieu)} để sử dụng voucher này`);
        }

        giam_gia_voucher = (tong_tien_truoc_giam * voucher.phan_tram_giam) / 100;
        if (toNumber(voucher.so_tien_giam_toida) > 0 && giam_gia_voucher > toNumber(voucher.so_tien_giam_toida)) {
          giam_gia_voucher = toNumber(voucher.so_tien_giam_toida);
        }

        await tx.voucher.update({
          where: { ma_voucher },
          data: { so_luong_da_dung: { increment: 1 } },
        });
      }

      let giam_gia_hang = 0;
      const kh = await tx.khachHang.findUnique({
        where: { ma_kh },
        include: { hangthanhvien: true },
      });
      if (kh && kh.hangthanhvien) {
        giam_gia_hang = (tong_tien_truoc_giam * kh.hangthanhvien.phan_tram_uudai) / 100;
      }

      const tong_tien_sau_giam = tong_tien_truoc_giam - giam_gia_voucher - giam_gia_hang;

      const hoaDon = await tx.hoaDon.create({
        data: {
          ma_hd,
          ngay_tao,
          tong_tien_truoc_giam: new Prisma.Decimal(String(tong_tien_truoc_giam)),
          giam_gia_hang: new Prisma.Decimal(String(giam_gia_hang)),
          giam_gia_voucher: new Prisma.Decimal(String(giam_gia_voucher)),
          tong_tien_sau_giam: new Prisma.Decimal(String(tong_tien_sau_giam)),
          phuong_thuc_thanh_toan: data.phuong_thuc_thanh_toan || "Tiền mặt",
          trang_thai: data.trang_thai || "Hoàn thành",
          ma_kh,
          ma_nv,
          ma_voucher,
          chitiet: {
            create: orderDetails,
          },
        },
        include: { chitiet: true },
      });

      // Update points and recalculate tier
      const newPoints = kh.diem_tich_luy + Math.floor(tong_tien_sau_giam / 10000);
      const newTier = await determineTier(newPoints, tx);

      await tx.khachHang.update({
        where: { ma_kh },
        data: { 
          diem_tich_luy: newPoints,
          ten_hang: newTier
        },
      });

      return hoaDon;
    });

    res.status(201).json(serialize(result));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    if (err && typeof err.message === "string") {
      return res.status(400).json({ detail: err.message });
    }
    next(err);
  }
});

// DELETE /orders/:ma_hd - Restricted to Admin
router.delete("/:ma_hd", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const existing = await prisma.hoaDon.findUnique({
      where: { ma_hd },
      include: { chitiet: true, voucher: true },
    });
    if (!existing) return res.status(404).json({ detail: "Hóa đơn không tồn tại" });

    await prisma.$transaction(async (tx) => {
      for (const item of existing.chitiet) {
        await tx.bienTheSKU.update({
          where: { ma_sku: item.ma_sku },
          data: { so_luong_ton: { increment: item.so_luong } },
        });
      }

      if (existing.ma_voucher) {
        await tx.voucher.update({
          where: { ma_voucher: existing.ma_voucher },
          data: { so_luong_da_dung: { decrement: 1 } },
        });
      }

      // Revert points and recalculate tier
      const kh = await tx.khachHang.findUnique({ where: { ma_kh: existing.ma_kh } });
      if (kh) {
        const revertedPoints = Math.max(0, kh.diem_tich_luy - Math.floor(toNumber(existing.tong_tien_sau_giam) / 10000));
        const revertedTier = await determineTier(revertedPoints, tx);
        await tx.khachHang.update({
          where: { ma_kh: existing.ma_kh },
          data: { 
            diem_tich_luy: revertedPoints,
            ten_hang: revertedTier
          }
        });
      }

      await tx.chiTietHoaDon.deleteMany({ where: { ma_hd } });
      await tx.hoaDon.delete({ where: { ma_hd } });
    });

    res.json({ message: "Xóa hóa đơn và hoàn tồn kho thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
