from sqlalchemy import Column, String, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base

class PhieuNhap(Base):
    __tablename__ = "phieunhap"
    ma_pn = Column(String(10), primary_key=True, index=True)
    ngay_nhap = Column(Date, nullable=False)
    tong_tien = Column(Numeric(15, 2), nullable=False)
    ma_ncc = Column(String(10), ForeignKey('nhacungcap.ma_ncc'), nullable=False)
    ma_nv = Column(String(10), ForeignKey('nhanvien.ma_nv'), nullable=False)

    nhacungcap = relationship("NhaCungCap", back_populates="phieunhaps")
    nhanvien = relationship("NhanVien", back_populates="phieunhaps")
