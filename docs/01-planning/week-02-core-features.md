# Sprint 2: Hoàn thiện chức năng chính

## Thông tin chung

- Thời gian: 13/05/2026 - 19/05/2026
- Sprint goal: triển khai toàn bộ logic nghiệp vụ cốt lõi (backend API + frontend tích hợp thật) để có bản demo end-to-end đầu tiên.
- Quản lý task chi tiết: GitHub Scrum board.

## Phạm vi sprint

| Nhóm công việc | Nội dung |
|---|---|
| Auth | Đăng nhập JWT, role admin/staff, bảo vệ API quản trị |
| Apartment | CRUD căn hộ đầy đủ ở backend và frontend |
| Resident | CRUD cư dân, liên kết cư dân với căn hộ/hộ gia đình |
| Fee | Thiết kế và triển khai khoản thu cơ bản |
| Frontend Integration | Gọi API thật, xử lý loading/error, form thêm/sửa/xóa |
| Testing | Test tối thiểu cho auth, căn hộ, cư dân và API chính |

## Phân công công việc chi tiết

### Đỗ Hải Đăng — Tech Lead + Backend Core & Fee

> **Vai trò mới:** Ngoài quản lý, trực tiếp code phần Backend Common và module Fee.

**Backend `common/` — Lõi hệ thống:**
- `common/security/JwtUtil.java` — Tạo, ký và xác thực JWT token
- `common/security/JwtAuthFilter.java` — Filter đính kèm JWT vào mỗi request
- `common/config/SecurityConfig.java` — Cấu hình Spring Security (route công khai / bảo vệ, filter chain)
- `common/config/CorsConfig.java` — Cho phép frontend (Vite :5173) gọi backend
- `common/response/ApiResponse.java` — Chuẩn hoá format response toàn hệ thống `{ success, message, data }`
- `common/exception/GlobalExceptionHandler.java` — Bắt lỗi toàn cục (404, 403, 400, 500)

**Backend `module/fee/` — Khoản thu:**
- `entity/Fee.java` — Entity bảng khoản thu
- `repository/FeeRepository.java`
- `dto/FeeRequest.java`, `dto/FeeResponse.java`
- `mapper/FeeMapper.java`
- `service/FeeService.java` — CRUD khoản thu, gán cho căn hộ
- `controller/FeeController.java` — API `GET/POST/PUT/DELETE /api/fees`

---

### Hoàng Gia Huy — Backend Auth & Apartment

**Backend `module/auth/` — Xác thực:**
- `entity/User.java` — Entity bảng users (username, password hash, role)
- `entity/Role.java` — Enum/Entity role (ADMIN, STAFF)
- `repository/UserRepository.java`
- `dto/LoginRequest.java`, `dto/LoginResponse.java`
- `service/AuthService.java` — Xác thực user, tạo JWT, load UserDetails
- `controller/AuthController.java` — API `POST /api/auth/login`

**Backend `module/apartment/` — Căn hộ:**
- `entity/Apartment.java` — Entity bảng căn hộ (số phòng, tầng, diện tích, trạng thái)
- `repository/ApartmentRepository.java`
- `dto/ApartmentRequest.java`, `dto/ApartmentResponse.java`
- `mapper/ApartmentMapper.java`
- `service/ApartmentService.java` — CRUD căn hộ
- `controller/ApartmentController.java` — API `GET/POST/PUT/DELETE /api/apartments`

---

### Nguyễn Đức Khải — Backend Resident & Household

**Backend `module/resident/` — Cư dân & Hộ gia đình:**
- `entity/Resident.java` — Entity cư dân (họ tên, CCCD, ngày sinh, ...)
- `entity/Household.java` — Entity hộ gia đình (liên kết nhiều cư dân với 1 căn hộ)
- `repository/ResidentRepository.java`, `repository/HouseholdRepository.java`
- `dto/ResidentRequest.java`, `dto/ResidentResponse.java`
- `dto/HouseholdRequest.java`, `dto/HouseholdResponse.java`
- `mapper/ResidentMapper.java`, `mapper/HouseholdMapper.java`
- `service/ResidentService.java` — CRUD cư dân, tìm kiếm/lọc theo căn hộ
- `service/HouseholdService.java` — Liên kết cư dân với căn hộ
- `controller/ResidentController.java` — API `GET/POST/PUT/DELETE /api/residents`
- `controller/HouseholdController.java` — API quản lý hộ gia đình

---

### Trần Đình Nam — Frontend Integration

> **Ưu tiên:** Kết nối UI đã có với API thật, không cần mock data.

**`src/lib/`:**
- `axiosClient.js` — Tạo axios instance với `baseURL`, interceptor tự đính `Authorization: Bearer <token>` vào header

**`src/store/`:**
- `authStore.js` — Lưu trạng thái đăng nhập (token, user info), hàm login/logout

