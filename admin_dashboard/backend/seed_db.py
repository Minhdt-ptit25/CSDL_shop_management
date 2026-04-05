import sys
import os
from datetime import date

# Ensure backend folder is in sys.path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from core.database import SessionLocal, engine, Base
import models

# Create all tables if they don't exist
Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    try:
        # Vị Trí
        vt1 = models.ViTri(ma_vi_tri="VT01", ten_chuc_vu="Quản lý", luong=15000000)
        vt2 = models.ViTri(ma_vi_tri="VT02", ten_chuc_vu="Thu ngân", luong=8000000)
        
        # Cửa Hàng
        ch1 = models.CuaHang(ma_ch="CH01", ten_ch="Fashion Store Cầu Giấy", dia_chi="123 Cầu Giấy", sdt="024123456", email="caugiay@fashion.com")
        
        db.merge(vt1)
        db.merge(vt2)
        db.merge(ch1)
        db.commit()

        # Nhà Cung Cấp
        ncc1 = models.NhaCungCap(ma_ncc="NCC01", ten_ncc="Xưởng may Dệt Kim Hà Nội", sdt="0901234567", dia_chi="Hà Nội", email="detkimhn@gmail.com")
        ncc2 = models.NhaCungCap(ma_ncc="NCC02", ten_ncc="Công ty TNHH Thời Trang Nam", sdt="0987654321", dia_chi="Hồ Chí Minh", email="ttnam@gmail.com")
        db.merge(ncc1)
        db.merge(ncc2)
        db.commit()

        # Nhân Viên
        nv1 = models.NhanVien(
            ma_nv="NV01", ho_ten_nv="Trần Văn Quản", ngay_sinh=date(1990, 5, 10), gioi_tinh="Nam",
            dia_chi="Đống Đa, HN", sdt="0911223344", email="quan.tv@fashion.com",
            ngay_vao_lam=date(2020, 1, 1), ma_vi_tri="VT01", ma_ch="CH01"
        )
        nv2 = models.NhanVien(
            ma_nv="NV02", ho_ten_nv="Nguyễn Thị Thu", ngay_sinh=date(1998, 8, 20), gioi_tinh="Nữ",
            dia_chi="Cầu Giấy, HN", sdt="0922334455", email="thu.nt@fashion.com",
            ngay_vao_lam=date(2023, 6, 15), ma_vi_tri="VT02", ma_ch="CH01"
        )
        db.merge(nv1)
        db.merge(nv2)
        db.commit()

        # Khách Hàng
        kh1 = models.KhachHang(
            ma_kh="KH001", ho_ten_kh="Nguyễn Văn A", dia_chi="Hà Nội", sdt="0987654321", 
            email="nva@gmail.com", diem_tich_luy=50, hang_thanh_vien="Thành viên Bạc"
        )
        kh2 = models.KhachHang(
            ma_kh="KH002", ho_ten_kh="Trần Thị B", dia_chi="Hồ Chí Minh", sdt="0976543210", 
            email="ttb@gmail.com", diem_tich_luy=200, hang_thanh_vien="Thành viên Vàng"
        )
        db.merge(kh1)
        db.merge(kh2)
        db.commit()

        # Sản Phẩm & Biến Thể
        sp1 = models.SanPham(
            ma_sp="SP001", ten_sp="Áo thun Polo basic", danh_muc="Áo Nam", chat_lieu="Cotton 100%", 
            mua_vu="Xuân Hè", gioi_tinh="Nam", ma_ncc="NCC01"
        )
        sp2 = models.SanPham(
            ma_sp="SP002", ten_sp="Chân váy chữ A", danh_muc="Váy Nữ", chat_lieu="Khaki", 
            mua_vu="Bốn Mùa", gioi_tinh="Nữ", ma_ncc="NCC02"
        )
        db.merge(sp1)
        db.merge(sp2)
        db.commit()

        sku1 = models.BienTheSKU(ma_sku="SKU-SP1-001", ma_sp="SP001", mau_sac="Đen", kich_co="M", gia_ban=250000, so_luong_ton=50)
        sku2 = models.BienTheSKU(ma_sku="SKU-SP1-002", ma_sp="SP001", mau_sac="Trắng", kich_co="L", gia_ban=250000, so_luong_ton=30)
        sku3 = models.BienTheSKU(ma_sku="SKU-SP2-001", ma_sp="SP002", mau_sac="Kem", kich_co="S", gia_ban=300000, so_luong_ton=20)
        db.merge(sku1)
        db.merge(sku2)
        db.merge(sku3)
        db.commit()

        # Hóa Đơn
        hd1 = models.HoaDon(
            ma_hd="HD001", ngay_tao=date.today(), tong_tien=250000, phuong_thuc_thanh_toan="Tiền mặt",
            trang_thai="Đã hoàn thành", ma_kh="KH001", ma_nv="NV02"
        )
        hd2 = models.HoaDon(
            ma_hd="HD002", ngay_tao=date.today(), tong_tien=600000, phuong_thuc_thanh_toan="Chuyển khoản",
            trang_thai="Đã hoàn thành", ma_kh="KH002", ma_nv="NV02"
        )
        db.merge(hd1)
        db.merge(hd2)
        db.commit()

        print("Database seeded successfully with sample data!")
    except Exception as e:
        print("Error seeding database:", str(e))
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed()
