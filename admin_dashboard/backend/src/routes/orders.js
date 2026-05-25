const { Router } = require("express");
const { Prisma } = require("@prisma/client");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");
const { calcPoints, determineTier } = require("../utils/customerTier");

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
        include: { hang_thanh_vien: true },
      });
      if (kh && kh.hang_thanh_vien) {
        giam_gia_hang = (tong_tien_truoc_giam * kh.hang_thanh_vien.phan_tram_uudai) / 100;
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

      // Quy đổi: 1.000.000 VNĐ = 100 điểm (dùng hàm calcPoints)
      const newPoints = kh.diem_tich_luy + calcPoints(tong_tien_sau_giam);
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

// POST /orders/:ma_hd/delete-request - Cashier request to delete order
router.post("/:ma_hd/delete-request", checkRole("admin", "cashier"), async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const data = req.body || {};
    const ma_nv_cashier = req.user.ma_nv;

    const existing = await prisma.hoaDon.findUnique({ where: { ma_hd } });
    if (!existing) return res.status(404).json({ detail: "Hóa đơn không tồn tại" });

    // Check if request already exists and is pending
    const existingRequest = await prisma.delete_request.findFirst({
      where: { ma_hd, trang_thai: "pending" },
    });
    if (existingRequest) {
      return res.status(400).json({ detail: "Đã có yêu cầu xóa hóa đơn này đang chờ xử lý" });
    }

    const request = await prisma.delete_request.create({
      data: {
        ma_hd,
        ma_nv_cashier,
        ly_do: data.ly_do || null,
      },
    });

    res.status(201).json({
      id: request.id,
      ma_hd: request.ma_hd,
      ma_nv_cashier: request.ma_nv_cashier,
      ly_do: request.ly_do,
      ngay_tao: request.ngay_tao,
      trang_thai: request.trang_thai,
    });
  } catch (err) {
    next(err);
  }
});

// GET /orders/delete-requests - Admin view all delete requests
router.get("/delete-requests/list", checkRole("admin"), async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const trang_thai = req.query.trang_thai || "pending"; // Default to pending

    const requests = await prisma.delete_request.findMany({
      where: trang_thai ? { trang_thai } : {},
      skip,
      take,
      orderBy: { ngay_tao: "desc" },
      include: { 
        hoadon: { include: { nhanvien: true, khachhang: true } },
        nhanvien: { select: { ma_nv: true, ho_ten_nv: true } }
      },
    });

    res.json(requests.map(r => ({
      id: r.id,
      ma_hd: r.ma_hd,
      ma_nv_cashier: r.ma_nv_cashier,
      ten_nv_cashier: r.nhanvien.ho_ten_nv,
      ly_do: r.ly_do,
      ngay_tao: r.ngay_tao,
      trang_thai: r.trang_thai,
      ngay_xu_ly: r.ngay_xu_ly,
      ghi_chu: r.ghi_chu,
      hoadon: r.hoadon ? {
        ma_hd: r.hoadon.ma_hd,
        ngay_tao: toDateOnlyString(r.hoadon.ngay_tao),
        tong_tien_sau_giam: toNumber(r.hoadon.tong_tien_sau_giam),
        ma_nv: r.hoadon.ma_nv,
        ho_ten_nv: r.hoadon.nhanvien.ho_ten_nv,
        ma_kh: r.hoadon.ma_kh,
        ho_ten_kh: r.hoadon.khachhang.ho_ten_kh,
      } : null,
    })));
  } catch (err) {
    next(err);
  }
});

// POST /orders/:ma_hd/confirm-delete - Admin confirm delete order
router.post("/:ma_hd/confirm-delete", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const data = req.body || {};

    const existing = await prisma.hoaDon.findUnique({
      where: { ma_hd },
      include: { chitiet: true, voucher: true },
    });
    if (!existing) return res.status(404).json({ detail: "Hóa đơn không tồn tại" });

    const deleteReq = await prisma.delete_request.findFirst({
      where: { ma_hd, trang_thai: "pending" },
    });

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

      if (deleteReq) {
        await tx.delete_request.update({
          where: { id: deleteReq.id },
          data: {
            trang_thai: "approved",
            ngay_xu_ly: new Date(),
            ghi_chu: data.ghi_chu || null,
          },
        });
      }
    });

    res.json({ message: "Xóa hóa đơn và hoàn tồn kho thành công" });
  } catch (err) {
    next(err);
  }
});

