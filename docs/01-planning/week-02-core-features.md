# Kế hoạch công việc Tuần 2: Hoàn thiện chức năng chính

## Thông tin chung

- Thời gian: 13/05/2026 - 19/05/2026
- Mục tiêu: hoàn thiện các luồng nghiệp vụ cốt lõi và tích hợp frontend với backend.
- Kết quả chính: đăng nhập JWT, CRUD căn hộ, CRUD cư dân, quản lý khoản thu cơ bản và frontend gọi API thật.

## Thành viên và vai trò

| Thành viên | Vai trò trong tuần 2 | Phạm vi phụ trách |
|---|---|---|
| Đỗ Hải Đăng | Tech Lead / Integration | Chia sprint task, review API, tích hợp module, tài liệu thiết kế |
| Hoàng Gia Huy | Backend Auth & Apartment | Hoàn thiện JWT, role, CRUD căn hộ, test backend |
| Nguyễn Đức Khải | Backend Resident & Household | Hoàn thiện cư dân, hộ gia đình, tìm kiếm/lọc |
| Trần Đình Nam | Frontend Integration | Màn đăng nhập, căn hộ, cư dân, error/loading state |
| Phạm Việt Tiến | Fee / Payment / QA | Khoản thu, dữ liệu mẫu, test API |

## Kế hoạch theo ngày

| Ngày | Đỗ Hải Đăng | Hoàng Gia Huy | Nguyễn Đức Khải | Trần Đình Nam | Phạm Việt Tiến |
|---|---|---|---|---|---|
| 13/05 | Chia sprint task tuần 2, cập nhật backlog | Hoàn thiện JWT login | Hoàn thiện CRUD cư dân | Gắn API auth/căn hộ | Thiết kế nghiệp vụ khoản thu |
| 14/05 | Review auth flow và phân quyền | Thêm role admin/staff | Thêm tìm kiếm/lọc cư dân | Làm màn đăng nhập | Tạo entity Fee/FeeType |
| 15/05 | Kiểm tra API contract sau khi implement | Hoàn thiện CRUD căn hộ | Liên kết cư dân với căn hộ | Làm màn danh sách căn hộ | Làm API khoản thu skeleton |
| 16/05 | Review code vòng 2 | Chuẩn hóa validation/error backend | Làm API household | Làm màn danh sách cư dân | Tính phí theo căn hộ |
| 17/05 | Tích hợp module và giải quyết conflict | Fix auth/căn hộ | Fix resident/household | Làm form thêm/sửa/xóa | Làm API ghi nhận payment |
| 18/05 | Viết tài liệu thiết kế và API | Unit test auth/căn hộ | Unit test resident | Thêm toast/loading/error states | Seed fee/payment mẫu |
| 19/05 | Demo nội bộ tuần 2, chốt bug cần sửa | Fix bug backend | Fix bug backend | Fix bug frontend | Test API bằng Postman/curl |

## Công việc chi tiết

### Đỗ Hải Đăng

- Cập nhật backlog theo kết quả demo tuần 1.
- Chia task theo mức độ ưu tiên: bắt buộc, nên có, làm sau.
- Review luồng auth, phân quyền và contract API giữa frontend/backend.
- Điều phối tích hợp các module auth, apartment, resident, fee.
- Cập nhật tài liệu thiết kế và danh sách API đã có.

### Hoàng Gia Huy

- Hoàn thiện đăng nhập JWT: verify password, sinh token, middleware xác thực request.
- Cài đặt role admin/staff ở mức cơ bản.
- Hoàn thiện CRUD căn hộ: create, list, detail, update, delete/disable.
- Chuẩn hóa validation và response lỗi cho module auth/căn hộ.
- Viết unit test hoặc integration test cho các API quan trọng.

### Nguyễn Đức Khải

- Hoàn thiện CRUD cư dân: create, list, detail, update, delete/disable.
- Thêm tìm kiếm/lọc theo tên, số điện thoại, căn hộ hoặc trạng thái.
- Hoàn thiện model household và liên kết cư dân với căn hộ.
- Xử lý validation: CMND/CCCD, số điện thoại, ngày sinh, quan hệ với chủ hộ.
- Viết test cho service/controller của resident.

### Trần Đình Nam

- Làm màn đăng nhập và lưu token sau khi đăng nhập thành công.
- Gắn API căn hộ vào frontend: list, tạo mới, sửa, xem chi tiết.
- Gắn API cư dân vào frontend: list, tạo mới, sửa, xem chi tiết.
- Thêm loading state, error state và thông báo thao tác thành công/thất bại.
- Kiểm tra các form không bị tràn nội dung trên mobile và desktop.

### Phạm Việt Tiến

- Thiết kế module fee gồm loại phí, đợt thu, số tiền, hạn thanh toán, trạng thái.
- Làm API khoản thu skeleton và logic tính phí theo căn hộ.
- Tạo API ghi nhận thanh toán ban đầu.
- Bổ sung seed data cho khoản thu và lịch sử thanh toán.
- Test API bằng Postman/curl và ghi lại case lỗi.

## Tiêu chí hoàn thành tuần 2

- Đăng nhập JWT hoạt động và các API cần bảo vệ đã yêu cầu token.
- CRUD căn hộ và cư dân chạy end-to-end từ frontend đến backend.
- Có API và dữ liệu mẫu cho khoản thu.
- Frontend không còn phụ thuộc hoàn toàn vào mock data ở các màn hình chính.
- Có test tối thiểu cho auth, căn hộ và cư dân.
- Danh sách bug tuần 2 được phân loại và gán người xử lý.
