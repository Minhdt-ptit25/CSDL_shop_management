-- CreateTable
CREATE TABLE `vitri` (
    `ma_vi_tri` VARCHAR(191) NOT NULL,
    `ten_chuc_vu` VARCHAR(191) NOT NULL,
    `luong` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`ma_vi_tri`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cuahang` (
    `ma_ch` VARCHAR(191) NOT NULL,
    `ten_ch` VARCHAR(191) NOT NULL,
    `dia_chi` VARCHAR(191) NOT NULL,
    `sdt` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `cuahang_sdt_key`(`sdt`),
    UNIQUE INDEX `cuahang_email_key`(`email`),
    PRIMARY KEY (`ma_ch`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hang_thanh_vien` (
    `ten_hang` VARCHAR(191) NOT NULL,
    `diem_toithieu` INTEGER NOT NULL DEFAULT 0,
    `phan_tram_uudai` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`ten_hang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `khachhang` (
    `ma_kh` VARCHAR(191) NOT NULL,
    `ho_ten_kh` VARCHAR(191) NOT NULL,
    `dia_chi` VARCHAR(191) NULL,
    `sdt` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `diem_tich_luy` INTEGER NOT NULL DEFAULT 0,
    `ten_hang` VARCHAR(191) NOT NULL DEFAULT 'Vô hạng',

    UNIQUE INDEX `khachhang_sdt_key`(`sdt`),
    PRIMARY KEY (`ma_kh`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `voucher` (
    `ma_voucher` VARCHAR(191) NOT NULL,
    `mo_ta` VARCHAR(191) NULL,
    `phan_tram_giam` INTEGER NOT NULL DEFAULT 0,
    `so_tien_giam_toida` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `gia_tri_don_toithieu` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `ngay_bat_dau` DATETIME(3) NOT NULL,
    `ngay_het_han` DATETIME(3) NOT NULL,
    `so_luong_phat_hanh` INTEGER NOT NULL DEFAULT 0,
    `so_luong_da_dung` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`ma_voucher`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nhacungcap` (
    `ma_ncc` VARCHAR(191) NOT NULL,
    `ten_ncc` VARCHAR(191) NOT NULL,
    `dia_chi` VARCHAR(191) NOT NULL,
    `sdt` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `nhacungcap_sdt_key`(`sdt`),
    UNIQUE INDEX `nhacungcap_email_key`(`email`),
    PRIMARY KEY (`ma_ncc`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `nhanvien` (
    `ma_nv` VARCHAR(191) NOT NULL,
    `ho_ten_nv` VARCHAR(191) NOT NULL,
    `ngay_sinh` DATETIME(3) NOT NULL,
    `gioi_tinh` VARCHAR(191) NOT NULL,
    `dia_chi` VARCHAR(191) NOT NULL,
    `sdt` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `ngay_vao_lam` DATETIME(3) NOT NULL,
    `ma_vi_tri` VARCHAR(191) NOT NULL,
    `ma_ch` VARCHAR(191) NOT NULL,
    `ten_dang_nhap` VARCHAR(191) NOT NULL,
    `mat_khau_hash` VARCHAR(191) NOT NULL,
    `vai_tro` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `nhanvien_sdt_key`(`sdt`),
    UNIQUE INDEX `nhanvien_email_key`(`email`),
    UNIQUE INDEX `nhanvien_ten_dang_nhap_key`(`ten_dang_nhap`),
    PRIMARY KEY (`ma_nv`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sanpham` (
    `ma_sp` VARCHAR(191) NOT NULL,
    `ten_sp` VARCHAR(191) NOT NULL,
    `danh_muc` VARCHAR(191) NOT NULL,
    `chat_lieu` VARCHAR(191) NOT NULL,
    `gioi_tinh` VARCHAR(191) NOT NULL,
    `ma_ncc` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ma_sp`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `bienthesku` (
    `ma_sku` VARCHAR(191) NOT NULL,
    `ma_sp` VARCHAR(191) NOT NULL,
    `mau_sac` VARCHAR(191) NOT NULL,
    `kich_co` VARCHAR(191) NOT NULL,
    `gia_ban` DECIMAL(65, 30) NOT NULL,
    `so_luong_ton` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`ma_sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `phieunhap` (
    `ma_pn` VARCHAR(191) NOT NULL,
    `ngay_nhap` DATETIME(3) NOT NULL,
    `tong_tien` DECIMAL(65, 30) NOT NULL,
    `ma_ncc` VARCHAR(191) NOT NULL,
    `ma_nv` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`ma_pn`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `hoadon` (
    `ma_hd` VARCHAR(191) NOT NULL,
    `ngay_tao` DATETIME(3) NOT NULL,
    `tong_tien_truoc_giam` DECIMAL(65, 30) NOT NULL,
    `giam_gia_hang` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `giam_gia_voucher` DECIMAL(65, 30) NOT NULL DEFAULT 0,
    `tong_tien_sau_giam` DECIMAL(65, 30) NOT NULL,
    `phuong_thuc_thanh_toan` VARCHAR(191) NOT NULL,
    `trang_thai` VARCHAR(191) NOT NULL,
    `ma_kh` VARCHAR(191) NOT NULL,
    `ma_nv` VARCHAR(191) NOT NULL,
    `ma_voucher` VARCHAR(191) NULL,

    PRIMARY KEY (`ma_hd`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitiethoadon` (
    `ma_hd` VARCHAR(191) NOT NULL,
    `ma_sku` VARCHAR(191) NOT NULL,
    `so_luong` INTEGER NOT NULL,
    `gia_ban` DECIMAL(65, 30) NOT NULL,
    `thanh_tien` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`ma_hd`, `ma_sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chitietphieunhap` (
    `ma_pn` VARCHAR(191) NOT NULL,
    `ma_sku` VARCHAR(191) NOT NULL,
    `so_luong` INTEGER NOT NULL,
    `gia_nhap` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`ma_pn`, `ma_sku`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `delete_request` (
    `id` VARCHAR(191) NOT NULL,
    `ma_hd` VARCHAR(191) NOT NULL,
    `ma_nv_cashier` VARCHAR(191) NOT NULL,
    `ly_do` VARCHAR(191) NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `trang_thai` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `ngay_xu_ly` DATETIME(3) NULL,
    `ghi_chu` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `product_delete_request` (
    `id` VARCHAR(191) NOT NULL,
    `ma_sp` VARCHAR(191) NOT NULL,
    `ma_nv_warehouse` VARCHAR(191) NOT NULL,
    `ly_do` VARCHAR(191) NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `trang_thai` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `ngay_xu_ly` DATETIME(3) NULL,
    `ghi_chu` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cart_item_delete_request` (
    `id` VARCHAR(191) NOT NULL,
    `ma_nv_cashier` VARCHAR(191) NOT NULL,
    `ma_sku` VARCHAR(191) NOT NULL,
    `ly_do` VARCHAR(191) NULL,
    `ngay_tao` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `trang_thai` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `ngay_xu_ly` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `khachhang` ADD CONSTRAINT `khachhang_ten_hang_fkey` FOREIGN KEY (`ten_hang`) REFERENCES `hang_thanh_vien`(`ten_hang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nhanvien` ADD CONSTRAINT `nhanvien_ma_vi_tri_fkey` FOREIGN KEY (`ma_vi_tri`) REFERENCES `vitri`(`ma_vi_tri`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `nhanvien` ADD CONSTRAINT `nhanvien_ma_ch_fkey` FOREIGN KEY (`ma_ch`) REFERENCES `cuahang`(`ma_ch`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sanpham` ADD CONSTRAINT `sanpham_ma_ncc_fkey` FOREIGN KEY (`ma_ncc`) REFERENCES `nhacungcap`(`ma_ncc`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `bienthesku` ADD CONSTRAINT `bienthesku_ma_sp_fkey` FOREIGN KEY (`ma_sp`) REFERENCES `sanpham`(`ma_sp`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieunhap` ADD CONSTRAINT `phieunhap_ma_ncc_fkey` FOREIGN KEY (`ma_ncc`) REFERENCES `nhacungcap`(`ma_ncc`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `phieunhap` ADD CONSTRAINT `phieunhap_ma_nv_fkey` FOREIGN KEY (`ma_nv`) REFERENCES `nhanvien`(`ma_nv`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hoadon` ADD CONSTRAINT `hoadon_ma_kh_fkey` FOREIGN KEY (`ma_kh`) REFERENCES `khachhang`(`ma_kh`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hoadon` ADD CONSTRAINT `hoadon_ma_nv_fkey` FOREIGN KEY (`ma_nv`) REFERENCES `nhanvien`(`ma_nv`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `hoadon` ADD CONSTRAINT `hoadon_ma_voucher_fkey` FOREIGN KEY (`ma_voucher`) REFERENCES `voucher`(`ma_voucher`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitiethoadon` ADD CONSTRAINT `chitiethoadon_ma_hd_fkey` FOREIGN KEY (`ma_hd`) REFERENCES `hoadon`(`ma_hd`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitiethoadon` ADD CONSTRAINT `chitiethoadon_ma_sku_fkey` FOREIGN KEY (`ma_sku`) REFERENCES `bienthesku`(`ma_sku`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieunhap` ADD CONSTRAINT `chitietphieunhap_ma_pn_fkey` FOREIGN KEY (`ma_pn`) REFERENCES `phieunhap`(`ma_pn`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chitietphieunhap` ADD CONSTRAINT `chitietphieunhap_ma_sku_fkey` FOREIGN KEY (`ma_sku`) REFERENCES `bienthesku`(`ma_sku`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delete_request` ADD CONSTRAINT `delete_request_ma_hd_fkey` FOREIGN KEY (`ma_hd`) REFERENCES `hoadon`(`ma_hd`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delete_request` ADD CONSTRAINT `delete_request_ma_nv_cashier_fkey` FOREIGN KEY (`ma_nv_cashier`) REFERENCES `nhanvien`(`ma_nv`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_delete_request` ADD CONSTRAINT `product_delete_request_ma_sp_fkey` FOREIGN KEY (`ma_sp`) REFERENCES `sanpham`(`ma_sp`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_delete_request` ADD CONSTRAINT `product_delete_request_ma_nv_warehouse_fkey` FOREIGN KEY (`ma_nv_warehouse`) REFERENCES `nhanvien`(`ma_nv`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart_item_delete_request` ADD CONSTRAINT `cart_item_delete_request_ma_nv_cashier_fkey` FOREIGN KEY (`ma_nv_cashier`) REFERENCES `nhanvien`(`ma_nv`) ON DELETE RESTRICT ON UPDATE CASCADE;
