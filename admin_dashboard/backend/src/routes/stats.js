const { Router } = require("express");
const { prisma } = require("../db/prisma");
const { toNumber } = require("../utils/serialize");

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const [totalProducts, totalOrders, totalCustomers] = await Promise.all([
      prisma.sanPham.count(),
      prisma.hoaDon.count(),
      prisma.khachHang.count(),
    ]);

    const [sales, purchases] = await Promise.all([
      prisma.hoaDon.findMany({ select: { tong_tien: true } }),
      prisma.phieuNhap.findMany({ select: { tong_tien: true } }),
    ]);

    const salesRevenue  = sales.reduce((sum, r) => sum + (toNumber(r.tong_tien) || 0), 0);
    const purchaseCost  = purchases.reduce((sum, r) => sum + (toNumber(r.tong_tien) || 0), 0);
    const netProfit     = salesRevenue - purchaseCost;

    res.json({
      total_revenue:   salesRevenue,
      total_orders:    totalOrders,
      total_products:  totalProducts,
      total_customers: totalCustomers,
      sales_revenue:   salesRevenue,
      purchase_cost:   purchaseCost,
      net_profit:      netProfit,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
