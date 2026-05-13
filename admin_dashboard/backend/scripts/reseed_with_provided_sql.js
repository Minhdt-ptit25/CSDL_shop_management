const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const hash = "$2b$10$5XbCCqwl7PgTQlCgSm2bWusPPTA3kYWiqaXjD.mAlymWBsBRc/MyW";

  console.log("Cleaning up existing data...");
  await prisma.$executeRawUnsafe(`DELETE FROM chitiethoadon;`);
  await prisma.$executeRawUnsafe(`DELETE FROM hoadon;`);
  await prisma.$executeRawUnsafe(`DELETE FROM chitietphieunhap;`);
  await prisma.$executeRawUnsafe(`DELETE FROM phieunhap;`);
  await prisma.$executeRawUnsafe(`DELETE FROM bienthesku;`);
  await prisma.$executeRawUnsafe(`DELETE FROM nhanvien;`);
  await prisma.$executeRawUnsafe(`DELETE FROM vitri;`);
  await prisma.$executeRawUnsafe(`DELETE FROM sanpham;`);
  await prisma.$executeRawUnsafe(`DELETE FROM khachhang;`);
  await prisma.$executeRawUnsafe(`DELETE FROM voucher;`);
  await prisma.$executeRawUnsafe(`DELETE FROM nhacungcap;`);
  await prisma.$executeRawUnsafe(`DELETE FROM cuahang;`);
  await prisma.$executeRawUnsafe(`DELETE FROM hang_thanh_vien;`);

  console.log("Inserting new data...");

  const sqlStatements = [
    // 1. ViTri
    `INSERT INTO vitri (ma_vi_tri, ten_chuc_vu, luong) VALUES
    ('VT01', 'Thu ngân', 7000000),
    ('VT02', 'Nhân viên kho', 8000000),
    ('VT03', 'Quản lý', 15000000);`,

    // 2. HangThanhVien
    `INSERT INTO hang_thanh_vien (ten_hang, diem_toithieu, phan_tram_uudai) VALUES
    ('Vô hạng', 0, 0),
    ('Sắt', 100, 2),
    ('Đồng', 500, 5),
    ('Vàng', 2000, 10),
    ('Bạch kim', 5000, 15);`,

    // 3. CuaHang
    `INSERT INTO cuahang (ma_ch, ten_ch, dia_chi, sdt, email) VALUES
    ('CH01', 'Cửa hàng Trung tâm', '123 Lê Lợi, Q1, TP.HCM', '0901000001', 'ch01@shop.com'),
    ('CH02', 'Cửa hàng Gò Vấp', '456 Nguyễn Oanh, Gò Vấp', '0901000002', 'ch02@shop.com'),
    ('CH03', 'Cửa hàng Thủ Đức', '789 Võ Văn Ngân, Thủ Đức', '0901000003', 'ch03@shop.com'),
    ('CH04', 'Cửa hàng Tân Bình', '101 Cộng Hòa, Tân Bình', '0901000004', 'ch04@shop.com'),
    ('CH05', 'Cửa hàng Bình Thạnh', '202 Xô Viết Nghệ Tĩnh, Bình Thạnh', '0901000005', 'ch05@shop.com'),
    ('CH06', 'Cửa hàng Phú Nhuận', '303 Nguyễn Văn Trỗi, Phú Nhuận', '0901000006', 'ch06@shop.com'),
    ('CH07', 'Cửa hàng Quận 7', '404 Nguyễn Thị Thập, Q7', '0901000007', 'ch07@shop.com'),
    ('CH08', 'Cửa hàng Quận 10', '505 Lý Thường Kiệt, Q10', '0901000008', 'ch08@shop.com'),
    ('CH09', 'Cửa hàng Tân Phú', '606 Lũy Bán Bích, Tân Phú', '0901000009', 'ch09@shop.com'),
    ('CH10', 'Cửa hàng Bình Tân', '707 Hồng Bàng, Bình Tân', '0901000010', 'ch10@shop.com'),
    ('CH11', 'Cửa hàng Quận 4', '808 Tôn Đản, Q4', '0901000011', 'ch11@shop.com'),
    ('CH12', 'Cửa hàng Quận 3', '909 Cách Mạng Tháng 8, Q3', '0901000012', 'ch12@shop.com'),
    ('CH13', 'Cửa hàng Quận 5', '1010 Trần Hưng Đạo, Q5', '0901000013', 'ch13@shop.com'),
    ('CH14', 'Cửa hàng Quận 6', '1111 Hậu Giang, Q6', '0901000014', 'ch14@shop.com'),
    ('CH15', 'Cửa hàng Quận 11', '1212 Lãnh Binh Thăng, Q11', '0901000015', 'ch15@shop.com');`,

    // 4. NhaCungCap
    `INSERT INTO nhacungcap (ma_ncc, ten_ncc, dia_chi, sdt, email) VALUES
    ('NCC01', 'Công ty Thời trang A', '1 Đường 1, Hà Nội', '0911000001', 'contact@a.com'),
    ('NCC02', 'Công ty Thời trang B', '2 Đường 2, Đà Nẵng', '0911000002', 'contact@b.com'),
    ('NCC03', 'Công ty Thời trang C', '3 Đường 3, Cần Thơ', '0911000003', 'contact@c.com'),
    ('NCC04', 'Công ty Thời trang D', '4 Đường 4, Hải Phòng', '0911000004', 'contact@d.com'),
    ('NCC05', 'Công ty Thời trang E', '5 Đường 5, Nha Trang', '0911000005', 'contact@e.com'),
    ('NCC06', 'Công ty Thời trang F', '6 Đường 6, Huế', '0911000006', 'contact@f.com'),
    ('NCC07', 'Công ty Thời trang G', '7 Đường 7, Vũng Tàu', '0911000007', 'contact@g.com'),
    ('NCC08', 'Công ty Thời trang H', '8 Đường 8, Bình Dương', '0911000008', 'contact@h.com'),
    ('NCC09', 'Công ty Thời trang I', '9 Đường 9, Đồng Nai', '0911000009', 'contact@i.com'),
    ('NCC10', 'Công ty Thời trang J', '10 Đường 10, Long An', '0911000010', 'contact@j.com'),
    ('NCC11', 'Công ty Thời trang K', '11 Đường 11, Quảng Ninh', '0911000011', 'contact@k.com'),
    ('NCC12', 'Công ty Thời trang L', '12 Đường 12, Bắc Ninh', '0911000012', 'contact@l.com'),
    ('NCC13', 'Công ty Thời trang M', '13 Đường 13, Thanh Hóa', '0911000013', 'contact@m.com'),
    ('NCC14', 'Công ty Thời trang N', '14 Đường 14, Nghệ An', '0911000014', 'contact@n.com'),
    ('NCC15', 'Công ty Thời trang O', '15 Đường 15, Hà Tĩnh', '0911000015', 'contact@o.com');`,

    // 5. SanPham
    `INSERT INTO sanpham (ma_sp, ten_sp, danh_muc, chat_lieu, gioi_tinh, ma_ncc) VALUES
    ('SP01', 'Áo sơ mi nam trắng', 'Áo', 'Cotton', 'Nam', 'NCC01'),
    ('SP02', 'Quần jean nữ', 'Quần', 'Denim', 'Nữ', 'NCC02'),
    ('SP03', 'Đầm dự tiệc', 'Đầm', 'Lụa', 'Nữ', 'NCC03'),
    ('SP04', 'Áo thun unisex', 'Áo', 'Thun', 'Unisex', 'NCC04'),
    ('SP05', 'Giày thể thao', 'Giày', 'Da', 'Nam', 'NCC05'),
    ('SP06', 'Túi xách nữ', 'Phụ kiện', 'Da', 'Nữ', 'NCC06'),
    ('SP07', 'Áo khoác gió', 'Áo khoác', 'Nylon', 'Unisex', 'NCC07'),
    ('SP08', 'Quần short nam', 'Quần', 'Kaki', 'Nam', 'NCC08'),
    ('SP09', 'Chân váy chữ A', 'Váy', 'Cotton', 'Nữ', 'NCC09'),
    ('SP10', 'Sơ mi nữ', 'Áo', 'Polo', 'Nữ', 'NCC10'),
    ('SP11', 'Áo len cổ lọ', 'Áo', 'Len', 'Unisex', 'NCC11'),
    ('SP12', 'Quần tây nam', 'Quần', 'Poly', 'Nam', 'NCC12'),
    ('SP13', 'Mũ lưỡi trai', 'Phụ kiện', 'Vải', 'Unisex', 'NCC13'),
    ('SP14', 'Balo đựng laptop', 'Túi xách', 'Canvas', 'Unisex', 'NCC14'),
    ('SP15', 'Đồng hồ thể thao', 'Phụ kiện', 'Hợp kim', 'Nam', 'NCC15');`,

    // 6. Voucher
    `INSERT INTO voucher (ma_voucher, mo_ta, phan_tram_giam, so_tien_giam_toida, gia_tri_don_toithieu, ngay_bat_dau, ngay_het_han, so_luong_phat_hanh, so_luong_da_dung) VALUES
    ('V001', 'Giảm 10% tối đa 50k', 10, 50000, 200000, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 100, 0),
    ('V002', 'Giảm 20k cho đơn 200k', 0, 20000, 200000, '2025-02-01T00:00:00Z', '2025-12-31T23:59:59Z', 200, 0),
    ('V003', 'Giảm 15% tối đa 100k', 15, 100000, 500000, '2025-03-01T00:00:00Z', '2025-12-31T23:59:59Z', 150, 0),
    ('V004', 'Giảm 50k cho đơn 500k', 0, 50000, 500000, '2025-04-01T00:00:00Z', '2025-12-31T23:59:59Z', 80, 0),
    ('V005', 'Giảm 5% cho đơn 100k', 5, 30000, 100000, '2025-01-01T00:00:00Z', '2025-06-30T23:59:59Z', 300, 0),
    ('V006', 'Giảm 30k cho đơn 300k', 0, 30000, 300000, '2025-05-01T00:00:00Z', '2025-12-31T23:59:59Z', 120, 0),
    ('V007', 'Giảm 20% tối đa 200k', 20, 200000, 1000000, '2025-06-01T00:00:00Z', '2025-12-31T23:59:59Z', 50, 0),
    ('V008', 'Giảm 10k cho đơn 150k', 0, 10000, 150000, '2025-07-01T00:00:00Z', '2025-12-31T23:59:59Z', 250, 0),
    ('V009', 'Giảm 12% tối đa 80k', 12, 80000, 400000, '2025-08-01T00:00:00Z', '2025-12-31T23:59:59Z', 180, 0),
    ('V010', 'Giảm 40k cho đơn 400k', 0, 40000, 400000, '2025-09-01T00:00:00Z', '2025-12-31T23:59:59Z', 100, 0),
    ('V011', 'Giảm 25% tối đa 150k', 25, 150000, 600000, '2025-10-01T00:00:00Z', '2025-12-31T23:59:59Z', 70, 0),
    ('V012', 'Giảm 15k cho đơn 100k', 0, 15000, 100000, '2025-11-01T00:00:00Z', '2025-12-31T23:59:59Z', 400, 0),
    ('V013', 'Giảm 8% tối đa 40k', 8, 40000, 200000, '2025-12-01T00:00:00Z', '2025-12-31T23:59:59Z', 220, 0),
    ('V014', 'Giảm 100k cho đơn 1 triệu', 0, 100000, 1000000, '2025-01-01T00:00:00Z', '2025-12-31T23:59:59Z', 60, 0),
    ('V015', 'Giảm 30% tối đa 300k', 30, 300000, 1200000, '2025-02-01T00:00:00Z', '2025-12-31T23:59:59Z', 40, 0);`,

    // 7. KhachHang
    `INSERT INTO khachhang (ma_kh, ho_ten_kh, dia_chi, sdt, email, diem_tich_luy, ten_hang) VALUES
    ('KH01', 'Nguyễn Văn A', '10 Lê Lợi, Q1, TP.HCM', '0981000001', 'a.nv@gmail.com', 1200, 'Vàng'),
    ('KH02', 'Trần Thị B', '20 Nguyễn Huệ, Q1, TP.HCM', '0981000002', 'b.tt@gmail.com', 80, 'Vô hạng'),
    ('KH03', 'Lê Văn C', '30 Phạm Ngũ Lão, Q1, TP.HCM', '0981000003', 'c.lv@gmail.com', 550, 'Đồng'),
    ('KH04', 'Phạm Thị D', '40 Võ Thị Sáu, Q3, TP.HCM', '0981000004', 'd.pt@gmail.com', 20, 'Vô hạng'),
    ('KH05', 'Hoàng Văn E', '50 Bà Huyện Thanh Quan, Q3', '0981000005', 'e.hv@gmail.com', 6000, 'Bạch kim'),
    ('KH06', 'Ngô Thị F', '60 Trần Hưng Đạo, Q5, TP.HCM', '0981000006', 'f.nt@gmail.com', 150, 'Sắt'),
    ('KH07', 'Đặng Văn G', '70 Nguyễn Trãi, Q5, TP.HCM', '0981000007', 'g.dv@gmail.com', 2100, 'Vàng'),
    ('KH08', 'Bùi Thị H', '80 Xô Viết Nghệ Tĩnh, Bình Thạnh', '0981000008', 'h.bt@gmail.com', 90, 'Sắt'),
    ('KH09', 'Đỗ Văn I', '90 Ung Văn Khiêm, Bình Thạnh', '0981000009', 'i.dv@gmail.com', 510, 'Đồng'),
    ('KH10', 'Vũ Thị K', '100 Nguyễn Thái Học, Q1', '0981000010', 'k.vt@gmail.com', 10, 'Vô hạng'),
    ('KH11', 'Trương Văn L', '110 Lê Quang Định, Gò Vấp', '0981000011', 'l.tv@gmail.com', 3000, 'Bạch kim'),
    ('KH12', 'Lý Thị M', '120 Lê Đức Thọ, Gò Vấp', '0981000012', 'm.lt@gmail.com', 700, 'Đồng'),
    ('KH13', 'Mai Văn N', '130 Huỳnh Tấn Phát, Q7', '0981000013', 'n.mv@gmail.com', 250, 'Sắt'),
    ('KH14', 'Chu Thị O', '140 Nguyễn Văn Linh, Q7', '0981000014', 'o.ct@gmail.com', 120, 'Sắt'),
    ('KH15', 'Lương Văn P', '150 Nguyễn Thị Thập, Q7', '0981000015', 'p.lv@gmail.com', 4000, 'Bạch kim');`,

    // 8. NhanVien
    `INSERT INTO nhanvien (ma_nv, ho_ten_nv, ngay_sinh, gioi_tinh, dia_chi, sdt, email, ngay_vao_lam, ma_vi_tri, ma_ch, ten_dang_nhap, mat_khau_hash, vai_tro) VALUES
    ('NV01', 'Admin System', '1985-01-01T00:00:00Z', 'Nam', '123 Admin St', '0902000001', 'admin@shop.com', '2020-01-01T00:00:00Z', 'VT03', 'CH01', 'admin', '${hash}', 'admin'),
    ('NV02', 'Nguyễn Thị Mai', '1995-03-10T00:00:00Z', 'Nữ', '10 Lê Lợi, Q1', '0902000002', 'mai.nt@shop.com', '2021-05-01T00:00:00Z', 'VT01', 'CH01', 'cashier', '${hash}', 'cashier'),
    ('NV03', 'Trần Văn Hùng', '1998-07-22T00:00:00Z', 'Nam', '20 Nguyễn Huệ, Q1', '0902000003', 'hung.tv@shop.com', '2021-06-15T00:00:00Z', 'VT01', 'CH02', 'cashier2', '${hash}', 'cashier'),
    ('NV04', 'Lê Thị Lan', '1996-11-02T00:00:00Z', 'Nữ', '30 Phạm Ngũ Lão, Q1', '0902000004', 'lan.lt@shop.com', '2021-07-10T00:00:00Z', 'VT01', 'CH03', 'cashier3', '${hash}', 'cashier'),
    ('NV05', 'Phạm Văn Tuấn', '1994-09-18T00:00:00Z', 'Nam', '40 Võ Thị Sáu, Q3', '0902000005', 'tuan.pv@shop.com', '2021-08-20T00:00:00Z', 'VT01', 'CH04', 'cashier4', '${hash}', 'cashier'),
    ('NV06', 'Hoàng Thị Hoa', '1997-12-05T00:00:00Z', 'Nữ', '50 Bà Huyện Thanh Quan, Q3', '0902000006', 'hoa.ht@shop.com', '2021-09-25T00:00:00Z', 'VT01', 'CH05', 'cashier5', '${hash}', 'cashier'),
    ('NV07', 'Ngô Văn Bình', '1995-04-30T00:00:00Z', 'Nam', '60 Trần Hưng Đạo, Q5', '0902000007', 'binh.nv@shop.com', '2021-10-10T00:00:00Z', 'VT01', 'CH06', 'cashier6', '${hash}', 'cashier'),
    ('NV08', 'Đặng Thị Cúc', '1999-01-15T00:00:00Z', 'Nữ', '70 Nguyễn Trãi, Q5', '0902000008', 'cuc.dt@shop.com', '2021-11-05T00:00:00Z', 'VT01', 'CH07', 'cashier7', '${hash}', 'cashier'),
    ('NV09', 'Vũ Văn Khoa', '1992-02-20T00:00:00Z', 'Nam', '80 Xô Viết Nghệ Tĩnh, Bình Thạnh', '0902000009', 'khoa.vv@shop.com', '2020-12-01T00:00:00Z', 'VT02', 'CH01', 'storage', '${hash}', 'warehouse'),
    ('NV10', 'Trương Văn Lực', '1993-06-11T00:00:00Z', 'Nam', '90 Ung Văn Khiêm, Bình Thạnh', '0902000010', 'luc.tv@shop.com', '2021-01-15T00:00:00Z', 'VT02', 'CH08', 'storage2', '${hash}', 'warehouse'),
    ('NV11', 'Lý Thị Huệ', '1996-08-25T00:00:00Z', 'Nữ', '100 Nguyễn Thái Học, Q1', '0902000011', 'hue.lt@shop.com', '2021-02-20T00:00:00Z', 'VT02', 'CH09', 'storage3', '${hash}', 'warehouse'),
    ('NV12', 'Mai Văn An', '1994-10-30T00:00:00Z', 'Nam', '110 Lê Quang Định, Gò Vấp', '0902000012', 'an.mv@shop.com', '2021-03-25T00:00:00Z', 'VT02', 'CH10', 'storage4', '${hash}', 'warehouse'),
    ('NV13', 'Chu Thị Tuyết', '1997-04-12T00:00:00Z', 'Nữ', '120 Lê Đức Thọ, Gò Vấp', '0902000013', 'tuyet.ct@shop.com', '2021-04-30T00:00:00Z', 'VT02', 'CH11', 'storage5', '${hash}', 'warehouse'),
    ('NV14', 'Lương Văn Quyết', '1995-07-19T00:00:00Z', 'Nam', '130 Huỳnh Tấn Phát, Q7', '0902000014', 'quyet.lv@shop.com', '2021-05-10T00:00:00Z', 'VT02', 'CH12', 'storage6', '${hash}', 'warehouse'),
    ('NV15', 'Đinh Thị Ngọc', '1998-09-08T00:00:00Z', 'Nữ', '140 Nguyễn Văn Linh, Q7', '0902000015', 'ngoc.dt@shop.com', '2021-06-01T00:00:00Z', 'VT02', 'CH13', 'storage7', '${hash}', 'warehouse');`,

    // 9. BienTheSKU
    `INSERT INTO bienthesku (ma_sku, ma_sp, mau_sac, kich_co, gia_ban, so_luong_ton) VALUES
    ('SKU01', 'SP01', 'Trắng', 'M', 250000, 100),
    ('SKU02', 'SP02', 'Xanh', 'L', 350000, 80),
    ('SKU03', 'SP03', 'Đỏ', 'S', 450000, 50),
    ('SKU04', 'SP04', 'Đen', 'XL', 120000, 200),
    ('SKU05', 'SP05', 'Xám', '42', 600000, 60),
    ('SKU06', 'SP06', 'Nâu', 'OneSize', 550000, 40),
    ('SKU07', 'SP07', 'Vàng', 'M', 320000, 90),
    ('SKU08', 'SP08', 'Xanh rêu', 'L', 280000, 110),
    ('SKU09', 'SP09', 'Hồng', 'S', 220000, 130),
    ('SKU10', 'SP10', 'Trắng', 'M', 270000, 85),
    ('SKU11', 'SP11', 'Xám', 'L', 390000, 70),
    ('SKU12', 'SP12', 'Đen', '30', 420000, 55),
    ('SKU13', 'SP13', 'Đen', 'OneSize', 90000, 300),
    ('SKU14', 'SP14', 'Xanh dương', 'OneSize', 350000, 75),
    ('SKU15', 'SP15', 'Bạc', 'OneSize', 850000, 45);`,

    // 10. PhieuNhap
    `INSERT INTO phieunhap (ma_pn, ngay_nhap, tong_tien, ma_ncc, ma_nv) VALUES
    ('PN01', '2025-01-05T00:00:00Z', 12500000, 'NCC01', 'NV09'),
    ('PN02', '2025-01-10T00:00:00Z', 9800000, 'NCC02', 'NV10'),
    ('PN03', '2025-01-15T00:00:00Z', 15600000, 'NCC03', 'NV11'),
    ('PN04', '2025-01-20T00:00:00Z', 7200000, 'NCC04', 'NV12'),
    ('PN05', '2025-01-25T00:00:00Z', 18300000, 'NCC05', 'NV13');`,

    // 11. ChiTietPhieuNhap
    `INSERT INTO chitietphieunhap (ma_pn, ma_sku, so_luong, gia_nhap) VALUES
    ('PN01', 'SKU01', 50, 200000),
    ('PN02', 'SKU02', 40, 220000),
    ('PN03', 'SKU03', 35, 380000),
    ('PN04', 'SKU04', 60, 100000),
    ('PN05', 'SKU05', 30, 500000);`,

    // 12. HoaDon
    `INSERT INTO hoadon (ma_hd, ngay_tao, tong_tien_truoc_giam, giam_gia_hang, giam_gia_voucher, tong_tien_sau_giam, phuong_thuc_thanh_toan, trang_thai, ma_kh, ma_nv, ma_voucher) VALUES
    ('HD01', '2025-02-01T00:00:00Z', 450000, 0, 30000, 420000, 'Chuyển khoản', 'Hoàn thành', 'KH01', 'NV02', 'V002'),
    ('HD02', '2025-02-02T00:00:00Z', 230000, 0, 0, 230000, 'Tiền mặt', 'Hoàn thành', 'KH02', 'NV03', NULL),
    ('HD03', '2025-02-03T00:00:00Z', 680000, 34000, 50000, 596000, 'Chuyển khoản', 'Hoàn thành', 'KH03', 'NV04', 'V004'),
    ('HD04', '2025-02-04T00:00:00Z', 120000, 0, 10000, 110000, 'Tiền mặt', 'Hoàn thành', 'KH04', 'NV05', 'V008'),
    ('HD05', '2025-02-05T00:00:00Z', 1550000, 155000, 100000, 1295000, 'Chuyển khoản', 'Hoàn thành', 'KH05', 'NV06', 'V014');`,

    // 13. ChiTietHoaDon
    `INSERT INTO chitiethoadon (ma_hd, ma_sku, so_luong, gia_ban, thanh_tien) VALUES
    ('HD01', 'SKU01', 1, 250000, 250000),
    ('HD01', 'SKU04', 1, 120000, 120000),
    ('HD02', 'SKU07', 1, 320000, 320000),
    ('HD03', 'SKU03', 1, 450000, 450000),
    ('HD03', 'SKU09', 1, 220000, 220000);`
  ];

  for (const sql of sqlStatements) {
    try {
      await prisma.$executeRawUnsafe(sql);
      console.log("Executed statement successfully.");
    } catch (e) {
      console.error("Error executing statement:", e.message);
    }
  }

  console.log("Reseed completed!");
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
