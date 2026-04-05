from pydantic import BaseModel, ConfigDict
from datetime import date

class HoaDonBase(BaseModel):
    ma_hd: str
    tong_tien: float
    phuong_thuc_thanh_toan: str
    trang_thai: str
    ma_kh: str
    ma_nv: str

class HoaDonCreate(HoaDonBase):
    ngay_tao: date

class HoaDon(HoaDonBase):
    ngay_tao: date
    model_config = ConfigDict(from_attributes=True)
