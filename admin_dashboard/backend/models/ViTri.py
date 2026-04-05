from sqlalchemy import Column, String, Numeric
from sqlalchemy.orm import relationship
from core.database import Base

class ViTri(Base):
    __tablename__ = "vitri"
    ma_vi_tri = Column(String(10), primary_key=True, index=True)
    ten_chuc_vu = Column(String(50), nullable=False)
    luong = Column(Numeric(12, 2), nullable=False)

    nhanviens = relationship("NhanVien", back_populates="vitri")
