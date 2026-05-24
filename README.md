# Hệ thống quản lý Cửa hàng (CSDL Shop Management)

Dự án này bao gồm 2 phần chính:
- **Backend**: Xây dựng bằng Node.js, Express, Prisma ORM và cơ sở dữ liệu SQLite.
- **Frontend**: Giao diện quản trị (Admin Dashboard) xây dựng bằng HTML, CSS và JavaScript thuần.

---

## 1. Hướng dẫn cài đặt và chạy Backend

Backend cung cấp các API để frontend gọi đến. Bạn cần phải chạy backend trước khi sử dụng giao diện.

### Yêu cầu:
- Cài đặt **Node.js** (phiên bản 18 trở lên được khuyến nghị).

### Các bước thực hiện:

1. Mở terminal và di chuyển vào thư mục `backend`:
   ```bash
   cd admin_dashboard/backend
   ```

2. Cài đặt các thư viện (dependencies) cần thiết:
   ```bash
   npm install
   ```

3. Thiết lập file biến môi trường (`.env`):
   Đảm bảo trong thư mục `backend` có file `.env` với nội dung như sau để kết nối với cơ sở dữ liệu SQLite cục bộ:
   ```env
   DATABASE_URL="file:./dev.db"
   ```

4. Khởi tạo Prisma (nếu chưa có database hoặc Prisma client chưa được tạo):
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. (Tùy chọn) Khởi tạo dữ liệu mẫu (Seed data):
   Nếu bạn muốn có sẵn dữ liệu để test, hãy chạy lệnh sau:
   ```bash
   npm run seed
   ```

6. Chạy server backend:
   ```bash
   npm run dev
   ```
   *Server sẽ khởi chạy và lắng nghe tại địa chỉ: `http://localhost:8000`*

---

## 2. Hướng dẫn chạy Frontend (Giao diện)

Frontend là các file tĩnh (HTML, CSS, JS), không cần phải cài đặt môi trường phức tạp.

### Các bước thực hiện:

1. Đảm bảo Backend đang chạy (bước 6 ở trên).
2. Có thể chạy Frontend bằng 2 cách:
   - **Cách 1 (Đơn giản nhất)**: Mở trực tiếp file `admin_dashboard/frontend/html/index.html` bằng trình duyệt (Chrome, Edge, Firefox...).
   - **Cách 2 (Khuyến nghị)**: Mở thư mục dự án bằng **VS Code**, cài đặt extension **Live Server**. Sau đó click chuột phải vào file `admin_dashboard/frontend/html/index.html` và chọn **"Open with Live Server"**.

---

## Lưu ý về lỗi (Troubleshooting)

- Nếu backend báo lỗi liên quan đến `DateTime` khi gọi API (ví dụ: `Could not convert value "2024-01-09" of the field ngay_tao to type DateTime`), đây là lỗi do định dạng ngày tháng được lưu bằng chuỗi (`String`) không khớp hoàn toàn với định dạng `ISO-8601 DateTime` của SQLite thông qua Prisma. Giải pháp là xóa file `dev.db` cũ và chạy lại lệnh `npx prisma db push` sau đó chạy `npm run seed` để tạo lại dữ liệu mới chuẩn hơn.
- Không cam kết các file cơ sở dữ liệu (như `dev.db`) lên GitHub để tránh xung đột.
