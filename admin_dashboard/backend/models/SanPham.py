from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class SanPham(Base):
    __tablename__ = "sanpham"
    ma_sp = Column(String(10), primary_key=True, index=True)
    ten_sp = Column(String(100), nullable=False)
    danh_muc = Column(String(50), nullable=False)
    chat_lieu = Column(String(100), nullable=False)
    mua_vu = Column(String(50), nullable=False)
    gioi_tinh = Column(String(10), nullable=False)
    ma_ncc = Column(String(10), ForeignKey('nhacungcap.ma_ncc'), nullable=False)

    nhacungcap = relationship("NhaCungCap", back_populates="sanphams")
    bienthes = relationship("BienTheSKU", back_populates="sanpham")
