## 🏗 Project Architecture: Service Layer

Cấu trúc thư mục của dự án được tổ chức như sau:

| Thư mục | Chức năng |
| :--- | :--- |
| **config** | Cấu hình SDK (Supabase), biến môi trường. |
| **controllers** | Tầng điều hướng. Tiếp nhận Request từ Client, trích xuất dữ liệu và gọi các Service tương ứng. Sau đó, trả về Response (JSON) và mã lỗi HTTP/Xử lý HTTP request/response. |
| **services** | Xử lý logic nghiệp vụ (Business logic). |
| **repositories** | Thao tác trực tiếp với Database (Supabase). Nếu trong tương lai cần đổi Database, chúng ta chỉ cần sửa đổi tại đây. |
| **routes** | Khai báo các đường dẫn API, và liên kết chúng với các Controller tương ứng |
| **middlewares** | Xử lý trung gian (Auth, Validation, Log). |
| **utils** | Các hàm bổ trợ, xử lý lỗi dùng chung: định dạng tiền tệ, xử lý chuỗi, hoặc trình quản lý lỗi tập trung |
| **app.js** | Entry point của ứng dụng. |