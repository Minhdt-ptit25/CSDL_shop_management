from pydantic import BaseModel, ConfigDict

class BienTheSKUBase(BaseModel):
    ma_sku: str
    ma_sp: str
    mau_sac: str
    kich_co: str
    gia_ban: float
    so_luong_ton: int = 0

class BienTheSKUCreate(BienTheSKUBase):
    pass

class BienTheSKU(BienTheSKUBase):
    model_config = ConfigDict(from_attributes=True)
