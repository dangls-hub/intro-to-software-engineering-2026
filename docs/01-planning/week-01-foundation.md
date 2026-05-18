# Sprint 1: Nền tảng và thiết kế

## Thông tin chung

- Thời gian: 06/05/2026 - 12/05/2026
- Sprint goal: chốt phạm vi MVP, thống nhất thiết kế ban đầu và tạo nền tảng kỹ thuật để các module chính có thể triển khai ở sprint sau.
- Quản lý task chi tiết: GitHub Scrum board.

## Phạm vi sprint

| Nhóm công việc | Nội dung |
|---|---|
| Planning | Chốt MVP scope, user stories chính, acceptance criteria và quy ước làm việc |
| Requirements | Xác định yêu cầu cho auth, căn hộ, cư dân, khoản thu, thanh toán |
| Design | Phác thảo ERD, API contract, response/error convention |
| Backend | Chuẩn bị skeleton cho auth, apartment, resident và health check |
| Frontend | Chuẩn bị app shell, navigation, dashboard và component dùng chung |
| Database/DevOps | Chuẩn hóa MySQL, Docker Compose, seed data ban đầu |

## Vai trò trong sprint

| Thành viên | Vai trò | Trách nhiệm chính |
|---|---|---|
| Đỗ Hải Đăng | PM / Tech Lead | Chốt scope, quản lý backlog, review ERD/API, điều phối demo sprint |
| Hoàng Gia Huy | Backend Auth & Apartment | Thiết kế auth, user/role, module căn hộ |
| Nguyễn Đức Khải | Backend Resident | Thiết kế module cư dân, hộ gia đình, liên kết căn hộ |
| Trần Đình Nam | Frontend | Layout, routing, dashboard, component dùng chung |
| Phạm Việt Tiến | Database / DevOps | MySQL, Docker, ERD, migration và seed data |

## Deliverables

- Backlog MVP được tạo trên GitHub Scrum board.
- ERD bản đầu cho các bảng chính.
- API contract bản đầu cho các luồng chính.
- Backend chạy được health check tại `/api/v1/health`.
- Có skeleton module auth, apartment và resident.
- Frontend có layout chính, navigation và dashboard ban đầu.
- MySQL/Docker chạy được với dữ liệu mẫu tối thiểu.

## Definition of Done

- Các task trong sprint đã được cập nhật trạng thái trên GitHub Scrum board.
- Mỗi module skeleton có owner rõ ràng.
- Tài liệu requirements/design liên quan được cập nhật ở mức đủ để sprint 2 implement.
- Demo nội bộ cuối sprint chạy được frontend/backend ở mức nền tảng.
- Rủi ro và bug phát hiện trong sprint được ghi lại trên GitHub board.

## Rủi ro cần theo dõi

- API contract thay đổi quá nhiều sau khi frontend bắt đầu tích hợp.
- ERD chưa đủ rõ quan hệ giữa căn hộ, hộ gia đình và cư dân.
- Cấu hình database giữa Docker và local không thống nhất.

---

## ✅ Kết quả thực tế (Sprint 1 - ĐÃ HOÀN THÀNH)

| Hạng mục | Người thực hiện | Trạng thái | Ghi chú |
|---|---|---|---|
| Khởi tạo repo, nhánh và quy ước Git | Nguyễn Đức Khải | ✅ Done | PR #35 - `chore/init` |
| Cấu trúc thư mục monorepo | Nguyễn Đức Khải | ✅ Done | PR #36, #37 - `feature/build-skeleton` |
| Docker Compose cho MySQL (port 3307) | Nguyễn Đức Khải | ✅ Done | `docker-compose.yml` |
| Backend skeleton Spring Boot (tất cả modules) | Nguyễn Đức Khải | ✅ Done | Module auth, apartment, resident, fee, payment đã có cấu trúc thư mục |
| Backend `HealthController` tại `/api/v1/health` | Nguyễn Đức Khải | ✅ Done | |
| Backend `common/` (cấu trúc thư mục: config, security, exception, response, util) | Nguyễn Đức Khải | ✅ Done | Cấu trúc sẵn sàng, chưa có logic |
| Frontend skeleton (Vite + React + React Router) | Trần Đình Nam | ✅ Done | Cấu trúc features, hooks, store, routes, utils |
| Trang Login UI (`LoginPage.jsx`) | Trần Đình Nam | ✅ Done | PR #39 - `feature/login-page` |
| Khung UI Sprint 2 cho nhân viên (staff screens) | Trần Đình Nam | ✅ Done | `feat(frontend): implement sprint 2 staff screens` |
| Tài liệu Planning (README + 3 sprint files) | Đỗ Hải Đăng | ✅ Done | `docs/01-planning/` |
