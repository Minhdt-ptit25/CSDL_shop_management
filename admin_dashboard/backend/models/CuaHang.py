from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from core.database import Base

class CuaHang(Base):
    __tablename__ = "cuahang"
    ma_ch = Column(String(10), primary_key=True, index=True)
    ten_ch = Column(String(100), nullable=False)
    dia_chi = Column(String(200), nullable=False)
    sdt = Column(String(15), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)

    nhanviens = relationship("NhanVien", back_populates="cuahang")
