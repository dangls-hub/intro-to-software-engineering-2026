# Kế hoạch thực hiện dự án

Tài liệu này mô tả kế hoạch tổng quan cho BlueMoon AMS trong 3 tuần, tính từ 06/05/2026 đến 26/05/2026. Các task chi tiết, trạng thái xử lý, assignee và tiến độ hằng ngày được quản lý trên GitHub Scrum board.

## Nguồn quản lý công việc

- Repository: [intro-to-software-engineering-2026](https://github.com/dangls-hub/intro-to-software-engineering-2026)
- GitHub Scrum board: cập nhật link GitHub Project board tại đây sau khi nhóm chốt URL chia sẻ.

## Quy ước sử dụng

- `docs/01-planning` dùng để ghi mục tiêu sprint, phạm vi, vai trò, deliverables và tiêu chí hoàn thành.
- GitHub Scrum board là nguồn chính để quản lý task chi tiết.
- Khi có thay đổi nhỏ trong task hằng ngày, chỉ cập nhật GitHub board.
- Chỉ cập nhật file planning khi thay đổi mục tiêu sprint, phạm vi MVP hoặc mốc bàn giao.

## Roadmap 3 sprint

| Sprint | Thời gian | Mục tiêu | Tài liệu chi tiết |
|---|---|---|---|
| Sprint 1 | 06/05/2026 - 12/05/2026 | Nền tảng, thiết kế, skeleton backend/frontend | [week-01-foundation.md](week-01-foundation.md) |
| Sprint 2 | 13/05/2026 - 19/05/2026 | Hoàn thiện chức năng chính và tích hợp API | [week-02-core-features.md](week-02-core-features.md) |
| Sprint 3 | 20/05/2026 - 26/05/2026 | Thanh toán, kiểm thử, demo và bàn giao | [week-03-testing-demo.md](week-03-testing-demo.md) |

## Phân công tổng quan

| Thành viên | Vai trò chính | Trách nhiệm |
|---|---|---|
| Đỗ Hải Đăng | Project Manager / Tech Lead | Quản lý tiến độ, chia task, review code, tài liệu và tích hợp cuối |
| Hoàng Gia Huy | Backend Auth & Apartment | Đăng nhập, phân quyền, API căn hộ |
| Nguyễn Đức Khải | Backend Resident & Household | API cư dân, hộ gia đình, liên kết căn hộ |
| Trần Đình Nam | Frontend | Giao diện, routing, màn hình CRUD, gọi API |
| Phạm Việt Tiến | Database / Payment / QA | ERD, seed data, khoản thu, thanh toán, kiểm thử, Docker |

## Cột trạng thái trên Scrum board

| Cột | Ý nghĩa |
|---|---|
| Product Backlog | Task đã ghi nhận nhưng chưa đưa vào sprint hiện tại |
| Sprint Backlog | Task được chọn cho sprint hiện tại |
| Todo | Task đã sẵn sàng để làm |
| In Progress | Task đang được xử lý |
| Review | Task đã làm xong, đang chờ review/test |
| Done | Task đã đạt tiêu chí hoàn thành |

## Mốc nghiệm thu MVP

- Người dùng đăng nhập được vào hệ thống.
- Quản lý được danh sách căn hộ.
- Quản lý được danh sách cư dân và liên kết với căn hộ.
- Tạo được khoản thu cho căn hộ.
- Ghi nhận được thanh toán và cập nhật trạng thái.
- Frontend, backend và database chạy được với dữ liệu mẫu.
