from pydantic import BaseModel, ConfigDict
from datetime import date

class NhanVienBase(BaseModel):
    ma_nv: str
    ho_ten_nv: str
    ngay_sinh: date
    gioi_tinh: str
    dia_chi: str
    sdt: str
    email: str
    ngay_vao_lam: date
    ma_vi_tri: str
    ma_ch: str

class NhanVienCreate(NhanVienBase):
    pass

class NhanVien(NhanVienBase):
    model_config = ConfigDict(from_attributes=True)
