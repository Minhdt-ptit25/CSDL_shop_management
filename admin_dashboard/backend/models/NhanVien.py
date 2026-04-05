from sqlalchemy import Column, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class NhanVien(Base):
    __tablename__ = "nhanvien"
    ma_nv = Column(String(10), primary_key=True, index=True)
    ho_ten_nv = Column(String(100), nullable=False)
    ngay_sinh = Column(Date, nullable=False)
    gioi_tinh = Column(String(10), nullable=False)
    dia_chi = Column(String(200), nullable=False)
    sdt = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    ngay_vao_lam = Column(Date, nullable=False)
    ma_vi_tri = Column(String(10), ForeignKey('vitri.ma_vi_tri'), nullable=False)
    ma_ch = Column(String(10), ForeignKey('cuahang.ma_ch'), nullable=False)

    vitri = relationship("ViTri", back_populates="nhanviens")
    cuahang = relationship("CuaHang", back_populates="nhanviens")
    phieunhaps = relationship("PhieuNhap", back_populates="nhanvien")
    hoadons = relationship("HoaDon", back_populates="nhanvien")
