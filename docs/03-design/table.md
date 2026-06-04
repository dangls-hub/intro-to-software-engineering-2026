# 7.4 Thiết kế dữ liệu cho phần mềm quản lý thu phí ở chung cư

Tài liệu này trình bày thiết kế dữ liệu cho ba bảng chính: `users`, `residents` và `apartments`. Các bảng được thiết kế phục vụ nghiệp vụ quản lý tài khoản, cư dân và căn hộ trong hệ thống quản lý thu phí chung cư BlueMoon AMS.

## Bảng `users`

| STT | Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---:|---|---|---|---|
| 1 | `id` | `BIGINT` | Primary Key, Auto Increment | Mã định danh duy nhất của tài khoản |
| 2 | `username` | `VARCHAR(50)` | Not Null, Unique | Tên đăng nhập của người dùng |
| 3 | `password_hash` | `VARCHAR(255)` | Not Null | Mật khẩu đã được mã hóa |
| 4 | `full_name` | `VARCHAR(100)` | Not Null | Họ và tên người dùng |
| 5 | `email` | `VARCHAR(100)` | Unique | Email liên hệ |
| 6 | `phone` | `VARCHAR(20)` |  | Số điện thoại liên hệ |
| 7 | `role` | `VARCHAR(30)` | Not Null | Vai trò người dùng, ví dụ: `ADMIN`, `STAFF` |
| 8 | `status` | `VARCHAR(20)` | Not Null | Trạng thái tài khoản, ví dụ: `ACTIVE`, `INACTIVE`, `LOCKED` |
| 9 | `created_at` | `DATETIME` | Not Null | Thời điểm tạo tài khoản |
| 10 | `updated_at` | `DATETIME` |  | Thời điểm cập nhật gần nhất |

## Bảng `residents`

| STT | Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---:|---|---|---|---|
| 1 | `id` | `BIGINT` | Primary Key, Auto Increment | Mã định danh duy nhất của cư dân |
| 2 | `apartment_id` | `BIGINT` | Foreign Key, Not Null | Mã căn hộ mà cư dân đang sinh sống |
| 3 | `full_name` | `VARCHAR(100)` | Not Null | Họ và tên cư dân |
| 4 | `identity_number` | `VARCHAR(20)` | Unique | Số CCCD/CMND của cư dân |
| 5 | `date_of_birth` | `DATE` |  | Ngày sinh |
| 6 | `gender` | `VARCHAR(10)` |  | Giới tính |
| 7 | `phone` | `VARCHAR(20)` |  | Số điện thoại |
| 8 | `email` | `VARCHAR(100)` |  | Email liên hệ |
| 9 | `relation_to_owner` | `VARCHAR(50)` |  | Quan hệ với chủ hộ, ví dụ: chủ hộ, vợ/chồng, con, người thuê |
| 10 | `is_owner` | `BOOLEAN` | Not Null | Đánh dấu cư dân có phải chủ hộ hay không |
| 11 | `status` | `VARCHAR(20)` | Not Null | Trạng thái cư trú, ví dụ: `ACTIVE`, `MOVED_OUT`, `TEMPORARY` |
| 12 | `created_at` | `DATETIME` | Not Null | Thời điểm thêm cư dân |
| 13 | `updated_at` | `DATETIME` |  | Thời điểm cập nhật gần nhất |

## Bảng `apartments`

| STT | Tên trường | Kiểu dữ liệu | Ràng buộc | Mô tả |
|---:|---|---|---|---|
| 1 | `id` | `BIGINT` | Primary Key, Auto Increment | Mã định danh duy nhất của căn hộ |
| 2 | `code` | `VARCHAR(20)` | Not Null, Unique | Mã căn hộ, ví dụ: `A101`, `B1205` |
| 3 | `building` | `VARCHAR(50)` |  | Tòa nhà hoặc block của căn hộ |
| 4 | `floor` | `INT` | Not Null | Tầng của căn hộ |
| 5 | `area` | `DECIMAL(10,2)` | Not Null | Diện tích căn hộ theo mét vuông |
| 6 | `room_count` | `INT` |  | Số phòng trong căn hộ |
| 7 | `owner_resident_id` | `BIGINT` | Foreign Key | Mã cư dân là chủ hộ |
| 8 | `status` | `VARCHAR(20)` | Not Null | Trạng thái căn hộ, ví dụ: `OCCUPIED`, `VACANT`, `MAINTENANCE` |
| 9 | `created_at` | `DATETIME` | Not Null | Thời điểm tạo thông tin căn hộ |
| 10 | `updated_at` | `DATETIME` |  | Thời điểm cập nhật gần nhất |

## Quan hệ giữa các bảng

| Quan hệ | Mô tả |
|---|---|
| `apartments.id` -> `residents.apartment_id` | Một căn hộ có thể có nhiều cư dân |
| `residents.id` -> `apartments.owner_resident_id` | Một cư dân có thể được gán là chủ hộ của căn hộ |
| `users` | Bảng tài khoản hệ thống, độc lập với dữ liệu cư dân trong phạm vi thiết kế hiện tại |
