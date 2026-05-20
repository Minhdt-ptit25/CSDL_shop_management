const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

function serialize(row) {
  const so_luong_du = (row.bienthes || []).reduce((sum, b) => sum + b.so_luong_ton, 0);
  return {
    ma_sp:      row.ma_sp,
    ten_sp:     row.ten_sp,
    danh_muc:   row.danh_muc,
    chat_lieu:  row.chat_lieu,
    gioi_tinh:  row.gioi_tinh,
    ma_ncc:     row.ma_ncc,
    so_luong_du: so_luong_du,
    bienthes: (row.bienthes || []).map(b => ({
      ma_sku:       b.ma_sku,
      mau_sac:      b.mau_sac,
      kich_co:      b.kich_co,
      gia_ban:      Number(b.gia_ban),
      so_luong_ton: b.so_luong_ton,
    })),
  };
}

// GET /products/:ma_sp
router.get("/:ma_sp", async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const row = await prisma.sanPham.findUnique({ 
      where: { ma_sp },
      include: { bienthes: true }
    });
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
      const totalCount = await prisma.sanPham.count();
      const rows = await prisma.sanPham.findMany({ 
        skip, take, 
        orderBy: { ma_sp: "asc" },
        include: { bienthes: true }
      });
      res.set("X-Total-Count", String(totalCount));

// POST /products
router.post("/", checkRole("admin", "warehouse"), async (req, res, next) => {
  try {
    const data = req.body || {};
    const skus = Array.isArray(data.bienthes) ? data.bienthes : [];

    const created = await prisma.$transaction(async (tx) => {
      const sp = await tx.sanPham.create({
        data: {
          ma_sp:     String(data.ma_sp),
          ten_sp:    String(data.ten_sp),
          danh_muc:  String(data.danh_muc),
          chat_lieu: String(data.chat_lieu),
          gioi_tinh: String(data.gioi_tinh),
          ma_ncc:    String(data.ma_ncc),
        },
      });

      for (const sku of skus) {
        if (!sku.ma_sku || !sku.mau_sac || !sku.kich_co || sku.gia_ban == null) continue;
        await tx.bienTheSKU.create({
          data: {
            ma_sku:       String(sku.ma_sku),
            ma_sp:        sp.ma_sp,
            mau_sac:      String(sku.mau_sac),
            kich_co:      String(sku.kich_co),
            gia_ban:      Number(sku.gia_ban),
            so_luong_ton: Number(sku.so_luong_ton || 0),
          },
        });
      }

      return tx.sanPham.findUnique({ where: { ma_sp: sp.ma_sp }, include: { bienthes: true } });
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
    if (!existing) return res.status(404).json({ detail: "S\u1ea3n ph\u1ea9m kh\u00f4ng t\u1ed3n t\u1ea1i" });

    const data = req.body || {};
    const skus = Array.isArray(data.bienthes) ? data.bienthes : [];

    const updated = await prisma.$transaction(async (tx) => {
      await tx.sanPham.update({
        where: { ma_sp },
        data: {
          ten_sp:    data.ten_sp    ? String(data.ten_sp)    : undefined,
          danh_muc:  data.danh_muc  ? String(data.danh_muc)  : undefined,
          chat_lieu: data.chat_lieu ? String(data.chat_lieu) : undefined,
          gioi_tinh: data.gioi_tinh ? String(data.gioi_tinh) : undefined,
          ma_ncc:    data.ma_ncc    ? String(data.ma_ncc)    : undefined,
        },
      });

      // Upsert từng SKU: tạo mới nếu chưa có, cập nhật nếu đã tồn tại
      for (const sku of skus) {
        if (!sku.ma_sku || !sku.mau_sac || !sku.kich_co || sku.gia_ban == null) continue;
        await tx.bienTheSKU.upsert({
          where: { ma_sku: String(sku.ma_sku) },
          update: {
            mau_sac:      String(sku.mau_sac),
            kich_co:      String(sku.kich_co),
            gia_ban:      Number(sku.gia_ban),
            so_luong_ton: Number(sku.so_luong_ton ?? 0),
          },
          create: {
            ma_sku:       String(sku.ma_sku),
            ma_sp,
            mau_sac:      String(sku.mau_sac),
            kich_co:      String(sku.kich_co),
            gia_ban:      Number(sku.gia_ban),
            so_luong_ton: Number(sku.so_luong_ton ?? 0),
          },
        });
      }

      return tx.sanPham.findUnique({ where: { ma_sp }, include: { bienthes: true } });
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

// POST /products/:ma_sp/delete-request
router.post("/:ma_sp/delete-request", checkRole("admin", "warehouse"), async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const data = req.body || {};
    const ma_nv_warehouse = req.user.ma_nv;

    const existing = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!existing) return res.status(404).json({ detail: "Sản phẩm không tồn tại" });

    const existingRequest = await prisma.productDeleteRequest.findFirst({
      where: { ma_sp, trang_thai: "pending" },
    });
    if (existingRequest) {
      return res.status(400).json({ detail: "Đã có yêu cầu xóa sản phẩm này đang chờ xử lý" });
    }

    const request = await prisma.productDeleteRequest.create({
      data: {
        ma_sp,
        ma_nv_warehouse,
        ly_do: data.ly_do || null,
      },
    });

    res.status(201).json(request);
  } catch (err) {
    next(err);
  }
});

// GET /products/delete-requests/list
router.get("/delete-requests/list", checkRole("admin"), async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const trang_thai = req.query.trang_thai || "pending";

    const requests = await prisma.productDeleteRequest.findMany({
      where: trang_thai ? { trang_thai } : {},
      skip,
      take,
      orderBy: { ngay_tao: "desc" },
      include: { 
        sanpham: true,
        nhanvien: { select: { ma_nv: true, ho_ten_nv: true } }
      },
    });

    res.json(requests.map(r => ({
      id: r.id,
      ma_sp: r.ma_sp,
      ten_sp: r.sanpham?.ten_sp,
      ma_nv_warehouse: r.ma_nv_warehouse,
      ten_nv_warehouse: r.nhanvien?.ho_ten_nv,
      ly_do: r.ly_do,
      ngay_tao: r.ngay_tao,
      trang_thai: r.trang_thai,
      ngay_xu_ly: r.ngay_xu_ly,
      ghi_chu: r.ghi_chu,
    })));
  } catch (err) {
    next(err);
  }
});

// POST /products/:ma_sp/confirm-delete
router.post("/:ma_sp/confirm-delete", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const data = req.body || {};

    const existing = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!existing) return res.status(404).json({ detail: "Sản phẩm không tồn tại" });

    const deleteReq = await prisma.productDeleteRequest.findFirst({
      where: { ma_sp, trang_thai: "pending" },
    });

    await prisma.$transaction(async (tx) => {
      const skus = await tx.bienTheSKU.findMany({ where: { ma_sp } });
      const skuIds = skus.map((s) => s.ma_sku);

      await tx.chiTietHoaDon.deleteMany({ where: { ma_sku: { in: skuIds } } });
      await tx.chiTietPhieuNhap.deleteMany({ where: { ma_sku: { in: skuIds } } });
      await tx.bienTheSKU.deleteMany({ where: { ma_sp } });
      await tx.sanPham.delete({ where: { ma_sp } });

      if (deleteReq) {
        await tx.productDeleteRequest.update({
          where: { id: deleteReq.id },
          data: {
            trang_thai: "approved",
            ngay_xu_ly: new Date(),
            ghi_chu: data.ghi_chu || null,
          },
        });
      }
    });

    res.json({ message: "Xóa sản phẩm thành công" });
  } catch (err) {
    next(err);
  }
});

// POST /products/:ma_sp/reject-delete
router.post("/:ma_sp/reject-delete", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_sp } = req.params;
    const data = req.body || {};

    const deleteReq = await prisma.productDeleteRequest.findFirst({
      where: { ma_sp, trang_thai: "pending" },
    });
    if (!deleteReq) {
      return res.status(404).json({ detail: "Không tìm thấy yêu cầu xóa sản phẩm đang chờ xử lý" });
    }

    await prisma.productDeleteRequest.update({
      where: { id: deleteReq.id },
      data: {
        trang_thai: "rejected",
        ngay_xu_ly: new Date(),
        ghi_chu: data.ghi_chu || "Từ chối",
      },
    });

    res.json({ message: "Yêu cầu xóa sản phẩm đã bị từ chối" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
