from sqlalchemy import Column, String, Integer, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class ChiTietHoaDon(Base):
    __tablename__ = "chitiethoadon"
    ma_hd = Column(String(10), ForeignKey('hoadon.ma_hd'), primary_key=True)
    ma_sku = Column(String(30), ForeignKey('bienthesku.ma_sku'), primary_key=True)
    so_luong = Column(Integer, nullable=False)
    gia_ban = Column(Numeric(15, 2), nullable=False)

    hoadon = relationship("HoaDon", back_populates="chitiet")
