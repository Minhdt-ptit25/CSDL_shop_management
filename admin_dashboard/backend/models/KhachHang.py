from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from core.database import Base

class KhachHang(Base):
    __tablename__ = "khachhang"
    ma_kh = Column(String(20), primary_key=True, index=True)
    ho_ten_kh = Column(String(100), nullable=False)
    dia_chi = Column(String(200), nullable=False)
    sdt = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    diem_tich_luy = Column(Integer, default=0)
    hang_thanh_vien = Column(String(50), nullable=False, default='Thành viên mới')

    hoadons = relationship("HoaDon", back_populates="khachhang")
