const express = require("express");
const { prisma } = require("../db/prisma");
const { requireAdmin } = require("../middleware/adminAuth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ ok: true, version: "v1" });
});

function serializeKhachHang(row) {
  return {
    ma_kh: row.ma_kh,
    ho_ten_kh: row.ho_ten_kh,
    dia_chi: row.dia_chi,
    sdt: row.sdt,
    email: row.email,
    diem_tich_luy: row.diem_tich_luy ?? 0,
    hang_thanh_vien: row.hang_thanh_vien ?? "Thành viên mới",
  };
}

function serializeSanPham(row) {
  return {
    ma_sp: row.ma_sp,
    ten_sp: row.ten_sp,
    danh_muc: row.danh_muc,
    chat_lieu: row.chat_lieu,
    mua_vu: row.mua_vu,
    gioi_tinh: row.gioi_tinh,
    ma_ncc: row.ma_ncc,
  };
}

function serializeHoaDon(row) {
  return {
    ma_hd: row.ma_hd,
    ngay_tao: toDateOnlyString(row.ngay_tao),
    tong_tien: toNumber(row.tong_tien),
    phuong_thuc_thanh_toan: row.phuong_thuc_thanh_toan,
    trang_thai: row.trang_thai,
    ma_kh: row.ma_kh,
    ma_nv: row.ma_nv,
  };
}

function serializeNhanVien(row) {
  return {
    ma_nv: row.ma_nv,
    ho_ten_nv: row.ho_ten_nv,
    ngay_sinh: toDateOnlyString(row.ngay_sinh),
    gioi_tinh: row.gioi_tinh,
    dia_chi: row.dia_chi,
    sdt: row.sdt,
    email: row.email,
    ngay_vao_lam: toDateOnlyString(row.ngay_vao_lam),
    ma_vi_tri: row.ma_vi_tri,
    ma_ch: row.ma_ch,
  };
}

function serializeNhaCungCap(row) {
  return {
    ma_ncc: row.ma_ncc,
    ten_ncc: row.ten_ncc,
    dia_chi: row.dia_chi,
    sdt: row.sdt,
    email: row.email,
  };
}

// ================= STATS =================
router.get("/stats", async (_req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalCustomers] = await Promise.all([
      prisma.bienTheSKU.count(),
      prisma.hoaDon.count(),
      prisma.khachHang.count(),
    ]);

    const [sales, purchases] = await Promise.all([
      prisma.hoaDon.findMany({ select: { tong_tien: true } }),
      prisma.phieuNhap.findMany({ select: { tong_tien: true } }),
    ]);

    const salesRevenue = sales.reduce((sum, r) => sum + (toNumber(r.tong_tien) || 0), 0);
    const purchaseCost = purchases.reduce((sum, r) => sum + (toNumber(r.tong_tien) || 0), 0);
    const netProfit = salesRevenue - purchaseCost;

    res.json({
      total_revenue: salesRevenue,
      total_orders: totalOrders,
      total_products: totalProducts,
      total_customers: totalCustomers,
      sales_revenue: salesRevenue,
      purchase_cost: purchaseCost,
      net_profit: netProfit,
    });
  } catch (err) {
    next(err);
  }
});

// ================= LOGIN =================
router.post("/login", (req, res) => {
  const { username, password } = req.body || {};
  if (username === "admin" && password === "12345") {
    return res.json({
      access_token: "fake-super-secret-token",
      token_type: "bearer",
      success: true,
      message: "Login successful",
    });
  }
  return res.status(401).json({ detail: "Invalid username or password" });
});

// ================= LIST ENDPOINTS =================
router.get("/products", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.sanPham.findMany({ skip, take, orderBy: { ma_sp: "asc" } });
    res.json(rows.map(serializeSanPham));
  } catch (err) {
    next(err);
  }
});

router.get("/customers", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.khachHang.findMany({ skip, take, orderBy: { ma_kh: "asc" } });
    res.json(rows.map(serializeKhachHang));
  } catch (err) {
    next(err);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.hoaDon.findMany({ skip, take, orderBy: { ma_hd: "asc" } });
    res.json(rows.map(serializeHoaDon));
  } catch (err) {
    next(err);
  }
});

router.get("/employees", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.nhanVien.findMany({ skip, take, orderBy: { ma_nv: "asc" } });
    res.json(rows.map(serializeNhanVien));
  } catch (err) {
    next(err);
  }
});

router.get("/suppliers", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const rows = await prisma.nhaCungCap.findMany({ skip, take, orderBy: { ma_ncc: "asc" } });
    res.json(rows.map(serializeNhaCungCap));
  } catch (err) {
    next(err);
  }
});

