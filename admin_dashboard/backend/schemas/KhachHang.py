from pydantic import BaseModel, ConfigDict

class KhachHangBase(BaseModel):
    ma_kh: str
    ho_ten_kh: str
    dia_chi: str
    sdt: str
    email: str
    diem_tich_luy: int = 0
    hang_thanh_vien: str = 'Thành viên mới'

class KhachHangCreate(KhachHangBase):
    pass

class KhachHang(KhachHangBase):
    model_config = ConfigDict(from_attributes=True)
