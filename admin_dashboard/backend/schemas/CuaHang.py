from pydantic import BaseModel, ConfigDict

class CuaHangBase(BaseModel):
    ma_ch: str
    ten_ch: str
    dia_chi: str
    sdt: str
    email: str

class CuaHangCreate(CuaHangBase):
    pass

class CuaHang(CuaHangBase):
    model_config = ConfigDict(from_attributes=True)
