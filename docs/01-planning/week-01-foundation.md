# Kế hoạch công việc Tuần 1: Nền tảng và thiết kế

## Thông tin chung

- Thời gian: 06/05/2026 - 12/05/2026
- Mục tiêu: chốt phạm vi MVP, thiết kế nghiệp vụ, chuẩn hóa cấu trúc dự án, khởi tạo các module backend/frontend cần thiết.
- Kết quả chính: có backlog, ERD ban đầu, API contract cơ bản, skeleton backend/frontend và dữ liệu mẫu tối thiểu.

## Thành viên và vai trò

| Thành viên | Vai trò trong tuần 1 | Phạm vi phụ trách |
|---|---|---|
| Đỗ Hải Đăng | Quản lý dự án / Tech Lead | Chốt scope MVP, quản lý backlog, review API/ERD, điều phối tích hợp |
| Hoàng Gia Huy | Backend Auth & Apartment | Thiết kế auth, user/role, module căn hộ |
| Nguyễn Đức Khải | Backend Resident | Thiết kế module cư dân, hộ gia đình, liên kết căn hộ |
| Trần Đình Nam | Frontend | Layout, routing, dashboard, component dùng chung |
| Phạm Việt Tiến | Database / DevOps | MySQL, Docker, ERD, migration và seed data |

## Kế hoạch theo ngày

| Ngày | Đỗ Hải Đăng | Hoàng Gia Huy | Nguyễn Đức Khải | Trần Đình Nam | Phạm Việt Tiến |
|---|---|---|---|---|---|
| 06/05 | Chốt scope MVP, tạo backlog, thống nhất quy ước Git/API | Đọc cấu trúc backend, xác định module auth/căn hộ | Đọc cấu trúc backend, xác định module cư dân | Đọc cấu trúc frontend, xác định layout chính | Kiểm tra MySQL, Docker và cấu hình local |
| 07/05 | Viết user stories và acceptance criteria | Thiết kế API đăng nhập, user, role | Thiết kế API resident/household | Phác thảo wireframe các màn hình chính | Vẽ ERD ban đầu cho căn hộ, cư dân, phí, thanh toán |
| 08/05 | Review ERD và API contract | Tạo entity/dto cho User, Role; lập kế hoạch JWT | Tạo entity/dto cho Resident, Household | Setup routing và layout shell | Tạo migration/seed mẫu tối thiểu |
| 09/05 | Chốt convention response/error `/api/v1` | Làm skeleton login/register | Làm skeleton CRUD resident | Tạo component table/form dùng chung | Cấu hình kết nối DB và Docker compose |
| 10/05 | Review code vòng 1 | SecurityConfig, password encoder | Validate DTO resident | Hoàn thiện dashboard và sidebar | Tạo entity fee/payment draft |
| 11/05 | Tổng hợp tài liệu yêu cầu | API căn hộ: create/list/detail | API cư dân: create/list/detail | Màn hình căn hộ/cư dân với mock data | Seed căn hộ và cư dân mẫu |
| 12/05 | Demo nội bộ tuần 1, ghi bug và rủi ro | Fix auth/căn hộ theo review | Fix cư dân theo review | Fix UI responsive cơ bản | Kiểm thử DB, ghi lỗi cấu hình nếu có |

## Công việc chi tiết

### Đỗ Hải Đăng

- Tạo backlog MVP gồm các nhóm: auth, căn hộ, cư dân, khoản thu, thanh toán, dashboard, tài liệu.
- Viết acceptance criteria cho từng chức năng bắt buộc.
- Chốt quy ước API: prefix `/api/v1`, response format, error format, validation message.
- Review ERD và API contract trước khi các thành viên implement sâu.
- Điều phối demo nội bộ ngày 12/05/2026.

### Hoàng Gia Huy

- Thiết kế module auth gồm User, Role, LoginRequest, LoginResponse.
- Khởi tạo cấu hình Spring Security và password encoder.
- Chuẩn bị JWT flow: login thành công trả access token, các API quản trị yêu cầu token.
- Khởi tạo module apartment gồm entity, DTO, repository, service, controller.
- Đảm bảo API căn hộ có create/list/detail ở mức skeleton.

### Nguyễn Đức Khải

- Thiết kế model Resident và Household.
- Xác định quan hệ giữa cư dân, hộ gia đình và căn hộ.
- Khởi tạo DTO và validation cho thông tin cư dân.
- Tạo CRUD resident skeleton.
- Chuẩn bị dữ liệu mẫu phục vụ demo tuần 1.

### Trần Đình Nam

- Hoàn thiện app shell: sidebar, header, dashboard area.
- Tạo routing cho dashboard, residents, apartments, fees, payments, auth.
- Tạo component dùng chung: table, form field, button, empty state, loading state.
- Làm dashboard và các màn hình căn hộ/cư dân ban đầu bằng mock data.
- Kiểm tra responsive desktop/mobile cơ bản.

### Phạm Việt Tiến

- Chuẩn hóa cấu hình MySQL local và Docker compose.
- Vẽ ERD ban đầu cho các bảng chính.
- Tạo seed data mẫu: căn hộ, cư dân, user admin.
- Kiểm tra kết nối backend tới database.
- Ghi lại hướng dẫn setup DB ngắn gọn cho nhóm.

## Tiêu chí hoàn thành tuần 1

- Backend chạy được health check tại `/api/v1/health`.
- Có skeleton module auth, apartment và resident.
- Frontend có layout chính, navigation và dashboard ban đầu.
- ERD và API contract ban đầu được review.
- MySQL/Docker chạy được với dữ liệu mẫu tối thiểu.
- Các lỗi/rủi ro sau demo tuần 1 được ghi vào backlog.
