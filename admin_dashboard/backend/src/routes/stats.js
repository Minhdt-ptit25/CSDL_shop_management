const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { toNumber } = require("../utils/serialize");

const router = Router();

// GET /stats/low-stock
router.get("/low-stock", async (req, res, next) => {
  try {
    const threshold = Number(req.query.threshold || 10);
    const skus = await prisma.bienTheSKU.findMany({
      where: { so_luong_ton: { lt: threshold } },
      include: { sanpham: true },
      orderBy: { so_luong_ton: "asc" },
    });

    const result = skus.map((sku) => ({
      ma_sku: sku.ma_sku,
      ten_sp: sku.sanpham.ten_sp,
      mau_sac: sku.mau_sac,
      kich_co: sku.kich_co,
      so_luong_ton: sku.so_luong_ton,
      gia_ban: toNumber(sku.gia_ban),
    }));

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /stats/summary OR GET /stats
router.get(["/", "/summary"], async (req, res, next) => {
  try {
    const [totalOrders, totalRevenue, totalCustomers, totalProducts, lowStockCount] = await Promise.all([
      prisma.hoaDon.count(),
      prisma.hoaDon.aggregate({ _sum: { tong_tien_sau_giam: true } }),
      prisma.khachHang.count(),
      prisma.sanPham.count(),
      prisma.bienTheSKU.count({ where: { so_luong_ton: { lt: 10 } } }),
    ]);

    res.json({
      total_orders: totalOrders,
      total_revenue: toNumber(totalRevenue._sum.tong_tien_sau_giam || 0),
      total_customers: totalCustomers,
      total_products: totalProducts,
      low_stock_count: lowStockCount,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
