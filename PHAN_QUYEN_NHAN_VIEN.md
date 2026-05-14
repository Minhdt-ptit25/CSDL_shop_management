# Hệ Thống Phân Quyền Nhân Viên

## Tổng Quan

Hệ thống đã được cập nhật để hỗ trợ phân quyền dựa trên vai trò (Role-Based Access Control) cho ba nhóm người dùng:
- **Admin**: Toàn quyền truy cập tất cả chức năng
- **Cashier**: Tạo hóa đơn, có thể request xóa hóa đơn  
- **Warehouse**: Quản lý bảng sản phẩm

## Chi Tiết Phân Quyền

### 1. Admin
- ✅ Truy cập toàn bộ API
- ✅ Tạo/sửa/xóa nhân viên
- ✅ Tạo/sửa/xóa hóa đơn
- ✅ Xóa trực tiếp hóa đơn (DELETE /orders/:ma_hd)
- ✅ Xem danh sách yêu cầu xóa hóa đơn từ cashier
- ✅ Xác nhận hoặc từ chối yêu cầu xóa hóa đơn
- ✅ Quản lý sản phẩm, voucher, khách hàng, nhà cung cấp, phiếu nhập

### 2. Cashier
- ✅ Tạo hóa đơn
  - Mã nhân viên (ma_nv) được tự động lấy từ token đăng nhập
- ✅ Xem danh sách hóa đơn
- ✅ Xem chi tiết hóa đơn
- ✅ Request xóa hóa đơn (trong trường hợp lỗi)
  - Gửi yêu cầu đến admin thay vì xóa trực tiếp
- ❌ Xóa trực tiếp hóa đơn
- ❌ Quản lý nhân viên/sản phẩm
- ❌ Truy cập các chức năng quản lý

### 3. Warehouse
- ✅ Tạo/sửa sản phẩm
- ✅ Xem danh sách sản phẩm
- ❌ Xóa sản phẩm
- ❌ Tạo/sửa/xóa hóa đơn
- ❌ Quản lý nhân viên

## API Endpoints

### Xác Thực (Authentication)

#### POST /auth/login
Đăng nhập và nhận access token

**Request:**
```json
{
  "username": "nv001",
  "password": "12345"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "success": true,
  "user": {
    "ma_nv": "NV001",
    "ho_ten": "Nguyễn Văn A",
    "vai_tro": "cashier"
  }
}
```

### Nhân Viên (Employees)

#### GET /employees/me
Xem thông tin nhân viên hiện tại (tất cả vai trò)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "ma_nv": "NV001",
  "ho_ten_nv": "Nguyễn Văn A",
  "ngay_sinh": "1990-01-15",
  "gioi_tinh": "Nam",
  "dia_chi": "123 Đường ABC",
  "sdt": "0901234567",
  "email": "nv001@example.com",
  "ngay_vao_lam": "2020-05-10",
  "ma_vi_tri": "POS",
  "ma_ch": "CH001"
}
```

#### PUT /employees/me
Cập nhật thông tin cá nhân (chỉ dia_chi, email, sdt)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "dia_chi": "456 Đường XYZ",
  "email": "new@example.com",
  "sdt": "0909876543"
}
```

#### GET /employees (Admin only)
Xem danh sách tất cả nhân viên

#### POST /employees (Admin only)
Tạo nhân viên mới

**Request:**
```json
{
  "ma_nv": "NV002",
  "ho_ten_nv": "Trần Thị B",
  "ngay_sinh": "1995-03-20",
  "gioi_tinh": "Nữ",
  "dia_chi": "789 Đường DEF",
  "sdt": "0912345678",
  "email": "nv002@example.com",
  "ngay_vao_lam": "2023-06-01",
  "ma_vi_tri": "POS",
  "ma_ch": "CH001",
  "ten_dang_nhap": "nv002",
  "vai_tro": "cashier"
}
```

