from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

# Import directly from the packages (now supported by __init__.py)
import schemas as schemas_mod
import models as models_mod
from core.database import get_db
from core.auth import create_access_token, get_current_admin

api_router = APIRouter()

# JWT-based admin dependency is provided by `core.auth.get_current_admin`

@api_router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    # Mock some stats for the dashboard
    total_products = db.query(models_mod.BienTheSKU).count()
    total_orders = db.query(models_mod.HoaDon).count()
    total_customers = db.query(models_mod.KhachHang).count()
    
    # Calculate revenue
    hoadons = db.query(models_mod.HoaDon).all()
    revenue = sum([float(hd.tong_tien) for hd in hoadons])

    return {
        "total_revenue": revenue,
        "total_orders": total_orders,
        "total_products": total_products,
        "total_customers": total_customers
    }

@api_router.get("/products", response_model=List[schemas_mod.SanPham])
def read_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    products = db.query(models_mod.SanPham).offset(skip).limit(limit).all()
    return products

@api_router.get("/customers", response_model=List[schemas_mod.KhachHang])
def read_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    customers = db.query(models_mod.KhachHang).offset(skip).limit(limit).all()
    return customers

@api_router.get("/orders", response_model=List[schemas_mod.HoaDon])
def read_orders(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    orders = db.query(models_mod.HoaDon).offset(skip).limit(limit).all()
    return orders

@api_router.get("/employees", response_model=List[schemas_mod.NhanVien])
def read_employees(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models_mod.NhanVien).offset(skip).limit(limit).all()

@api_router.get("/suppliers", response_model=List[schemas_mod.NhaCungCap])
def read_suppliers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models_mod.NhaCungCap).offset(skip).limit(limit).all()

# ================= LOGIN =================
@api_router.post("/login")
def login(req: schemas_mod.LoginRequest):
    if req.username == "admin" and req.password == "12345":
        access_token = create_access_token({"sub": "admin"})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "success": True,
            "message": "Login successful"
        }
    raise HTTPException(status_code=401, detail="Invalid username or password")

# ================= CRUD PRODUCTS =================
@api_router.post("/products", response_model=schemas_mod.SanPham)
def create_product(product: schemas_mod.SanPhamCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_product = models_mod.SanPham(**product.model_dump())
    db.add(db_product)
    try:
        db.commit()
        db.refresh(db_product)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_product

@api_router.put("/products/{ma_sp}", response_model=schemas_mod.SanPham)
def update_product(ma_sp: str, product_update: schemas_mod.SanPhamCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_product = db.query(models_mod.SanPham).filter(models_mod.SanPham.ma_sp == ma_sp).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product_update.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@api_router.delete("/products/{ma_sp}")
def delete_product(ma_sp: str, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_product = db.query(models_mod.SanPham).filter(models_mod.SanPham.ma_sp == ma_sp).first()
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"}

# ================= CRUD CUSTOMERS =================
@api_router.post("/customers", response_model=schemas_mod.KhachHang)
def create_customer(customer: schemas_mod.KhachHangCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_customer = models_mod.KhachHang(**customer.model_dump())
    db.add(db_customer)
    try:
        db.commit()
        db.refresh(db_customer)
    except:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot create customer")
    return db_customer

@api_router.put("/customers/{ma_kh}", response_model=schemas_mod.KhachHang)
def update_customer(ma_kh: str, customer_update: schemas_mod.KhachHangCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_customer = db.query(models_mod.KhachHang).filter(models_mod.KhachHang.ma_kh == ma_kh).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    for key, value in customer_update.model_dump().items():
        setattr(db_customer, key, value)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@api_router.delete("/customers/{ma_kh}")
def delete_customer(ma_kh: str, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_customer = db.query(models_mod.KhachHang).filter(models_mod.KhachHang.ma_kh == ma_kh).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}

# ================= CRUD ORDERS =================
@api_router.post("/orders", response_model=schemas_mod.HoaDon)
def create_order(order: schemas_mod.HoaDonCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_order = models_mod.HoaDon(**order.model_dump())
    db.add(db_order)
    try:
        db.commit()
        db.refresh(db_order)
    except:
        db.rollback()
        raise HTTPException(status_code=400, detail="Cannot create order")
    return db_order

@api_router.delete("/orders/{ma_hd}")
def delete_order(ma_hd: str, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_order = db.query(models_mod.HoaDon).filter(models_mod.HoaDon.ma_hd == ma_hd).first()
    if not db_order:
        raise HTTPException(status_code=404, detail="Order not found")
    db.delete(db_order)
    db.commit()
    return {"message": "Order deleted successfully"}

# ================= CRUD EMPLOYEES =================
@api_router.post("/employees", response_model=schemas_mod.NhanVien)
def create_employee(employee: schemas_mod.NhanVienCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_emp = models_mod.NhanVien(**employee.model_dump())
    db.add(db_emp)
    try:
        db.commit()
        db.refresh(db_emp)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_emp

@api_router.delete("/employees/{ma_nv}")
def delete_employee(ma_nv: str, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_emp = db.query(models_mod.NhanVien).filter(models_mod.NhanVien.ma_nv == ma_nv).first()
    if not db_emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_emp)
    db.commit()
    return {"message": "Employee deleted"}

# ================= CRUD SUPPLIERS =================
@api_router.post("/suppliers", response_model=schemas_mod.NhaCungCap)
def create_supplier(supplier: schemas_mod.NhaCungCapCreate, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_sup = models_mod.NhaCungCap(**supplier.model_dump())
    db.add(db_sup)
    try:
        db.commit()
        db.refresh(db_sup)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
    return db_sup

@api_router.delete("/suppliers/{ma_ncc}")
def delete_supplier(ma_ncc: str, db: Session = Depends(get_db), admin: dict = Depends(get_current_admin)):
    db_sup = db.query(models_mod.NhaCungCap).filter(models_mod.NhaCungCap.ma_ncc == ma_ncc).first()
    if not db_sup:
        raise HTTPException(status_code=404, detail="Supplier not found")
    db.delete(db_sup)
    db.commit()
    return {"message": "Supplier deleted"}