**`src/features/auth/`:**
- `api/authApi.js` — Hàm gọi `POST /api/auth/login`
- `pages/LoginPage.jsx` — Kết nối form đăng nhập với API, lưu token, redirect sau login

**`src/features/apartments/`:**
- `api/apartmentApi.js` — Hàm gọi CRUD `/api/apartments`
- `pages/ApartmentListPage.jsx` — Danh sách căn hộ, tìm kiếm, phân trang
- `pages/ApartmentFormPage.jsx` — Form thêm/sửa căn hộ
- `components/ApartmentCard.jsx` — Component hiển thị 1 căn hộ

**`src/features/residents/`:**
- `api/residentApi.js` — Hàm gọi CRUD `/api/residents`
- `pages/ResidentListPage.jsx` — Danh sách cư dân, lọc theo căn hộ
- `pages/ResidentFormPage.jsx` — Form thêm/sửa cư dân
- `components/ResidentCard.jsx`

**`src/routes/`:**
- `AppRouter.jsx` — Cấu hình routing, bảo vệ route cần đăng nhập (PrivateRoute)

---

### Phạm Việt Tiến — Database, Migration & Seed

**`database/migrations/`:**
- `V1__create_users_table.sql`
- `V2__create_apartments_table.sql`
- `V3__create_residents_households_table.sql`
- `V4__create_fees_table.sql`

**`database/seed/`:**
- `seed_users.sql` — 1 tài khoản admin, 1 tài khoản staff (mật khẩu đã hash BCrypt)
- `seed_apartments.sql` — 10 căn hộ mẫu
- `seed_residents.sql` — 5 cư dân mẫu, gán vào căn hộ

**Backend `module/fee/` (phối hợp với Đăng):**
- Hỗ trợ viết test cho Fee API

---

## Deliverables

- Đăng nhập JWT hoạt động end-to-end (frontend → backend → DB).
- Các API cần bảo vệ yêu cầu token hợp lệ, trả 401 nếu không có.
- CRUD căn hộ chạy được từ frontend đến backend.
- CRUD cư dân chạy được từ frontend đến backend.
- Có API và dữ liệu mẫu cho khoản thu.
- Frontend không còn phụ thuộc mock data ở các màn hình chính.
- Migration SQL tạo đủ bảng, seed data chạy được.

## Definition of Done

- Các issue thuộc sprint 2 có assignee và trạng thái rõ trên GitHub Scrum board.
- Pull request đã được review trước khi merge.
- API thay đổi phải được cập nhật trong tài liệu thiết kế.
- Bug chặn demo được phân loại và xử lý trước khi kết thúc sprint.
- Demo nội bộ cuối sprint chạy được các luồng: đăng nhập, căn hộ, cư dân, khoản thu.

## Rủi ro cần theo dõi

- Auth/security làm chậm tích hợp frontend.
- Thiếu seed data khiến demo không ổn định.
- CRUD frontend/backend lệch format request/response.
- Chức năng khoản thu bị mở rộng quá phạm vi MVP.

---

## 📊 Theo dõi tiến độ Sprint 2

| Hạng mục | Người thực hiện | Trạng thái |
|---|---|---|
| `common/security/JwtUtil.java` | Đỗ Hải Đăng | ⬜ Todo |
| `common/security/JwtAuthFilter.java` | Đỗ Hải Đăng | ⬜ Todo |
| `common/config/SecurityConfig.java` | Đỗ Hải Đăng | ⬜ Todo |
| `common/config/CorsConfig.java` | Đỗ Hải Đăng | ⬜ Todo |
| `common/response/ApiResponse.java` | Đỗ Hải Đăng | ⬜ Todo |
| `common/exception/GlobalExceptionHandler.java` | Đỗ Hải Đăng | ⬜ Todo |
| `module/fee/` (Entity → Controller) | Đỗ Hải Đăng | ⬜ Todo |
| `module/auth/` (Entity → Controller) | Hoàng Gia Huy | ⬜ Todo |
| `module/apartment/` (Entity → Controller) | Hoàng Gia Huy | ⬜ Todo |
| `module/resident/` (Entity → Controller) | Nguyễn Đức Khải | ⬜ Todo |
| `module/resident/Household` (Entity → Controller) | Nguyễn Đức Khải | ⬜ Todo |
| `src/lib/axiosClient.js` | Trần Đình Nam | ⬜ Todo |
| `src/store/authStore.js` | Trần Đình Nam | ⬜ Todo |
| `features/auth/` kết nối API | Trần Đình Nam | ⬜ Todo |
| `features/apartments/` (pages + api) | Trần Đình Nam | ⬜ Todo |
| `features/residents/` (pages + api) | Trần Đình Nam | ⬜ Todo |
| `src/routes/AppRouter.jsx` (PrivateRoute) | Trần Đình Nam | ⬜ Todo |
| `database/migrations/` V1-V4 | Phạm Việt Tiến | ⬜ Todo |
| `database/seed/` users, apartments, residents | Phạm Việt Tiến | ⬜ Todo |