// ================= REPORTS =================
router.get("/report/category-sales", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        sp.danh_muc AS category,
        SUM(ct.so_luong) AS quantity,
        SUM(ct.so_luong * ct.gia_ban) AS revenue
      FROM chitiethoadon ct
      JOIN bienthesku sku ON sku.ma_sku = ct.ma_sku
      JOIN sanpham sp ON sp.ma_sp = sku.ma_sp
      GROUP BY sp.danh_muc
    `;

    const result = Array.isArray(rows) ? rows : [];
    res.json(
      result.map((r) => ({
        category: r.category,
        quantity: Number(r.quantity || 0),
        revenue: Number(r.revenue || 0),
      })),
    );
  } catch (err) {
    next(err);
  }
});

router.get("/report/purchase-monthly", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN typeof(ngay_nhap) = 'integer' THEN strftime('%Y-%m', datetime(ngay_nhap / 1000, 'unixepoch'))
          ELSE strftime('%Y-%m', ngay_nhap)
        END AS month,
        SUM(tong_tien) AS cost
      FROM phieunhap
      GROUP BY month
      ORDER BY month
    `;

    const result = Array.isArray(rows) ? rows : [];
    res.json(
      result.map((r) => ({
        month: r.month,
        cost: Number(r.cost || 0),
      })),
    );
  } catch (err) {
    next(err);
  }
});

// ================= CRUD PRODUCTS =================
router.post("/products", requireAdmin, async (req, res, next) => {
  try {
    const data = req.body || {};
    const created = await prisma.SanPham.create({
      data: {
        ma_sp: String(data.ma_sp),
        ten_sp: String(data.ten_sp),
        danh_muc: String(data.danh_muc),
        chat_lieu: String(data.chat_lieu),
        mua_vu: String(data.mua_vu),
        gioi_tinh: String(data.gioi_tinh),
        ma_ncc: String(data.ma_ncc),
      },
    });
    res.json(serializeSanPham(created));
  } catch (err) {
    // Mirror FastAPI style: 400 with detail
    res.status(400).json({ detail: String(err.message || err) });
  }
});

router.put("/products/:ma_sp", requireAdmin, async (req, res, next) => {
  try {
    const ma_sp = String(req.params.ma_sp);
    const existing = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!existing) return res.status(404).json({ detail: "Product not found" });

    const data = req.body || {};
    const updated = await prisma.sanPham.update({
      where: { ma_sp },
      data: {
        ten_sp: String(data.ten_sp),
        danh_muc: String(data.danh_muc),
        chat_lieu: String(data.chat_lieu),
        mua_vu: String(data.mua_vu),
        gioi_tinh: String(data.gioi_tinh),
        ma_ncc: String(data.ma_ncc),
      },
    });
    res.json(serializeSanPham(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/products/:ma_sp", requireAdmin, async (req, res, next) => {
  try {
    const ma_sp = String(req.params.ma_sp);
    const existing = await prisma.sanPham.findUnique({ where: { ma_sp } });
    if (!existing) return res.status(404).json({ detail: "Product not found" });
    
    // Delete SKU variants and their dependencies first (foreign key constraint)
    const skus = await prisma.bienTheSKU.findMany({ where: { ma_sp } });
    for (const sku of skus) {
      // Delete order details referencing this SKU
      await prisma.chiTietHoaDon.deleteMany({ where: { ma_sku: sku.ma_sku } });
      // Delete import receipt details referencing this SKU
      await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_sku: sku.ma_sku } });
    }
    // Then delete the SKU variants themselves
    await prisma.bienTheSKU.deleteMany({ where: { ma_sp } });
    
    // Finally delete the product
    await prisma.sanPham.delete({ where: { ma_sp } });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ================= CRUD CUSTOMERS =================
router.post("/customers", requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.khachHang.create({
      data: {
        ma_kh: String(data.ma_kh),
        ho_ten_kh: String(data.ho_ten_kh),
        dia_chi: String(data.dia_chi),
        sdt: String(data.sdt),
        email: String(data.email),
        diem_tich_luy: Number(data.diem_tich_luy || 0),
        hang_thanh_vien: data.hang_thanh_vien ? String(data.hang_thanh_vien) : undefined,
      },
    });
    res.json(serializeKhachHang(created));
  } catch (_err) {
    res.status(400).json({ detail: "Cannot create customer" });
  }
});

