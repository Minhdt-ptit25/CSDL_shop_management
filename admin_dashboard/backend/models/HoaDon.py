from sqlalchemy import Column, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class HoaDon(Base):
    __tablename__ = "hoadon"
    ma_hd = Column(String(10), primary_key=True, index=True)
    ngay_tao = Column(Date, nullable=False)
    tong_tien = Column(Numeric(15, 2), nullable=False)
    phuong_thuc_thanh_toan = Column(String(50), nullable=False)
    trang_thai = Column(String(20), nullable=False)
    ma_kh = Column(String(20), ForeignKey('khachhang.ma_kh'), nullable=False)
    ma_nv = Column(String(10), ForeignKey('nhanvien.ma_nv'), nullable=False)

    khachhang = relationship("KhachHang", back_populates="hoadons")
    nhanvien = relationship("NhanVien", back_populates="hoadons")
    chitiet = relationship("ChiTietHoaDon", back_populates="hoadon")
