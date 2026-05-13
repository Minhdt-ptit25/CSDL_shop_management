const { Router } = require("express");
const { prisma } = require("../db/prisma");

const router = Router();

// Doanh thu theo danh mục sản phẩm
router.get("/category-sales", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        sp.danh_muc  AS category,
        SUM(ct.so_luong) AS quantity,
        SUM(ct.so_luong * ct.gia_ban) AS revenue
      FROM chitiethoadon ct
      JOIN bienthesku sku ON sku.ma_sku = ct.ma_sku
      JOIN sanpham    sp  ON sp.ma_sp   = sku.ma_sp
      GROUP BY sp.danh_muc
    `;

    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        category: r.category,
        quantity: Number(r.quantity || 0),
        revenue:  Number(r.revenue  || 0),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Doanh thu theo tháng
router.get("/sales-monthly", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        strftime('%Y-%m', ngay_tao) AS month,
        SUM(tong_tien_sau_giam) AS revenue
      FROM hoadon
      GROUP BY month
      ORDER BY month
    `;

    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        month:   r.month,
        revenue: Number(r.revenue || 0),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Doanh thu theo năm
router.get("/sales-yearly", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        strftime('%Y-%m', ngay_tao) AS year,
        SUM(tong_tien_sau_giam) AS revenue
      FROM hoadon
      GROUP BY year
      ORDER BY year
    `;

    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        year:    r.year,
        revenue: Number(r.revenue || 0),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Top 5 khách hàng theo điểm tích lũy
router.get("/top-customers", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT ma_kh, ho_ten_kh, diem_tich_luy
      FROM khachhang
      ORDER BY diem_tich_luy DESC
      LIMIT 5
    `;

    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        ma_kh:         r.ma_kh,
        ho_ten_kh:     r.ho_ten_kh,
        diem_tich_luy: Number(r.diem_tich_luy || 0),
      }))
    );
  } catch (err) {
    next(err);
  }
});

// Chi phí nhập hàng theo tháng
router.get("/purchase-monthly", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT
        CASE
          WHEN typeof(ngay_nhap) = 'integer'
            THEN strftime('%Y-%m', datetime(ngay_nhap / 1000, 'unixepoch'))
          ELSE strftime('%Y-%m', ngay_nhap)
        END AS month,
        SUM(tong_tien) AS cost
      FROM phieunhap
      GROUP BY month
      ORDER BY month
    `;

    res.json(
      (Array.isArray(rows) ? rows : []).map((r) => ({
        month: r.month,
        cost:  Number(r.cost || 0),
      }))
    );
  } catch (err) {
    next(err);
  }
});

module.exports = router;
