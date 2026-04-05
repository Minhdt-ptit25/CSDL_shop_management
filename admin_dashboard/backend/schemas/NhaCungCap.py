from pydantic import BaseModel, ConfigDict

class NhaCungCapBase(BaseModel):
    ma_ncc: str
    ten_ncc: str
    dia_chi: str
    sdt: str
    email: str

class NhaCungCapCreate(NhaCungCapBase):
    pass

class NhaCungCap(NhaCungCapBase):
    model_config = ConfigDict(from_attributes=True)