router.put("/customers/:ma_kh", requireAdmin, async (req, res, next) => {
  try {
    const ma_kh = String(req.params.ma_kh);
    const existing = await prisma.khachHang.findUnique({ where: { ma_kh } });
    if (!existing) return res.status(404).json({ detail: "Customer not found" });

    const data = req.body || {};
    const updated = await prisma.khachHang.update({
      where: { ma_kh },
      data: {
        ho_ten_kh: String(data.ho_ten_kh),
        dia_chi: String(data.dia_chi),
        sdt: String(data.sdt),
        email: String(data.email),
        diem_tich_luy: Number(data.diem_tich_luy || 0),
        hang_thanh_vien: data.hang_thanh_vien ? String(data.hang_thanh_vien) : undefined,
      },
    });
    res.json(serializeKhachHang(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/customers/:ma_kh", requireAdmin, async (req, res, next) => {
  try {
    const ma_kh = String(req.params.ma_kh);
    const existing = await prisma.khachHang.findUnique({ where: { ma_kh } });
    if (!existing) return res.status(404).json({ detail: "Customer not found" });
    
    // Delete related orders first (foreign key constraint)
    const orders = await prisma.hoaDon.findMany({ where: { ma_kh } });
    for (const order of orders) {
      await prisma.chiTietHoaDon.deleteMany({ where: { ma_hd: order.ma_hd } });
    }
    await prisma.hoaDon.deleteMany({ where: { ma_kh } });
    
    // Then delete the customer
    await prisma.khachHang.delete({ where: { ma_kh } });
    res.json({ message: "Customer deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ================= CRUD ORDERS =================
router.post("/orders", requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.hoaDon.create({
      data: {
        ma_hd: String(data.ma_hd),
        ngay_tao: toDateOnlyString(data.ngay_tao),
        tong_tien: data.tong_tien,
        phuong_thuc_thanh_toan: String(data.phuong_thuc_thanh_toan),
        trang_thai: String(data.trang_thai),
        ma_kh: String(data.ma_kh),
        ma_nv: String(data.ma_nv),
      },
    });
    res.json(serializeHoaDon(created));
  } catch (_err) {
    res.status(400).json({ detail: "Cannot create order" });
  }
});

// Note: FastAPI version didn't implement PUT for orders, but the frontend uses it.
router.put("/orders/:ma_hd", requireAdmin, async (req, res, next) => {
  try {
    const ma_hd = String(req.params.ma_hd);
    const existing = await prisma.hoaDon.findUnique({ where: { ma_hd } });
    if (!existing) return res.status(404).json({ detail: "Order not found" });

    const data = req.body || {};
    const updated = await prisma.hoaDon.update({
      where: { ma_hd },
      data: {
        ngay_tao: data.ngay_tao ? toDateOnlyString(data.ngay_tao) : undefined,
        tong_tien: data.tong_tien != null ? data.tong_tien : undefined,
        phuong_thuc_thanh_toan: data.phuong_thuc_thanh_toan ? String(data.phuong_thuc_thanh_toan) : undefined,
        trang_thai: data.trang_thai ? String(data.trang_thai) : undefined,
        ma_kh: data.ma_kh ? String(data.ma_kh) : undefined,
        ma_nv: data.ma_nv ? String(data.ma_nv) : undefined,
      },
    });
    res.json(serializeHoaDon(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/orders/:ma_hd", requireAdmin, async (req, res, next) => {
  try {
    const ma_hd = String(req.params.ma_hd);
    const existing = await prisma.hoaDon.findUnique({ where: { ma_hd } });
    if (!existing) return res.status(404).json({ detail: "Order not found" });
    
    // Delete related order details first (foreign key constraint)
    await prisma.chiTietHoaDon.deleteMany({ where: { ma_hd } });
    
    // Then delete the order
    await prisma.hoaDon.delete({ where: { ma_hd } });
    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ================= CRUD EMPLOYEES =================
router.post("/employees", requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.nhanVien.create({
      data: {
        ma_nv: String(data.ma_nv),
        ho_ten_nv: String(data.ho_ten_nv),
        ngay_sinh: toDateOnlyString(data.ngay_sinh),
        gioi_tinh: String(data.gioi_tinh),
        dia_chi: String(data.dia_chi),
        sdt: String(data.sdt),
        email: String(data.email),
        ngay_vao_lam: toDateOnlyString(data.ngay_vao_lam),
        ma_vi_tri: String(data.ma_vi_tri),
        ma_ch: String(data.ma_ch),
      },
    });
    res.json(serializeNhanVien(created));
  } catch (err) {
    res.status(400).json({ detail: String(err.message || err) });
  }
});

// Note: FastAPI version didn't implement PUT for employees, but the frontend uses it.
router.put("/employees/:ma_nv", requireAdmin, async (req, res, next) => {
  try {
    const ma_nv = String(req.params.ma_nv);
    const existing = await prisma.nhanVien.findUnique({ where: { ma_nv } });
    if (!existing) return res.status(404).json({ detail: "Employee not found" });

    const data = req.body || {};
    const updated = await prisma.nhanVien.update({
      where: { ma_nv },
      data: {
        ho_ten_nv: data.ho_ten_nv ? String(data.ho_ten_nv) : undefined,
        ngay_sinh: data.ngay_sinh ? toDateOnlyString(data.ngay_sinh) : undefined,
        gioi_tinh: data.gioi_tinh ? String(data.gioi_tinh) : undefined,
        dia_chi: data.dia_chi ? String(data.dia_chi) : undefined,
        sdt: data.sdt ? String(data.sdt) : undefined,
        email: data.email ? String(data.email) : undefined,
        ngay_vao_lam: data.ngay_vao_lam ? toDateOnlyString(data.ngay_vao_lam) : undefined,
        ma_vi_tri: data.ma_vi_tri ? String(data.ma_vi_tri) : undefined,
        ma_ch: data.ma_ch ? String(data.ma_ch) : undefined,
      },
    });
    res.json(serializeNhanVien(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/employees/:ma_nv", requireAdmin, async (req, res, next) => {
  try {
    const ma_nv = String(req.params.ma_nv);
    const existing = await prisma.nhanVien.findUnique({ where: { ma_nv } });
    if (!existing) return res.status(404).json({ detail: "Employee not found" });
    
    // Delete related orders and their details first (foreign key constraint)
    const orders = await prisma.hoaDon.findMany({ where: { ma_nv } });
    for (const order of orders) {
      await prisma.chiTietHoaDon.deleteMany({ where: { ma_hd: order.ma_hd } });
    }
    await prisma.hoaDon.deleteMany({ where: { ma_nv } });
    
    // Delete import receipts and their details
    const imports = await prisma.phieuNhap.findMany({ where: { ma_nv } });
    for (const importDoc of imports) {
      await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_pn: importDoc.ma_pn } });
    }
    await prisma.phieuNhap.deleteMany({ where: { ma_nv } });
    
    // Then delete the employee
    await prisma.nhanVien.delete({ where: { ma_nv } });
    res.json({ message: "Employee deleted" });
  } catch (err) {
    next(err);
  }
});

// ================= CRUD SUPPLIERS =================
router.post("/suppliers", requireAdmin, async (req, res) => {
  try {
    const data = req.body || {};
    const created = await prisma.nhaCungCap.create({
      data: {
        ma_ncc: String(data.ma_ncc),
        ten_ncc: String(data.ten_ncc),
        dia_chi: String(data.dia_chi),
        sdt: String(data.sdt),
        email: String(data.email),
      },
    });
    res.json(serializeNhaCungCap(created));
  } catch (err) {
    res.status(400).json({ detail: String(err.message || err) });
  }
});

// Note: FastAPI version didn't implement PUT for suppliers, but the frontend uses it.
router.put("/suppliers/:ma_ncc", requireAdmin, async (req, res, next) => {
  try {
    const ma_ncc = String(req.params.ma_ncc);
    const existing = await prisma.nhaCungCap.findUnique({ where: { ma_ncc } });
    if (!existing) return res.status(404).json({ detail: "Supplier not found" });

    const data = req.body || {};
    const updated = await prisma.nhaCungCap.update({
      where: { ma_ncc },
      data: {
        ten_ncc: data.ten_ncc ? String(data.ten_ncc) : undefined,
        dia_chi: data.dia_chi ? String(data.dia_chi) : undefined,
        sdt: data.sdt ? String(data.sdt) : undefined,
        email: data.email ? String(data.email) : undefined,
      },
    });
    res.json(serializeNhaCungCap(updated));
  } catch (err) {
    next(err);
  }
});

router.delete("/suppliers/:ma_ncc", requireAdmin, async (req, res, next) => {
  try {
    const ma_ncc = String(req.params.ma_ncc);
    const existing = await prisma.nhaCungCap.findUnique({ where: { ma_ncc } });
    if (!existing) return res.status(404).json({ detail: "Supplier not found" });
    
    // Delete related products first (foreign key constraint)
    const products = await prisma.sanPham.findMany({ where: { ma_ncc } });
    for (const product of products) {
      // Delete SKU variants for this product
      const skus = await prisma.bienTheSKU.findMany({ where: { ma_sp: product.ma_sp } });
      for (const sku of skus) {
        // Delete order details referencing this SKU
        await prisma.chiTietHoaDon.deleteMany({ where: { ma_sku: sku.ma_sku } });
        // Delete import receipt details referencing this SKU
        await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_sku: sku.ma_sku } });
      }
      await prisma.bienTheSKU.deleteMany({ where: { ma_sp: product.ma_sp } });
    }
    await prisma.sanPham.deleteMany({ where: { ma_ncc } });
    
    // Delete import receipts and their details
    const imports = await prisma.phieuNhap.findMany({ where: { ma_ncc } });
    for (const importDoc of imports) {
      await prisma.chiTietPhieuNhap.deleteMany({ where: { ma_pn: importDoc.ma_pn } });
    }
    await prisma.phieuNhap.deleteMany({ where: { ma_ncc } });
    
    // Then delete the supplier
    await prisma.nhaCungCap.delete({ where: { ma_ncc } });
    res.json({ message: "Supplier deleted" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

