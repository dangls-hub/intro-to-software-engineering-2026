# Hướng dẫn triển khai và chạy cục bộ

## Yêu cầu môi trường

- Java 17.
- Maven 3.9 hoặc Maven wrapper nếu dự án bổ sung sau.
- Node.js 18 trở lên.
- npm hoặc package manager tương thích.
- Docker Desktop nếu chạy MySQL bằng Docker Compose.
- MySQL 8 nếu chạy database trực tiếp trên máy.

## Cổng mặc định

| Thành phần | Cổng | Ghi chú |
|---|---|---|
| Frontend | `5173` | Vite dev server |
| Backend | `8080` | Spring Boot |
| MySQL local | `3306` | Nếu cài MySQL trực tiếp |
| MySQL Docker | `3307` trên host, `3306` trong container | Theo `docker-compose.yml` hiện tại |

## Chạy database bằng Docker

Tại thư mục gốc dự án:

```powershell
docker compose up -d mysql-db
```

Kiểm tra container:

```powershell
docker ps
```

Thông tin mặc định trong `docker-compose.yml`:

- Database: `bluemoon_ams`
- User: `root`
- Password: `NhapMonCongNghePhanMem`
- Host port: `3307`

Lưu ý: cấu hình mặc định trong `ams-backend/src/main/resources/application.yml` đã dùng port `3307` để khớp với MySQL Docker:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3307/bluemoon_ams?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Ho_Chi_Minh
```

Nếu dùng MySQL local ở port `3306`, đổi port trong JDBC URL từ `3307` về `3306`.

## Chạy backend

Tại thư mục `ams-backend`:

```powershell
mvn spring-boot:run
```

Kiểm tra health check:

```powershell
curl http://localhost:8080/api/v1/health
```

Kết quả mong đợi: backend trả HTTP 200 và thông báo hệ thống đã chạy thành công.

## Chạy frontend

Tại thư mục `ams-frontend`:

```powershell
npm install
npm run dev
```

Truy cập:

```text
http://localhost:5173
```

Frontend mặc định gọi API qua `VITE_API_BASE_URL` hoặc proxy `/api` trong `vite.config.js`.

## Build kiểm tra trước bàn giao

Backend:

```powershell
cd ams-backend
mvn test
mvn package
```

Frontend:

```powershell
cd ams-frontend
npm run build
```

## Quy trình chạy demo đề xuất

1. Khởi động MySQL.
2. Khởi động backend.
3. Kiểm tra `/api/v1/health`.
4. Khởi động frontend.
5. Đăng nhập bằng tài khoản demo.
6. Thực hiện kịch bản: dashboard, căn hộ, cư dân, khoản thu, thanh toán.

## Lỗi thường gặp

| Lỗi | Nguyên nhân thường gặp | Cách xử lý |
|---|---|---|
| Backend không kết nối được DB | Sai port MySQL hoặc container chưa chạy | Kiểm tra Docker và JDBC URL |
| Frontend gọi API lỗi CORS | Backend chưa cấu hình CORS hoặc sai base URL | Kiểm tra cấu hình backend/proxy |
| Port đã được dùng | Có tiến trình khác đang chiếm `8080` hoặc `5173` | Dừng tiến trình cũ hoặc đổi port |
| Build frontend lỗi thiếu package | Chưa chạy `npm install` | Cài dependencies trước khi build |
| Login luôn thất bại | Chưa có seed user hoặc sai password | Kiểm tra dữ liệu mẫu trong database |
