# Sprint 2: Hoàn thiện chức năng chính

## Thông tin chung

- Thời gian: 13/05/2026 - 19/05/2026
- Sprint goal: hoàn thiện các luồng nghiệp vụ cốt lõi và tích hợp frontend với backend để có bản demo end-to-end đầu tiên.
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

## Vai trò trong sprint

| Thành viên | Vai trò | Trách nhiệm chính |
|---|---|---|
| Đỗ Hải Đăng | Tech Lead / Integration | Chia sprint task, review API, tích hợp module, cập nhật tài liệu thiết kế |
| Hoàng Gia Huy | Backend Auth & Apartment | Hoàn thiện JWT, role, CRUD căn hộ, test backend |
| Nguyễn Đức Khải | Backend Resident & Household | Hoàn thiện cư dân, hộ gia đình, tìm kiếm/lọc |
| Trần Đình Nam | Frontend Integration | Màn đăng nhập, căn hộ, cư dân, loading/error state |
| Phạm Việt Tiến | Fee / Payment / QA | Khoản thu, dữ liệu mẫu, test API |

## Deliverables

- Đăng nhập JWT hoạt động.
- Các API cần bảo vệ yêu cầu token hợp lệ.
- CRUD căn hộ chạy end-to-end từ frontend đến backend.
- CRUD cư dân chạy end-to-end từ frontend đến backend.
- Có API và dữ liệu mẫu cho khoản thu.
- Frontend không còn phụ thuộc hoàn toàn vào mock data ở các màn hình chính.
- Có test/checklist tối thiểu cho các luồng chính.

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
