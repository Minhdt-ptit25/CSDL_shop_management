from pydantic import BaseModel, ConfigDict

class ViTriBase(BaseModel):
    ma_vi_tri: str
    ten_chuc_vu: str
    luong: float

class ViTriCreate(ViTriBase):
    pass

class ViTri(ViTriBase):
    model_config = ConfigDict(from_attributes=True)
