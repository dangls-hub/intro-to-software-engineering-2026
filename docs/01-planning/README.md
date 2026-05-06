# Kế hoạch thực hiện dự án

Tài liệu này tổng hợp kế hoạch thực hiện BlueMoon AMS trong 3 tuần, tính từ 06/05/2026 đến 26/05/2026. Mục tiêu là hoàn thành một bản MVP có thể demo được các nghiệp vụ chính: đăng nhập, quản lý căn hộ, quản lý cư dân, quản lý khoản thu và ghi nhận thanh toán.

## Roadmap 3 tuần

| Tuần | Thời gian | Mục tiêu | Tài liệu chi tiết |
|---|---|---|---|
| Tuần 1 | 06/05/2026 - 12/05/2026 | Nền tảng, thiết kế, skeleton backend/frontend | [week-01-foundation.md](week-01-foundation.md) |
| Tuần 2 | 13/05/2026 - 19/05/2026 | Hoàn thiện chức năng chính và tích hợp API | [week-02-core-features.md](week-02-core-features.md) |
| Tuần 3 | 20/05/2026 - 26/05/2026 | Thanh toán, kiểm thử, demo và bàn giao | [week-03-testing-demo.md](week-03-testing-demo.md) |

## Phân công tổng quan

| Thành viên | Vai trò chính | Trách nhiệm |
|---|---|---|
| Đỗ Hải Đăng | Project Manager / Tech Lead | Quản lý tiến độ, chia task, review code, tài liệu và tích hợp cuối |
| Hoàng Gia Huy | Backend Auth & Apartment | Đăng nhập, phân quyền, API căn hộ |
| Nguyễn Đức Khải | Backend Resident & Household | API cư dân, hộ gia đình, liên kết căn hộ |
| Trần Đình Nam | Frontend | Giao diện, routing, màn hình CRUD, gọi API |
| Phạm Việt Tiến | Database / Payment / QA | ERD, seed data, khoản thu, thanh toán, kiểm thử, Docker |

## Nguyên tắc quản lý tiến độ

- Mỗi task cần có người phụ trách, đầu ra rõ ràng và tiêu chí hoàn thành.
- Ưu tiên hoàn thành luồng nghiệp vụ chính trước khi thêm tính năng mở rộng.
- Code được review trước khi merge vào nhánh chính.
- Demo nội bộ vào cuối mỗi tuần để phát hiện lỗi tích hợp sớm.
- Các lỗi được phân loại theo mức độ: bắt buộc sửa, có thể chấp nhận, làm sau.

## Mốc nghiệm thu MVP

- Người dùng đăng nhập được vào hệ thống.
- Quản lý được danh sách căn hộ.
- Quản lý được danh sách cư dân và liên kết với căn hộ.
- Tạo được khoản thu cho căn hộ.
- Ghi nhận được thanh toán và cập nhật trạng thái.
- Frontend, backend và database chạy được với dữ liệu mẫu.
