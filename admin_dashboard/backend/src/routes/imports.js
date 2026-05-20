const { Router } = require("express");
const { Prisma } = require("@prisma/client");
const { prisma } = require("../db/prisma");
const { checkRole } = require("../middleware/auth");
const { toDateOnlyString, toNumber } = require("../utils/serialize");
const { isUniqueConstraintError, sendDuplicateError } = require("../utils/prismaHelpers");

const router = Router();

const canImport = checkRole("admin", "warehouse");

function serializeImport(row) {
  return {
    ma_pn: row.ma_pn,
    ngay_nhap: toDateOnlyString(row.ngay_nhap),
    tong_tien: toNumber(row.tong_tien),
    ma_ncc: row.ma_ncc,
    ma_nv: row.ma_nv,
    chitiet: (row.chitiet || []).map((c) => ({
      ma_pn: c.ma_pn,
      ma_sku: c.ma_sku,
      so_luong: c.so_luong,
      gia_nhap: toNumber(c.gia_nhap),
    })),
  };
}

function aggregateItems(items) {
  const map = new Map();
  for (const it of Array.isArray(items) ? items : []) {
    const ma_sku = String(it.ma_sku || "").trim();
    const so_luong = Number(it.so_luong);
    const gia_nhap = Number(it.gia_nhap);
    if (!ma_sku || !Number.isFinite(so_luong) || so_luong <= 0) continue;
    if (!Number.isFinite(gia_nhap) || gia_nhap < 0) continue;
    const prev = map.get(ma_sku);
    if (!prev) {
      map.set(ma_sku, { ma_sku, so_luong, gia_nhap, _sum: gia_nhap * so_luong });
    } else {
      const newQty = prev.so_luong + so_luong;
      const newSum = prev._sum + gia_nhap * so_luong;
      map.set(ma_sku, { ma_sku, so_luong: newQty, gia_nhap: newSum / newQty, _sum: newSum });
    }
  }
  return [...map.values()].map(({ ma_sku, so_luong, gia_nhap }) => ({ ma_sku, so_luong, gia_nhap }));
}

// GET /imports
router.get("/", async (req, res, next) => {
  try {
    const skip = Number(req.query.skip || 0);
    const take = Number(req.query.limit || 100);
    const totalCount = await prisma.phieuNhap.count();
    const rows = await prisma.phieuNhap.findMany({
      skip,
      take,
      orderBy: { ma_pn: "desc" },
      include: { chitiet: true },
    });
    res.set("X-Total-Count", String(totalCount));
    res.json(rows.map(serializeImport));
  } catch (err) {
    next(err);
  }
});

// POST /imports
router.post("/", canImport, async (req, res, next) => {
  try {
    const data = req.body || {};
    const ma_pn = String(data.ma_pn || `PN-${Date.now()}`).trim();
    const ngay_nhap = new Date(data.ngay_nhap || Date.now());
    const ma_ncc = String(data.ma_ncc || "").trim();
    const ma_nv = req.user.ma_nv;

    if (!ma_pn || !ma_ncc || !ma_nv) {
      return res.status(400).json({ detail: "Thiếu ma_pn, ma_ncc hoặc ma_nv" });
    }

    const items = aggregateItems(data.items);
    if (items.length === 0) {
      return res.status(400).json({ detail: "Cần items: [{ ma_sku, so_luong, gia_nhap }]" });
    }

    const created = await prisma.$transaction(async (tx) => {
      const ncc = await tx.nhaCungCap.findUnique({ where: { ma_ncc } });
      if (!ncc) throw new Error("Nhà cung cấp không tồn tại");

      let tong = 0;
      for (const it of items) {
        const sku = await tx.bienTheSKU.findUnique({ where: { ma_sku: it.ma_sku } });
        if (!sku) throw new Error(`SKU ${it.ma_sku} không tồn tại`);
        tong += it.so_luong * it.gia_nhap;
      }

      const phieu = await tx.phieuNhap.create({
        data: {
          ma_pn,
          ngay_nhap,
          tong_tien: new Prisma.Decimal(String(tong)),
          ma_ncc,
          ma_nv,
          chitiet: {
            create: items.map(it => ({
              ma_sku: it.ma_sku,
              so_luong: it.so_luong,
              gia_nhap: new Prisma.Decimal(String(it.gia_nhap)),
            })),
          },
        },
      });

      for (const it of items) {
        await tx.bienTheSKU.update({
          where: { ma_sku: it.ma_sku },
          data: { so_luong_ton: { increment: it.so_luong } },
        });
      }

      return tx.phieuNhap.findUnique({
        where: { ma_pn },
        include: { chitiet: true },
      });
    });

    res.status(201).json(serializeImport(created));
  } catch (err) {
    if (isUniqueConstraintError(err)) return sendDuplicateError(res, err);
    if (err && typeof err.message === "string") {
      return res.status(400).json({ detail: err.message });
    }
    next(err);
  }
});

// DELETE /imports/:ma_pn - Restricted to Admin
router.delete("/:ma_pn", checkRole("admin"), async (req, res, next) => {
  try {
    const { ma_pn } = req.params;
    const existing = await prisma.phieuNhap.findUnique({
      where: { ma_pn },
      include: { chitiet: true },
    });
    if (!existing) return res.status(404).json({ detail: "Phiếu nhập không tồn tại" });

    await prisma.$transaction(async (tx) => {
      // Reverse stock
      for (const item of existing.chitiet) {
        const sku = await tx.bienTheSKU.findUnique({ where: { ma_sku: item.ma_sku } });
        if (!sku) throw new Error(`SKU ${item.ma_sku} không tồn tại`);
        if (sku.so_luong_ton < item.so_luong) {
          throw new Error(`Không thể xóa phiếu nhập ${ma_pn} vì SKU ${item.ma_sku} chỉ còn ${sku.so_luong_ton} trong kho`);
        }
        await tx.bienTheSKU.update({
          where: { ma_sku: item.ma_sku },
          data: { so_luong_ton: { decrement: item.so_luong } },
        });
      }
      await tx.chiTietPhieuNhap.deleteMany({ where: { ma_pn } });
      await tx.phieuNhap.delete({ where: { ma_pn } });
    });

    res.json({ message: "Xóa phiếu nhập và hoàn tồn kho thành công" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
