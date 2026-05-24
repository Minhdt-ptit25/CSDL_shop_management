-- Tạo database
CREATE DATABASE IF NOT EXISTS shop_management;
USE shop_management;


CREATE TABLE IF NOT EXISTS vitri (
    ma_vi_tri VARCHAR(10) PRIMARY KEY,
    ten_chuc_vu VARCHAR(50) NOT NULL,
    luong DECIMAL(12, 2) NOT NULL
);


CREATE TABLE IF NOT EXISTS cuahang (
    ma_ch VARCHAR(10) PRIMARY KEY,
    ten_ch VARCHAR(100) NOT NULL,
    dia_chi VARCHAR(200) NOT NULL,
    sdt VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS khachhang (
    ma_kh VARCHAR(20) PRIMARY KEY,
    ho_ten_kh VARCHAR(100) NOT NULL,
    dia_chi VARCHAR(200) NOT NULL,
    sdt VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    diem_tich_luy INT DEFAULT 0,
    hang_thanh_vien VARCHAR(50) DEFAULT 'Thành viên mới'
);


CREATE TABLE IF NOT EXISTS nhacungcap (
    ma_ncc VARCHAR(10) PRIMARY KEY,
    ten_ncc VARCHAR(100) NOT NULL,
    dia_chi VARCHAR(200) NOT NULL,
    sdt VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL
);


CREATE TABLE IF NOT EXISTS nhanvien (
    ma_nv VARCHAR(10) PRIMARY KEY,
    ho_ten_nv VARCHAR(100) NOT NULL,
    ngay_sinh DATE NOT NULL,
    gioi_tinh VARCHAR(10) NOT NULL,
    dia_chi VARCHAR(200) NOT NULL,
    sdt VARCHAR(15) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    ngay_vao_lam DATE NOT NULL,
    ma_vi_tri VARCHAR(10) NOT NULL,
    ma_ch VARCHAR(10) NOT NULL,
    FOREIGN KEY (ma_vi_tri) REFERENCES vitri(ma_vi_tri),
    FOREIGN KEY (ma_ch) REFERENCES cuahang(ma_ch)
);


CREATE TABLE IF NOT EXISTS sanpham (
    ma_sp VARCHAR(10) PRIMARY KEY,
    ten_sp VARCHAR(100) NOT NULL,
    danh_muc VARCHAR(50) NOT NULL,
    chat_lieu VARCHAR(100) NOT NULL,
    mua_vu VARCHAR(50) NOT NULL,
    gioi_tinh VARCHAR(10) NOT NULL,
    ma_ncc VARCHAR(10) NOT NULL,
    FOREIGN KEY (ma_ncc) REFERENCES nhacungcap(ma_ncc)
);


CREATE TABLE IF NOT EXISTS bienthesku (
    ma_sku VARCHAR(30) PRIMARY KEY,
    ma_sp VARCHAR(10) NOT NULL,
    mau_sac VARCHAR(50) NOT NULL,
    kich_co VARCHAR(20) NOT NULL,
    gia_ban DECIMAL(15, 2) NOT NULL,
    so_luong_ton INT NOT NULL DEFAULT 0,
    FOREIGN KEY (ma_sp) REFERENCES sanpham(ma_sp)
);


CREATE TABLE IF NOT EXISTS phieunhap (
    ma_pn VARCHAR(10) PRIMARY KEY,
    ngay_nhap DATE NOT NULL,
    tong_tien DECIMAL(15, 2) NOT NULL,
    ma_ncc VARCHAR(10) NOT NULL,
    ma_nv VARCHAR(10) NOT NULL,
    FOREIGN KEY (ma_ncc) REFERENCES nhacungcap(ma_ncc),
    FOREIGN KEY (ma_nv) REFERENCES nhanvien(ma_nv)
);


CREATE TABLE IF NOT EXISTS chitietphieunhap (
    ma_pn VARCHAR(10) NOT NULL,
    ma_sku VARCHAR(30) NOT NULL,
    so_luong INT NOT NULL,
    gia_nhap DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (ma_pn, ma_sku),
    FOREIGN KEY (ma_pn) REFERENCES phieunhap(ma_pn),
    FOREIGN KEY (ma_sku) REFERENCES bienthesku(ma_sku)
);


CREATE TABLE IF NOT EXISTS hoadon (
    ma_hd VARCHAR(10) PRIMARY KEY,
    ngay_tao DATE NOT NULL,
    tong_tien DECIMAL(15, 2) NOT NULL,
    phuong_thuc_thanh_toan VARCHAR(50) NOT NULL,
    trang_thai VARCHAR(20) NOT NULL,
    ma_kh VARCHAR(20) NOT NULL,
    ma_nv VARCHAR(10) NOT NULL,
    FOREIGN KEY (ma_kh) REFERENCES khachhang(ma_kh),
    FOREIGN KEY (ma_nv) REFERENCES nhanvien(ma_nv)
);


CREATE TABLE IF NOT EXISTS chitiethoadon (
    ma_hd VARCHAR(10) NOT NULL,
    ma_sku VARCHAR(30) NOT NULL,
    so_luong INT NOT NULL,
    gia_ban DECIMAL(15, 2) NOT NULL,
    PRIMARY KEY (ma_hd, ma_sku),
    FOREIGN KEY (ma_hd) REFERENCES hoadon(ma_hd),
    FOREIGN KEY (ma_sku) REFERENCES bienthesku(ma_sku)
);

INSERT INTO vitri (ma_vi_tri, ten_chuc_vu, luong) VALUES
('VT01', 'Nhân viên bán hàng 1', 13000000),
('VT02', 'Thu ngân 2', 15000000),
('VT03', 'Nhân viên bán hàng 3', 28000000),
('VT04', 'Kế toán 4', 29000000),
('VT05', 'Quản lý 5', 30000000),
('VT06', 'Nhân viên kho 6', 26000000),
('VT07', 'Nhân viên bán hàng 7', 22000000),
('VT08', 'Giám đốc 8', 10000000),
('VT09', 'Quản lý 9', 28000000),
('VT10', 'Giám đốc 10', 5000000),
('VT11', 'Nhân viên kho 11', 30000000),
('VT12', 'Nhân viên bán hàng 12', 29000000),
('VT13', 'Nhân viên bán hàng 13', 22000000),
('VT14', 'Nhân viên kho 14', 9000000),
('VT15', 'Bảo vệ 15', 13000000);
INSERT INTO cuahang (ma_ch, ten_ch, dia_chi, sdt, email) VALUES
('CH01', 'Cửa hàng 1', 'Địa chỉ 1, TP.HCM', '0910000001', 'ch1@shop.com'),
('CH02', 'Cửa hàng 2', 'Địa chỉ 2, TP.HCM', '0910000002', 'ch2@shop.com'),
('CH03', 'Cửa hàng 3', 'Địa chỉ 3, TP.HCM', '0910000003', 'ch3@shop.com'),
('CH04', 'Cửa hàng 4', 'Địa chỉ 4, TP.HCM', '0910000004', 'ch4@shop.com'),
('CH05', 'Cửa hàng 5', 'Địa chỉ 5, TP.HCM', '0910000005', 'ch5@shop.com'),
('CH06', 'Cửa hàng 6', 'Địa chỉ 6, TP.HCM', '0910000006', 'ch6@shop.com'),
('CH07', 'Cửa hàng 7', 'Địa chỉ 7, TP.HCM', '0910000007', 'ch7@shop.com'),
('CH08', 'Cửa hàng 8', 'Địa chỉ 8, TP.HCM', '0910000008', 'ch8@shop.com'),
('CH09', 'Cửa hàng 9', 'Địa chỉ 9, TP.HCM', '0910000009', 'ch9@shop.com'),
('CH10', 'Cửa hàng 10', 'Địa chỉ 10, TP.HCM', '0910000010', 'ch10@shop.com'),
('CH11', 'Cửa hàng 11', 'Địa chỉ 11, TP.HCM', '0910000011', 'ch11@shop.com'),
('CH12', 'Cửa hàng 12', 'Địa chỉ 12, TP.HCM', '0910000012', 'ch12@shop.com'),
('CH13', 'Cửa hàng 13', 'Địa chỉ 13, TP.HCM', '0910000013', 'ch13@shop.com'),
('CH14', 'Cửa hàng 14', 'Địa chỉ 14, TP.HCM', '0910000014', 'ch14@shop.com'),
('CH15', 'Cửa hàng 15', 'Địa chỉ 15, TP.HCM', '0910000015', 'ch15@shop.com');
INSERT INTO khachhang (ma_kh, ho_ten_kh, dia_chi, sdt, email, diem_tich_luy, hang_thanh_vien) VALUES
('KH01', 'Khách hàng 1', 'Địa chỉ KH 1, TP.HCM', '0920000001', 'kh1@gmail.com', 724, 'Thành viên Kim Cương'),
('KH02', 'Khách hàng 2', 'Địa chỉ KH 2, TP.HCM', '0920000002', 'kh2@gmail.com', 291, 'Thành viên Kim Cương'),
('KH03', 'Khách hàng 3', 'Địa chỉ KH 3, TP.HCM', '0920000003', 'kh3@gmail.com', 528, 'Thành viên mới'),
('KH04', 'Khách hàng 4', 'Địa chỉ KH 4, TP.HCM', '0920000004', 'kh4@gmail.com', 156, 'Thành viên Bạc'),
('KH05', 'Khách hàng 5', 'Địa chỉ KH 5, TP.HCM', '0920000005', 'kh5@gmail.com', 116, 'Thành viên Bạc'),
('KH06', 'Khách hàng 6', 'Địa chỉ KH 6, TP.HCM', '0920000006', 'kh6@gmail.com', 299, 'Thành viên Vàng'),
('KH07', 'Khách hàng 7', 'Địa chỉ KH 7, TP.HCM', '0920000007', 'kh7@gmail.com', 931, 'Thành viên Vàng'),
('KH08', 'Khách hàng 8', 'Địa chỉ KH 8, TP.HCM', '0920000008', 'kh8@gmail.com', 430, 'Thành viên mới'),
('KH09', 'Khách hàng 9', 'Địa chỉ KH 9, TP.HCM', '0920000009', 'kh9@gmail.com', 544, 'Thành viên Bạc'),
('KH10', 'Khách hàng 10', 'Địa chỉ KH 10, TP.HCM', '0920000010', 'kh10@gmail.com', 665, 'Thành viên mới'),
('KH11', 'Khách hàng 11', 'Địa chỉ KH 11, TP.HCM', '0920000011', 'kh11@gmail.com', 280, 'Thành viên Kim Cương'),
('KH12', 'Khách hàng 12', 'Địa chỉ KH 12, TP.HCM', '0920000012', 'kh12@gmail.com', 307, 'Thành viên Bạc'),
('KH13', 'Khách hàng 13', 'Địa chỉ KH 13, TP.HCM', '0920000013', 'kh13@gmail.com', 913, 'Thành viên Bạc'),
('KH14', 'Khách hàng 14', 'Địa chỉ KH 14, TP.HCM', '0920000014', 'kh14@gmail.com', 74, 'Thành viên mới'),
('KH15', 'Khách hàng 15', 'Địa chỉ KH 15, TP.HCM', '0920000015', 'kh15@gmail.com', 383, 'Thành viên Kim Cương');
INSERT INTO nhacungcap (ma_ncc, ten_ncc, dia_chi, sdt, email) VALUES
('NCC01', 'Nhà cung cấp 1', 'KCN 1, Bình Dương', '0930000001', 'ncc1@company.com'),
('NCC02', 'Nhà cung cấp 2', 'KCN 2, Bình Dương', '0930000002', 'ncc2@company.com'),
('NCC03', 'Nhà cung cấp 3', 'KCN 3, Bình Dương', '0930000003', 'ncc3@company.com'),
('NCC04', 'Nhà cung cấp 4', 'KCN 4, Bình Dương', '0930000004', 'ncc4@company.com'),
('NCC05', 'Nhà cung cấp 5', 'KCN 5, Bình Dương', '0930000005', 'ncc5@company.com'),
('NCC06', 'Nhà cung cấp 6', 'KCN 6, Bình Dương', '0930000006', 'ncc6@company.com'),
('NCC07', 'Nhà cung cấp 7', 'KCN 7, Bình Dương', '0930000007', 'ncc7@company.com'),
('NCC08', 'Nhà cung cấp 8', 'KCN 8, Bình Dương', '0930000008', 'ncc8@company.com'),
('NCC09', 'Nhà cung cấp 9', 'KCN 9, Bình Dương', '0930000009', 'ncc9@company.com'),
('NCC10', 'Nhà cung cấp 10', 'KCN 10, Bình Dương', '0930000010', 'ncc10@company.com'),
('NCC11', 'Nhà cung cấp 11', 'KCN 11, Bình Dương', '0930000011', 'ncc11@company.com'),
('NCC12', 'Nhà cung cấp 12', 'KCN 12, Bình Dương', '0930000012', 'ncc12@company.com'),
('NCC13', 'Nhà cung cấp 13', 'KCN 13, Bình Dương', '0930000013', 'ncc13@company.com'),
('NCC14', 'Nhà cung cấp 14', 'KCN 14, Bình Dương', '0930000014', 'ncc14@company.com'),
('NCC15', 'Nhà cung cấp 15', 'KCN 15, Bình Dương', '0930000015', 'ncc15@company.com');
INSERT INTO nhanvien (ma_nv, ho_ten_nv, ngay_sinh, gioi_tinh, dia_chi, sdt, email, ngay_vao_lam, ma_vi_tri, ma_ch) VALUES
('NV01', 'Nhân viên 1', '1999-12-13', 'Nam', 'Nhà số 1, Hà Nội', '0940000001', 'nv1@shop.com', '2023-02-05', 'VT15', 'CH05'),
('NV02', 'Nhân viên 2', '2000-02-21', 'Nữ', 'Nhà số 2, Hà Nội', '0940000002', 'nv2@shop.com', '2023-08-08', 'VT09', 'CH06'),
('NV03', 'Nhân viên 3', '1992-10-14', 'Nam', 'Nhà số 3, Hà Nội', '0940000003', 'nv3@shop.com', '2021-08-22', 'VT13', 'CH15'),
('NV04', 'Nhân viên 4', '1993-10-27', 'Nữ', 'Nhà số 4, Hà Nội', '0940000004', 'nv4@shop.com', '2021-09-02', 'VT08', 'CH15'),
('NV05', 'Nhân viên 5', '1998-06-18', 'Nam', 'Nhà số 5, Hà Nội', '0940000005', 'nv5@shop.com', '2020-04-19', 'VT13', 'CH09'),
('NV06', 'Nhân viên 6', '1992-04-19', 'Nữ', 'Nhà số 6, Hà Nội', '0940000006', 'nv6@shop.com', '2022-06-16', 'VT12', 'CH09'),
('NV07', 'Nhân viên 7', '1992-01-19', 'Nam', 'Nhà số 7, Hà Nội', '0940000007', 'nv7@shop.com', '2023-12-08', 'VT02', 'CH01'),
('NV08', 'Nhân viên 8', '1996-07-20', 'Nữ', 'Nhà số 8, Hà Nội', '0940000008', 'nv8@shop.com', '2023-12-24', 'VT06', 'CH07'),
('NV09', 'Nhân viên 9', '1995-06-21', 'Nữ', 'Nhà số 9, Hà Nội', '0940000009', 'nv9@shop.com', '2023-05-07', 'VT08', 'CH09'),
('NV10', 'Nhân viên 10', '1991-03-25', 'Nam', 'Nhà số 10, Hà Nội', '0940000010', 'nv10@shop.com', '2023-05-15', 'VT01', 'CH10'),
('NV11', 'Nhân viên 11', '1993-03-06', 'Nữ', 'Nhà số 11, Hà Nội', '0940000011', 'nv11@shop.com', '2023-06-24', 'VT14', 'CH14'),
('NV12', 'Nhân viên 12', '1994-09-07', 'Nam', 'Nhà số 12, Hà Nội', '0940000012', 'nv12@shop.com', '2021-12-23', 'VT09', 'CH11'),
('NV13', 'Nhân viên 13', '1991-07-21', 'Nam', 'Nhà số 13, Hà Nội', '0940000013', 'nv13@shop.com', '2023-01-19', 'VT07', 'CH02'),
('NV14', 'Nhân viên 14', '1992-10-01', 'Nữ', 'Nhà số 14, Hà Nội', '0940000014', 'nv14@shop.com', '2020-03-09', 'VT01', 'CH05'),
('NV15', 'Nhân viên 15', '1995-03-16', 'Nữ', 'Nhà số 15, Hà Nội', '0940000015', 'nv15@shop.com', '2021-05-19', 'VT12', 'CH05');
INSERT INTO sanpham (ma_sp, ten_sp, danh_muc, chat_lieu, mua_vu, gioi_tinh, ma_ncc) VALUES
('SP001', 'Sản phẩm thời trang 1', 'Áo thun', 'Len', 'Quanh năm', 'Nam', 'NCC12'),
('SP002', 'Sản phẩm thời trang 2', 'Giày', 'Da', 'Xuân Hè', 'Nữ', 'NCC09'),
('SP003', 'Sản phẩm thời trang 3', 'Giày', 'Polyester', 'Xuân Hè', 'Nữ', 'NCC11'),
('SP004', 'Sản phẩm thời trang 4', 'Giày', 'Cotton', 'Quanh năm', 'Nữ', 'NCC02'),
('SP005', 'Sản phẩm thời trang 5', 'Áo khoác', 'Len', 'Quanh năm', 'Unisex', 'NCC01'),
('SP006', 'Sản phẩm thời trang 6', 'Áo khoác', 'Cotton', 'Thu Đông', 'Nam', 'NCC12'),
('SP007', 'Sản phẩm thời trang 7', 'Áo thun', 'Da', 'Quanh năm', 'Nữ', 'NCC09'),
('SP008', 'Sản phẩm thời trang 8', 'Váy', 'Lụa', 'Xuân Hè', 'Nữ', 'NCC02'),
('SP009', 'Sản phẩm thời trang 9', 'Áo thun', 'Len', 'Thu Đông', 'Nam', 'NCC01'),
('SP010', 'Sản phẩm thời trang 10', 'Váy', 'Lụa', 'Xuân Hè', 'Nữ', 'NCC05'),
('SP011', 'Sản phẩm thời trang 11', 'Váy', 'Cotton', 'Xuân Hè', 'Unisex', 'NCC08'),
('SP012', 'Sản phẩm thời trang 12', 'Áo thun', 'Da', 'Thu Đông', 'Nam', 'NCC13'),
('SP013', 'Sản phẩm thời trang 13', 'Áo thun', 'Lụa', 'Xuân Hè', 'Nữ', 'NCC09'),
('SP014', 'Sản phẩm thời trang 14', 'Áo thun', 'Polyester', 'Quanh năm', 'Unisex', 'NCC10'),
('SP015', 'Sản phẩm thời trang 15', 'Giày', 'Cotton', 'Quanh năm', 'Unisex', 'NCC09');
INSERT INTO bienthesku (ma_sku, ma_sp, mau_sac, kich_co, gia_ban, so_luong_ton) VALUES
('SKU-SP001-Trắng-XL', 'SP001', 'Trắng', 'XL', 570000, 36),
('SKU-SP002-Đỏ-XL', 'SP002', 'Đỏ', 'XL', 680000, 41),
('SKU-SP003-Đỏ-M', 'SP003', 'Xanh dương', 'XL', 410000, 70),
('SKU-SP004-Đen-S', 'SP004', 'Trắng', 'M', 550000, 42),
('SKU-SP005-Trắng-M', 'SP005', 'Vàng', 'XL', 850000, 12),
('SKU-SP006-Vàng-M', 'SP006', 'Trắng', 'Freesize', 120000, 72),
('SKU-SP007-Đen-XL', 'SP007', 'Vàng', 'M', 450000, 42),
('SKU-SP008-Đỏ-S', 'SP008', 'Xanh dương', 'L', 910000, 93),
('SKU-SP009-Đỏ-M', 'SP009', 'Vàng', 'L', 170000, 53),
('SKU-SP010-Đen-Freesize', 'SP010', 'Vàng', 'S', 190000, 73),
('SKU-SP011-Vàng-L', 'SP011', 'Đen', 'XL', 300000, 79),
('SKU-SP012-Vàng-Freesize', 'SP012', 'Đen', 'Freesize', 420000, 64),
('SKU-SP013-Trắng-S', 'SP013', 'Đỏ', 'M', 810000, 96),
('SKU-SP014-Vàng-M', 'SP014', 'Đen', 'Freesize', 860000, 30),
('SKU-SP015-Đỏ-M', 'SP015', 'Đỏ', 'L', 430000, 63);
INSERT INTO phieunhap (ma_pn, ngay_nhap, tong_tien, ma_ncc, ma_nv) VALUES
('PN001', '2023-04-24', 3750000, 'NCC06', 'NV11'),
('PN002', '2023-06-28', 4480000, 'NCC14', 'NV09'),
('PN003', '2023-06-20', 3000000, 'NCC08', 'NV01'),
('PN004', '2023-08-03', 4950000, 'NCC14', 'NV05'),
('PN005', '2023-11-10', 12600000, 'NCC15', 'NV09'),
('PN006', '2023-05-13', 4000000, 'NCC08', 'NV05'),
('PN007', '2023-03-17', 1050000, 'NCC13', 'NV02'),
('PN008', '2023-05-12', 5400000, 'NCC09', 'NV08'),
('PN009', '2023-07-25', 13500000, 'NCC10', 'NV08'),
('PN010', '2023-03-11', 5880000, 'NCC07', 'NV11'),
('PN011', '2023-08-21', 8400000, 'NCC10', 'NV04'),
('PN012', '2023-05-22', 7000000, 'NCC14', 'NV08'),
('PN013', '2023-04-28', 4840000, 'NCC01', 'NV09'),
('PN014', '2023-10-24', 12600000, 'NCC04', 'NV14'),
('PN015', '2023-11-24', 6270000, 'NCC07', 'NV04');
INSERT INTO chitietphieunhap (ma_pn, ma_sku, so_luong, gia_nhap) VALUES
('PN001', 'SKU-SP001-Trắng-XL', 15, 250000),
('PN002', 'SKU-SP002-Đỏ-XL', 14, 320000),
('PN003', 'SKU-SP003-Đỏ-M', 50, 60000),
('PN004', 'SKU-SP004-Đen-S', 11, 450000),
('PN005', 'SKU-SP005-Trắng-M', 28, 450000),
('PN006', 'SKU-SP006-Vàng-M', 50, 80000),
('PN007', 'SKU-SP007-Đen-XL', 21, 50000),
('PN008', 'SKU-SP008-Đỏ-S', 20, 270000),
('PN009', 'SKU-SP009-Đỏ-M', 50, 270000),
('PN010', 'SKU-SP010-Đen-Freesize', 12, 490000),
('PN011', 'SKU-SP011-Vàng-L', 30, 280000),
('PN012', 'SKU-SP012-Vàng-Freesize', 50, 140000),
('PN013', 'SKU-SP013-Trắng-S', 11, 440000),
('PN014', 'SKU-SP014-Vàng-M', 36, 350000),
('PN015', 'SKU-SP015-Đỏ-M', 19, 330000);
INSERT INTO hoadon (ma_hd, ngay_tao, tong_tien, phuong_thuc_thanh_toan, trang_thai, ma_kh, ma_nv) VALUES
('HD001', '2023-01-09', 570000, 'Tiền mặt', 'Đã hủy', 'KH01', 'NV08'),
('HD002', '2023-04-17', 2720000, 'Thẻ tín dụng', 'Đã hủy', 'KH08', 'NV02'),
('HD003', '2023-01-02', 1640000, 'Chuyển khoản', 'Hoàn thành', 'KH01', 'NV13'),
('HD004', '2023-02-11', 1650000, 'Chuyển khoản', 'Đang xử lý', 'KH12', 'NV13'),
('HD005', '2023-05-01', 1700000, 'Tiền mặt', 'Đang xử lý', 'KH11', 'NV10'),
('HD006', '2023-08-17', 360000, 'Tiền mặt', 'Đang xử lý', 'KH02', 'NV10'),
('HD007', '2023-08-15', 900000, 'Tiền mặt', 'Đã hủy', 'KH03', 'NV10'),
('HD008', '2023-05-19', 3640000, 'Chuyển khoản', 'Hoàn thành', 'KH15', 'NV07'),
('HD009', '2023-04-22', 680000, 'Tiền mặt', 'Đã hủy', 'KH05', 'NV01'),
('HD010', '2023-12-11', 950000, 'Chuyển khoản', 'Đang xử lý', 'KH08', 'NV01'),
('HD011', '2023-11-05', 1500000, 'Tiền mặt', 'Đã hủy', 'KH06', 'NV08'),
('HD012', '2023-01-03', 1260000, 'Tiền mặt', 'Đã hủy', 'KH11', 'NV02'),
('HD013', '2023-10-28', 1620000, 'Ví điện tử', 'Đang xử lý', 'KH06', 'NV07'),
('HD014', '2023-10-27', 860000, 'Ví điện tử', 'Đã hủy', 'KH09', 'NV15'),
('HD015', '2023-09-26', 1290000, 'Ví điện tử', 'Đang xử lý', 'KH05', 'NV11');
INSERT INTO chitiethoadon (ma_hd, ma_sku, so_luong, gia_ban) VALUES
('HD001', 'SKU-SP001-Trắng-XL', 1, 570000),
('HD002', 'SKU-SP002-Đỏ-XL', 4, 680000),
('HD003', 'SKU-SP003-Đỏ-M', 4, 410000),
('HD004', 'SKU-SP004-Đen-S', 3, 550000),
('HD005', 'SKU-SP005-Trắng-M', 2, 850000),
('HD006', 'SKU-SP006-Vàng-M', 3, 120000),
('HD007', 'SKU-SP007-Đen-XL', 2, 450000),
('HD008', 'SKU-SP008-Đỏ-S', 4, 910000),
('HD009', 'SKU-SP009-Đỏ-M', 4, 170000),
('HD010', 'SKU-SP010-Đen-Freesize', 5, 190000),
('HD011', 'SKU-SP011-Vàng-L', 5, 300000),
('HD012', 'SKU-SP012-Vàng-Freesize', 3, 420000),
('HD013', 'SKU-SP013-Trắng-S', 2, 810000),
('HD014', 'SKU-SP014-Vàng-M', 1, 860000),
('HD015', 'SKU-SP015-Đỏ-M', 3, 430000);