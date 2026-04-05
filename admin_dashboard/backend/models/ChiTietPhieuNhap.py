from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from core.database import Base

class ChiTietPhieuNhap(Base):
    __tablename__ = "chitietphieunhap"
    ma_pn = Column(String(10), ForeignKey('phieunhap.ma_pn'), primary_key=True)
    ma_sku = Column(String(30), ForeignKey('bienthesku.ma_sku'), primary_key=True)
    so_luong = Column(Integer, nullable=False)
    gia_nhap = Column(Numeric(15, 2), nullable=False)