### Hóa Đơn (Orders)

#### POST /orders (Admin, Cashier)
Tạo hóa đơn mới

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "ma_hd": "HD-001",
  "ngay_tao": "2026-05-14",
  "ma_kh": "KH001",
  "items": [
    {
      "ma_sku": "SKU001",
      "so_luong": 2,
      "gia_ban": 100000
    }
  ],
  "ma_voucher": "VC001",
  "phuong_thuc_thanh_toan": "Tiền mặt",
  "trang_thai": "Hoàn thành"
}
```

**Lưu ý:**
- `ma_nv` tự động được lấy từ token đăng nhập
- Không cần truyền `ma_nv` trong request body

#### POST /orders/:ma_hd/delete-request (Cashier)
Request xóa hóa đơn (gửi yêu cầu đến admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "ly_do": "Nhập sai thông tin"
}
```

**Response:**
```json
{
  "id": "req123",
  "ma_hd": "HD-001",
  "ma_nv_cashier": "NV001",
  "ly_do": "Nhập sai thông tin",
  "ngay_tao": "2026-05-14T01:20:00Z",
  "trang_thai": "pending"
}
```

#### GET /orders/delete-requests/list (Admin only)
Xem danh sách yêu cầu xóa hóa đơn

**Query Parameters:**
- `skip`: Số bản ghi bỏ qua (default: 0)
- `limit`: Số bản ghi trả về (default: 100)
- `trang_thai`: Lọc theo trạng thái (pending, approved, rejected)

**Response:**
```json
[
  {
    "id": "req123",
    "ma_hd": "HD-001",
    "ma_nv_cashier": "NV001",
    "ten_nv_cashier": "Nguyễn Văn A",
    "ly_do": "Nhập sai thông tin",
    "ngay_tao": "2026-05-14T01:20:00Z",
    "trang_thai": "pending",
    "ngay_xu_ly": null,
    "ghi_chu": null,
    "hoadon": {
      "ma_hd": "HD-001",
      "ngay_tao": "2026-05-14",
      "tong_tien_sau_giam": 180000,
      "ma_nv": "NV001",
      "ho_ten_nv": "Nguyễn Văn A",
      "ma_kh": "KH001",
      "ho_ten_kh": "Khách Hàng A"
    }
  }
]
```

#### POST /orders/:ma_hd/confirm-delete (Admin only)
Xác nhận xóa hóa đơn

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "ghi_chu": "Xác nhận xóa - Dữ liệu bị trùng"
}
```

**Response:**
```json
{
  "message": "Xóa hóa đơn và hoàn tồn kho thành công"
}
```

#### POST /orders/:ma_hd/reject-delete (Admin only)
Từ chối yêu cầu xóa hóa đơn

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "ghi_chu": "Không thể xóa - Hóa đơn đã qua thời hạn"
}
```

**Response:**
```json
{
  "message": "Yêu cầu xóa hóa đơn đã bị từ chối"
}
```