// POST /orders/:ma_hd/reject-delete - Admin reject delete request
router.post("/:ma_hd/reject-delete", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_hd } = req.params;
    const data = req.body || {};

    const deleteReq = await prisma.delete_request.findFirst({
      where: { ma_hd, trang_thai: "pending" },
    });
    if (!deleteReq) {
      return res.status(404).json({ detail: "Không tìm thấy yêu cầu xóa hóa đơn đang chờ xử lý" });
    }

    await prisma.delete_request.update({
      where: { id: deleteReq.id },
      data: {
        trang_thai: "rejected",
        ngay_xu_ly: new Date(),
        ghi_chu: data.ghi_chu || "Từ chối",
      },
    });

    res.json({ message: "Yêu cầu xóa hóa đơn đã bị từ chối" });
  } catch (err) {
    next(err);
  }
});

// DELETE /orders/:ma_hd - Admin can delete directly
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

// =========================================================================
// YÊU CẦU XÓA SẢN PHẨM TRONG GIỎ HÀNG (CASHIER -> ADMIN)
// =========================================================================

// POST /orders/cart/delete-request - Cashier request to remove item from cart
router.post("/cart/delete-request", checkRole("admin", "cashier"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const ma_nv_cashier = req.user.ma_nv;
    const { ma_sku, ly_do } = data;

    if (!ma_sku) return res.status(400).json({ detail: "Vui lòng cung cấp mã SKU cần xóa" });

    const request = await prisma.cart_item_delete_request.create({
      data: {
        ma_nv_cashier,
        ma_sku,
        ly_do: ly_do || null,
      },
    });

    res.status(201).json({ id: request.id, ma_sku, trang_thai: request.trang_thai });
  } catch (err) {
    next(err);
  }
});

// GET /orders/cart/delete-requests/status/:id - Cashier polls status
router.get("/cart/delete-requests/status/:id", checkRole("admin", "cashier"), async (req, res, next) => {
  try {
    const request = await prisma.cart_item_delete_request.findUnique({
      where: { id: req.params.id },
    });
    if (!request) return res.status(404).json({ detail: "Yêu cầu không tồn tại" });
    
    res.json({ id: request.id, trang_thai: request.trang_thai });
  } catch (err) {
    next(err);
  }
});

// GET /orders/cart/delete-requests/list - Admin view pending requests
router.get("/cart/delete-requests/list", checkRole("admin"), async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const trang_thai = req.query.trang_thai || "pending";

    const requests = await prisma.cart_item_delete_request.findMany({
      where: trang_thai ? { trang_thai } : {},
      skip,
      take,
      orderBy: { ngay_tao: "desc" },
      include: { 
        nhanvien: { select: { ma_nv: true, ho_ten_nv: true } }
      },
    });

    res.json(requests.map(r => ({
      id: r.id,
      ma_sku: r.ma_sku,
      ma_nv_cashier: r.ma_nv_cashier,
      ten_nv_cashier: r.nhanvien.ho_ten_nv,
      ly_do: r.ly_do,
      ngay_tao: r.ngay_tao,
      trang_thai: r.trang_thai,
      ngay_xu_ly: r.ngay_xu_ly
    })));
  } catch (err) {
    next(err);
  }
});

// POST /orders/cart/delete-requests/:id/approve - Admin approve
router.post("/cart/delete-requests/:id/approve", checkRole("admin"), async (req, res, next) => {
  try {
    const request = await prisma.cart_item_delete_request.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ detail: "Yêu cầu không tồn tại" });
    if (request.trang_thai !== "pending") return res.status(400).json({ detail: "Yêu cầu này đã được xử lý" });

    await prisma.cart_item_delete_request.update({
      where: { id: req.params.id },
      data: { trang_thai: "approved", ngay_xu_ly: new Date() }
    });

    res.json({ message: "Đã duyệt yêu cầu xóa" });
  } catch (err) {
    next(err);
  }
});

// POST /orders/cart/delete-requests/:id/reject - Admin reject
router.post("/cart/delete-requests/:id/reject", checkRole("admin"), async (req, res, next) => {
  try {
    const request = await prisma.cart_item_delete_request.findUnique({ where: { id: req.params.id } });
    if (!request) return res.status(404).json({ detail: "Yêu cầu không tồn tại" });
    if (request.trang_thai !== "pending") return res.status(400).json({ detail: "Yêu cầu này đã được xử lý" });

    await prisma.cart_item_delete_request.update({
      where: { id: req.params.id },
      data: { trang_thai: "rejected", ngay_xu_ly: new Date() }
    });

    res.json({ message: "Đã từ chối yêu cầu xóa" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
