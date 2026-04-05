from sqlalchemy.orm import Session
from core.database import SessionLocal, engine, Base
from models import (
    CuaHang, ViTri, NhanVien, KhachHang, NhaCungCap, 
    SanPham, BienTheSKU, PhieuNhap, ChiTietPhieuNhap, 
    HoaDon, ChiTietHoaDon
)
from datetime import date

def init_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db: Session = SessionLocal()
    
    # Check if data exists
    if db.query(CuaHang).first():
        print("Data already exists. Exiting...")
        return

    print("Inserting data...")
    # CuaHang
    ch1 = CuaHang(ma_ch="CH01", ten_ch="Chi nhánh 1", dia_chi="Hà Nội", sdt="0123456789", email="ch01@gmail.com")
    db.add(ch1)

    # ViTri
    vt1 = ViTri(ma_vi_tri="VT01", ten_chuc_vu="Quản lý", luong=15000000)
    db.add(vt1)

    # NhaCungCap
    ncc1 = NhaCungCap(ma_ncc="NCC01", ten_ncc="Xưởng Dệt Hà Nội", dia_chi="Hà Nội", sdt="0901234567", email="ncc1@gmail.com")
    db.add(ncc1)

    # KhachHang
    kh1 = KhachHang(ma_kh="KH001", ho_ten_kh="Nguyễn Văn A", dia_chi="Hà Nội", sdt="0987654321", email="nva@gmail.com", diem_tich_luy=50, hang_thanh_vien="Vàng")
    db.add(kh1)
    
    db.commit()

    # NhanVien
    nv1 = NhanVien(
        ma_nv="NV01", ho_ten_nv="Trần B", ngay_sinh=date(1990, 1, 1), gioi_tinh="Nam", 
        dia_chi="Hà Nội", sdt="0911223344", email="tranb@gmail.com", 
        ngay_vao_lam=date(2020, 1, 1), ma_vi_tri="VT01", ma_ch="CH01"
    )
    db.add(nv1)
    db.commit()

    # SanPham
    sp1 = SanPham(ma_sp="SP001", ten_sp="Áo Polo Basic", danh_muc="Áo Nam", chat_lieu="Cotton", mua_vu="Xuân Hè", gioi_tinh="Nam", ma_ncc="NCC01")
    db.add(sp1)
    db.commit()

    # BienTheSKU
    sku1 = BienTheSKU(ma_sku="SP001-DEN-M", ma_sp="SP001", mau_sac="Đen", kich_co="M", gia_ban=250000, so_luong_ton=50)
    sku2 = BienTheSKU(ma_sku="SP001-DEN-L", ma_sp="SP001", mau_sac="Đen", kich_co="L", gia_ban=250000, so_luong_ton=30)
    db.add_all([sku1, sku2])
    db.commit()

    # HoaDon
    hd1 = HoaDon(ma_hd="HD001", ngay_tao=date.today(), tong_tien=500000, phuong_thuc_thanh_toan="Tiền mặt", trang_thai="Hoàn thành", ma_kh="KH001", ma_nv="NV01")
    db.add(hd1)
    db.commit()

    # ChiTietHoaDon
    ct_hd1 = ChiTietHoaDon(ma_hd="HD001", ma_sku="SP001-DEN-M", so_luong=2, gia_ban=250000)
    db.add(ct_hd1)
    db.commit()

    print("Database initialization complete.")

if __name__ == "__main__":
    init_db()
