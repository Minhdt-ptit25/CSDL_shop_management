const { Router } = require("express");
const { prisma } = require("../db/prisma");

const router = Router();

// Doanh thu theo danh mục sản phẩm
router.get("/category-sales", async (_req, res, next) => {
  try {
    const rows = await prisma.$queryRaw`
      SELECT DATE_FORMAT(ngay_tao, '%Y-%m') AS month,
            SUM(tong_tien_sau_giam) AS revenue
      FROM hoadon
      GROUP BY month
      ORDER BY month
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
        DATE_FORMAT(ngay_tao, '%Y') AS year,
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
      SELECT DATE_FORMAT(ngay_nhap, '%Y-%m') AS month,
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
