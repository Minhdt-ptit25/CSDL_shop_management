from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class BienTheSKU(Base):
    __tablename__ = "bienthesku"
    ma_sku = Column(String(30), primary_key=True, index=True)
    ma_sp = Column(String(10), ForeignKey('sanpham.ma_sp'), nullable=False)
    mau_sac = Column(String(50), nullable=False)
    kich_co = Column(String(20), nullable=False)
    gia_ban = Column(Numeric(15, 2), nullable=False)
    so_luong_ton = Column(Integer, nullable=False, default=0)

    sanpham = relationship("SanPham", back_populates="bienthes")
