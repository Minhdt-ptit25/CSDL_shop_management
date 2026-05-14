const { Router } = require("express");
const { prisma } = require("../db/prisma");

const router = Router();

// GET /skus/:ma_sku  — Lấy thông tin biến thể SKU (giá bán, màu, kích cỡ, tồn kho)
router.get("/:ma_sku", async (req, res, next) => {
  try {
    const { ma_sku } = req.params;
    const row = await prisma.bienTheSKU.findUnique({
      where: { ma_sku },
      include: { sanpham: { select: { ten_sp: true } } },
    });
    if (!row) return res.status(404).json({ detail: "SKU không tồn tại" });
    res.json({
      ma_sku:       row.ma_sku,
      ma_sp:        row.ma_sp,
      ten_sp:       row.sanpham?.ten_sp,
      mau_sac:      row.mau_sac,
      kich_co:      row.kich_co,
      gia_ban:      Number(row.gia_ban),
      so_luong_ton: row.so_luong_ton,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
