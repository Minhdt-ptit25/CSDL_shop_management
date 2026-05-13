require("dotenv/config");
const { prisma } = require("../src/db/prisma");
const bcrypt = require("bcrypt");

async function seed() {
  console.log("Starting seed...");

  const passwordHash = await bcrypt.hash("12345", 10);

  // 1. Vị trí
  await prisma.viTri.upsert({
    where: { ma_vi_tri: "VT01" },
    update: {},
    create: { ma_vi_tri: "VT01", ten_chuc_vu: "Quản lý (Admin)", luong: "15000000" },
  });
  await prisma.viTri.upsert({
    where: { ma_vi_tri: "VT02" },
    update: {},
    create: { ma_vi_tri: "VT02", ten_chuc_vu: "Thu ngân (Cashier)", luong: "8000000" },
  });
  await prisma.viTri.upsert({
    where: { ma_vi_tri: "VT03" },
    update: {},
    create: { ma_vi_tri: "VT03", ten_chuc_vu: "Nhân viên kho (Storage)", luong: "8500000" },
  });

  // 2. Cửa hàng
  await prisma.cuaHang.upsert({
    where: { ma_ch: "CH01" },
    update: {},
    create: {
      ma_ch: "CH01",
      ten_ch: "Fashion Store Main",
      dia_chi: "123 Cầu Giấy, Hà Nội",
      sdt: "024123456",
      email: "main@fashion.com",
    },
  });

  // 3. Nhân viên
  const employees = [
    {
      ma_nv: "NV01",
      ho_ten_nv: "Admin Manager",
      ngay_sinh: new Date("1990-01-01"),
      gioi_tinh: "Nam",
      dia_chi: "Hà Nội",
      sdt: "0912345678",
      email: "admin@fashion.com",
      ngay_vao_lam: new Date("2020-01-01"),
      ma_vi_tri: "VT01",
      ma_ch: "CH01",
      ten_dang_nhap: "admin",
      mat_khau_hash: passwordHash,
      vai_tro: "admin",
    },
    {
      ma_nv: "NV02",
      ho_ten_nv: "Cashier One",
      ngay_sinh: new Date("1995-05-05"),
      gioi_tinh: "Nữ",
      dia_chi: "Hà Nội",
      sdt: "0922334455",
      email: "cashier@fashion.com",
      ngay_vao_lam: new Date("2021-01-01"),
      ma_vi_tri: "VT02",
      ma_ch: "CH01",
      ten_dang_nhap: "cashier",
      mat_khau_hash: passwordHash,
      vai_tro: "cashier",
    },
    {
      ma_nv: "NV03",
      ho_ten_nv: "Warehouse One",
      ngay_sinh: new Date("1992-10-10"),
      gioi_tinh: "Nam",
      dia_chi: "Hà Nội",
      sdt: "0933445566",
      email: "storage@fashion.com",
      ngay_vao_lam: new Date("2022-01-01"),
      ma_vi_tri: "VT03",
      ma_ch: "CH01",
      ten_dang_nhap: "storage",
      mat_khau_hash: passwordHash,
      vai_tro: "warehouse",
    },
  ];

  for (const emp of employees) {
    await prisma.nhanVien.upsert({
      where: { ma_nv: emp.ma_nv },
      update: emp,
      create: emp,
    });
  }

  // 4. Nhà cung cấp
  await prisma.nhaCungCap.upsert({
    where: { ma_ncc: "NCC01" },
    update: {},
    create: {
      ma_ncc: "NCC01",
      ten_ncc: "Xưởng may Hà Nội",
      sdt: "0901234567",
      dia_chi: "Hà Nội",
      email: "xuongmayhn@gmail.com",
    },
  });

  // 5. Khách hàng & Hạng thành viên
  await prisma.hangThanhVien.upsert({
    where: { ten_hang: "Vô hạng" },
    update: {},
    create: { ten_hang: "Vô hạng", diem_toithieu: 0, phan_tram_uudai: 0 },
  });
  await prisma.hangThanhVien.upsert({
    where: { ten_hang: "Đồng" },
    update: {},
    create: { ten_hang: "Đồng", diem_toithieu: 100, phan_tram_uudai: 5 },
  });

  await prisma.khachHang.upsert({
    where: { ma_kh: "KH001" },
    update: {},
    create: {
      ma_kh: "KH001",
      ho_ten_kh: "Nguyễn Văn A",
      sdt: "0987654321",
      diem_tich_luy: 50,
      ten_hang: "Vô hạng",
    },
  });

  // 6. Sản phẩm & SKU
  await prisma.sanPham.upsert({
    where: { ma_sp: "SP01" },
    update: {},
    create: {
      ma_sp: "SP01",
      ten_sp: "Áo Polo Basic",
      danh_muc: "Áo Nam",
      chat_lieu: "Cotton",
      gioi_tinh: "Nam",
      ma_ncc: "NCC01",
    },
  });

  await prisma.bienTheSKU.upsert({
    where: { ma_sku: "SKU-01" },
    update: {},
    create: {
      ma_sku: "SKU-01",
      ma_sp: "SP01",
      mau_sac: "Trắng",
      kich_co: "M",
      gia_ban: 250000,
      so_luong_ton: 50,
    },
  });
  
  await prisma.bienTheSKU.upsert({
    where: { ma_sku: "SKU-LOW" },
    update: {},
    create: {
      ma_sku: "SKU-LOW",
      ma_sp: "SP01",
      mau_sac: "Đen",
      kich_co: "L",
      gia_ban: 250000,
      so_luong_ton: 5, // Low stock for testing
    },
  });

  // 7. Voucher
  await prisma.voucher.upsert({
    where: { ma_voucher: "HELLO2024" },
    update: {},
    create: {
      ma_voucher: "HELLO2024",
      mo_ta: "Giảm 10% đơn hàng",
      phan_tram_giam: 10,
      gia_tri_don_toithieu: 100000,
      ngay_bat_dau: new Date(),
      ngay_het_han: new Date("2025-12-31"),
      so_luong_phat_hanh: 100,
      so_luong_da_dung: 0,
    },
  });

  console.log("Seed completed.");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
