from pydantic import BaseModel, ConfigDict

class SanPhamBase(BaseModel):
    ma_sp: str
    ten_sp: str
    danh_muc: str
    chat_lieu: str
    mua_vu: str
    gioi_tinh: str
    ma_ncc: str

class SanPhamCreate(SanPhamBase):
    pass

class SanPham(SanPhamBase):
    model_config = ConfigDict(from_attributes=True)
