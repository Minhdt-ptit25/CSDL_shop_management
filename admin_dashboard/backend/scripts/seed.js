require("dotenv/config");

const { prisma } = require("../src/db/prisma");

async function seed() {
  await prisma.viTri.upsert({
    where: { ma_vi_tri: "VT01" },
    update: {},
    create: { ma_vi_tri: "VT01", ten_chuc_vu: "Quản lý", luong: "15000000" },
  });
  await prisma.viTri.upsert({
    where: { ma_vi_tri: "VT02" },
    update: {},
    create: { ma_vi_tri: "VT02", ten_chuc_vu: "Thu ngân", luong: "8000000" },
  });

  await prisma.cuaHang.upsert({
    where: { ma_ch: "CH01" },
    update: {},
    create: {
      ma_ch: "CH01",
      ten_ch: "Fashion Store Cầu Giấy",
      dia_chi: "123 Cầu Giấy",
      sdt: "024123456",
      email: "caugiay@fashion.com",
    },
  });

  await prisma.nhaCungCap.upsert({
    where: { ma_ncc: "NCC01" },
    update: {},
    create: {
      ma_ncc: "NCC01",
      ten_ncc: "Xưởng may Dệt Kim Hà Nội",
      sdt: "0901234567",
      dia_chi: "Hà Nội",
      email: "detkimhn@gmail.com",
    },
  });

  await prisma.nhaCungCap.upsert({
    where: { ma_ncc: "NCC02" },
    update: {},
    create: {
      ma_ncc: "NCC02",
      ten_ncc: "Công ty TNHH Thời Trang Nam",
      sdt: "0987654321",
      dia_chi: "Hồ Chí Minh",
      email: "ttnam@gmail.com",
    },
  });

  await prisma.nhanVien.upsert({
    where: { ma_nv: "NV01" },
    update: {},
    create: {
      ma_nv: "NV01",
      ho_ten_nv: "Trần Văn Quản",
      ngay_sinh: new Date("1990-05-10"),
      gioi_tinh: "Nam",
      dia_chi: "Đống Đa, HN",
      sdt: "0911223344",
      email: "quan.tv@fashion.com",
      ngay_vao_lam: new Date("2020-01-01"),
      ma_vi_tri: "VT01",
      ma_ch: "CH01",
    },
  });

  await prisma.khachHang.upsert({
    where: { ma_kh: "KH001" },
    update: {},
    create: {
      ma_kh: "KH001",
      ho_ten_kh: "Nguyễn Văn A",
      dia_chi: "Hà Nội",
      sdt: "0987654321",
      email: "nva@gmail.com",
      diem_tich_luy: 50,
      hang_thanh_vien: "Thành viên Bạc",
    },
  });

  await prisma.sanPham.upsert({
    where: { ma_sp: "SP001" },
    update: {},
    create: {
      ma_sp: "SP001",
      ten_sp: "Áo thun Polo basic",
      danh_muc: "Áo Nam",
      chat_lieu: "Cotton 100%",
      mua_vu: "Xuân Hè",
      gioi_tinh: "Nam",
      ma_ncc: "NCC01",
    },
  });

  await prisma.bienTheSKU.upsert({
    where: { ma_sku: "SKU-SP1-001" },
    update: {},
    create: {
      ma_sku: "SKU-SP1-001",
      ma_sp: "SP001",
      mau_sac: "Đen",
      kich_co: "M",
      gia_ban: "250000",
      so_luong_ton: 50,
    },
  });

  await prisma.hoaDon.upsert({
    where: { ma_hd: "HD001" },
    update: {},
    create: {
      ma_hd: "HD001",
      ngay_tao: new Date("2024-01-02"),
      tong_tien: "500000",
      phuong_thuc_thanh_toan: "Tiền mặt",
      trang_thai: "Đã hoàn thành",
      ma_kh: "KH001",
      ma_nv: "NV01",
    },
  });

  await prisma.chiTietHoaDon.upsert({
    where: { ma_hd_ma_sku: { ma_hd: "HD001", ma_sku: "SKU-SP1-001" } },
    update: {},
    create: {
      ma_hd: "HD001",
      ma_sku: "SKU-SP1-001",
      so_luong: 2,
      gia_ban: "250000",
    },
  });

  await prisma.phieuNhap.upsert({
    where: { ma_pn: "PN001" },
    update: {},
    create: {
      ma_pn: "PN001",
      ngay_nhap: new Date("2024-02-03"),
      tong_tien: "130000",
      ma_ncc: "NCC01",
      ma_nv: "NV01",
    },
  });
}

seed()
  .then(() => {
    console.log("Seeded database.");
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

