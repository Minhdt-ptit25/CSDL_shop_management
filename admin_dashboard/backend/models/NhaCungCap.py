from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from core.database import Base

class NhaCungCap(Base):
    __tablename__ = "nhacungcap"
    ma_ncc = Column(String(10), primary_key=True, index=True)
    ten_ncc = Column(String(100), nullable=False)
    dia_chi = Column(String(200), nullable=False)
    sdt = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)

    sanphams = relationship("SanPham", back_populates="nhacungcap")
    phieunhaps = relationship("PhieuNhap", back_populates="nhacungcap")
