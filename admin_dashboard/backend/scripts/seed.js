const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding data...');

  // 1. ViTri
  await prisma.viTri.createMany({
    data: [
      { ma_vi_tri: 'VT01', ten_chuc_vu: 'Quản lý', luong: 15000000 },
      { ma_vi_tri: 'VT02', ten_chuc_vu: 'Nhân viên bán hàng', luong: 8000000 },
    ],
    skipDuplicates: true,
  });

  // 2. CuaHang
  await prisma.cuaHang.createMany({
    data: [
      { ma_ch: 'CH01', ten_ch: 'Cửa hàng Trung tâm', dia_chi: '123 Nguyễn Trãi, Hà Nội', sdt: '0123456789', email: 'ch01@shop.com' },
    ],
    skipDuplicates: true,
  });

  // 3. NhanVien
  await prisma.nhanVien.createMany({
    data: [
      {
        ma_nv: 'NV01',
        ho_ten_nv: 'Nguyễn Văn A',
        ngay_sinh: new Date('1990-01-01'),
        gioi_tinh: 'Nam',
        dia_chi: 'Hà Nội',
        sdt: '0987654321',
        email: 'nva@shop.com',
        ngay_vao_lam: new Date('2020-01-01'),
        ma_vi_tri: 'VT01',
        ma_ch: 'CH01'
      },
    ],
    skipDuplicates: true,
  });

  // 4. NhaCungCap
  await prisma.nhaCungCap.createMany({
    data: [
      { ma_ncc: 'NCC01', ten_ncc: 'Nhà cung cấp Thời Trang', dia_chi: 'Hồ Chí Minh', sdt: '0912345678', email: 'ncc01@thoitrang.com' },
    ],
    skipDuplicates: true,
  });

  // 5. KhachHang
  await prisma.khachHang.createMany({
    data: [
      { ma_kh: 'KH01', ho_ten_kh: 'Trần Thị B', dia_chi: 'Hà Nội', sdt: '0922334455', email: 'ttb@gmail.com', diem_tich_luy: 100, hang_thanh_vien: 'Bạc' },
      { ma_kh: 'KH02', ho_ten_kh: 'Lê Văn C', dia_chi: 'Đà Nẵng', sdt: '0933445566', email: 'lvc@gmail.com', diem_tich_luy: 500, hang_thanh_vien: 'Vàng' },
    ],
    skipDuplicates: true,
  });

  // 6. SanPham
  await prisma.sanPham.createMany({
    data: [
      { ma_sp: 'SP01', ten_sp: 'Áo thun nam', danh_muc: 'Áo', chat_lieu: 'Cotton', mua_vu: 'Mùa hè', gioi_tinh: 'Nam', ma_ncc: 'NCC01' },
      { ma_sp: 'SP02', ten_sp: 'Quần jean nữ', danh_muc: 'Quần', chat_lieu: 'Denim', mua_vu: 'Bốn mùa', gioi_tinh: 'Nữ', ma_ncc: 'NCC01' },
    ],
    skipDuplicates: true,
  });

  // 7. BienTheSKU
  await prisma.bienTheSKU.createMany({
    data: [
      { ma_sku: 'SKU01', ma_sp: 'SP01', mau_sac: 'Trắng', kich_co: 'M', gia_ban: 200000, so_luong_ton: 50 },
      { ma_sku: 'SKU02', ma_sp: 'SP01', mau_sac: 'Đen', kich_co: 'L', gia_ban: 200000, so_luong_ton: 30 },
      { ma_sku: 'SKU03', ma_sp: 'SP02', mau_sac: 'Xanh', kich_co: 'S', gia_ban: 450000, so_luong_ton: 20 },
    ],
    skipDuplicates: true,
  });

  // 8. PhieuNhap
  await prisma.phieuNhap.createMany({
    data: [
      { ma_pn: 'PN01', ngay_nhap: new Date(), tong_tien: 10000000, ma_ncc: 'NCC01', ma_nv: 'NV01' },
    ],
    skipDuplicates: true,
  });

  // 9. ChiTietPhieuNhap
  await prisma.chiTietPhieuNhap.createMany({
    data: [
      { ma_pn: 'PN01', ma_sku: 'SKU01', so_luong: 100, gia_nhap: 100000 },
    ],
    skipDuplicates: true,
  });

  // 10. HoaDon
  await prisma.hoaDon.createMany({
    data: [
      { ma_hd: 'HD01', ngay_tao: new Date(), tong_tien: 400000, phuong_thuc_thanh_toan: 'Tiền mặt', trang_thai: 'Hoàn thành', ma_kh: 'KH01', ma_nv: 'NV01' },
      { ma_hd: 'HD02', ngay_tao: new Date(), tong_tien: 450000, phuong_thuc_thanh_toan: 'Chuyển khoản', trang_thai: 'Hoàn thành', ma_kh: 'KH02', ma_nv: 'NV01' },
    ],
    skipDuplicates: true,
  });

  // 11. ChiTietHoaDon
  await prisma.chiTietHoaDon.createMany({
    data: [
      { ma_hd: 'HD01', ma_sku: 'SKU01', so_luong: 2, gia_ban: 200000 },
      { ma_hd: 'HD02', ma_sku: 'SKU03', so_luong: 1, gia_ban: 450000 },
    ],
    skipDuplicates: true,
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