#### DELETE /orders/:ma_hd (Admin only)
Xóa hóa đơn trực tiếp (chỉ admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "message": "Xóa hóa đơn và hoàn tồn kho thành công"
}
```

### Sản Phẩm (Products)

#### POST /products (Admin, Warehouse)
Tạo sản phẩm mới

#### PUT /products/:ma_sp (Admin, Warehouse)
Cập nhật sản phẩm

#### DELETE /products/:ma_sp (Admin only)
Xóa sản phẩm

## Database Schema

### Model DeleteRequest (Bảng delete_request)

Dùng để lưu trữ các yêu cầu xóa hóa đơn từ cashier

**Cột:**
- `id`: String (PRIMARY KEY) - Auto-generated UUID
- `ma_hd`: String (FOREIGN KEY) - Mã hóa đơn
- `ma_nv_cashier`: String (FOREIGN KEY) - Mã nhân viên tạo request
- `ly_do`: String (nullable) - Lý do xóa
- `ngay_tao`: DateTime - Thời gian tạo request
- `trang_thai`: String - Trạng thái (pending/approved/rejected)
- `ngay_xu_ly`: DateTime (nullable) - Thời gian xử lý
- `ghi_chu`: String (nullable) - Ghi chú từ admin

## Quy Trình Xóa Hóa Đơn

### Với Cashier
1. Cashier nhất nhất lỗi trong hóa đơn
2. Gọi API POST /orders/:ma_hd/delete-request với lý do xóa
3. Yêu cầu được lưu vào bảng delete_request với trạng thái "pending"
4. Chờ admin xác nhận hoặc từ chối

### Với Admin
1. Xem danh sách yêu cầu xóa: GET /orders/delete-requests/list?trang_thai=pending
2. Xác nhận (approve): POST /orders/:ma_hd/confirm-delete
   - Hóa đơn sẽ bị xóa
   - Hoàn tồn kho hàng
   - Hoàn trả điểm tích lũy khách hàng
   - Request đặt trạng thái "approved"
3. Hoặc từ chối (reject): POST /orders/:ma_hd/reject-delete
   - Hóa đơn không bị xóa
   - Request đặt trạng thái "rejected"
   - Admin có thể nhập ghi chú lý do từ chối

### Admin Xóa Trực Tiếp (không qua request)
- Gọi DELETE /orders/:ma_hd
- Hóa đơn bị xóa ngay lập tức (không cần có request pending)

## Token & Authentication

Mỗi nhân viên nhận được JWT token khi đăng nhập. Token chứa:
- `ma_nv`: Mã nhân viên
- `vai_tro`: Vai trò (admin/cashier/warehouse)
- `ho_ten`: Họ tên

**Cách sử dụng token:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Lưu Ý Quan Trọng

1. **Mã Nhân Viên Tự Động**: Khi tạo hóa đơn, `ma_nv` được tự động lấy từ token, không cần truyền trong request body

2. **Xác Thực Bắt Buộc**: Tất cả endpoint (trừ GET /products) đều yêu cầu token hợp lệ

3. **Hết Hạn Token**: Token hết hạn sau 7 ngày, cần đăng nhập lại

4. **Vai Trò Mặc Định**: Khi tạo nhân viên mới, nếu không chỉ định `vai_tro`, mặc định sẽ là "cashier"

5. **Mật Khẩu Mặc Định**: Nhân viên mới sẽ có mật khẩu mặc định là "12345" (hash: $2b$10$5XbCCqwl7PgTQlCgSm2bWusPPTA3kYWiqaXjD.mAlymWBsBRc/MyW)

## Testing

### 1. Đăng nhập (tất cả vai trò)
```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "12345"}'
```

### 2. Xem thông tin nhân viên hiện tại
```bash
curl -X GET http://localhost:8000/employees/me \
  -H "Authorization: Bearer <YOUR_TOKEN>"
```

### 3. Tạo hóa đơn (cashier/admin)
```bash
curl -X POST http://localhost:8000/orders \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "ma_hd": "HD-TEST-001",
    "ma_kh": "KH001",
    "items": [{"ma_sku": "SKU001", "so_luong": 1}]
  }'
```

### 4. Request xóa hóa đơn (cashier)
```bash
curl -X POST http://localhost:8000/orders/HD-001/delete-request \
  -H "Authorization: Bearer <CASHIER_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"ly_do": "Nhập sai thông tin"}'
```

### 5. Xem danh sách request xóa (admin)
```bash
curl -X GET "http://localhost:8000/orders/delete-requests/list?trang_thai=pending" \
  -H "Authorization: Bearer <ADMIN_TOKEN>"
```

### 6. Xác nhận xóa hóa đơn (admin)
```bash
curl -X POST http://localhost:8000/orders/HD-001/confirm-delete \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"ghi_chu": "Đã xác nhận"}'
```
