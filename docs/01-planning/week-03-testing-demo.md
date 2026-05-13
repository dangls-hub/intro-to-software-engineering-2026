# Sprint 3: Thanh toán, kiểm thử và bàn giao

## Thông tin chung

- Thời gian: 20/05/2026 - 26/05/2026
- Sprint goal: hoàn thiện luồng thanh toán, kiểm thử end-to-end, sửa bug, chuẩn bị demo và bàn giao MVP.
- Quản lý task chi tiết: GitHub Scrum board.

## Phạm vi sprint

| Nhóm công việc | Nội dung |
|---|---|
| Payment | Ghi nhận thanh toán, cập nhật trạng thái khoản thu, QR/mock payment nếu kịp |
| Stabilization | Fix bug auth, căn hộ, cư dân, khoản thu và thanh toán |
| Frontend Polish | Hoàn thiện màn khoản thu, thanh toán, responsive và trạng thái lỗi |
| QA | Chạy checklist test, kiểm thử end-to-end, phân loại bug còn lại |
| Deployment | Hoàn thiện hướng dẫn chạy local/Docker |
| Reporting | Chuẩn bị báo cáo, kịch bản demo và tài liệu bàn giao |

## Vai trò trong sprint

| Thành viên | Vai trò | Trách nhiệm chính |
|---|---|---|
| Đỗ Hải Đăng | Release Lead | Chốt demo scope, review tích hợp, tổng hợp báo cáo, điều phối bàn giao |
| Hoàng Gia Huy | Backend Stabilization | Fix security/API, test backend, hỗ trợ bug |
| Nguyễn Đức Khải | Data Flow Stabilization | Fix resident/household flow, test nghiệp vụ, hỗ trợ bug |
| Trần Đình Nam | Frontend Polish | Màn khoản thu, thanh toán, polish UI, fix responsive |
| Phạm Việt Tiến | Payment / QA / Deployment | Thanh toán, QR/mock payment, E2E test, hướng dẫn deploy |

## Deliverables

- API thanh toán hoạt động ở mức MVP.
- Frontend có màn khoản thu và thanh toán đủ để demo.
- Trạng thái khoản thu cập nhật đúng sau khi ghi nhận thanh toán.
- Seed data đủ cho kịch bản demo.
- Checklist kiểm thử được chạy trước ngày bàn giao.
- Hướng dẫn setup local/Docker hoàn chỉnh.
- Báo cáo nhóm và kịch bản demo sẵn sàng.

## Kịch bản demo bắt buộc

1. Đăng nhập bằng tài khoản admin/staff mẫu.
2. Xem dashboard tổng quan.
3. Tạo mới hoặc cập nhật một căn hộ.
4. Tạo mới cư dân và gán vào căn hộ.
5. Tạo khoản thu cho căn hộ.
6. Ghi nhận thanh toán cho khoản thu.
7. Kiểm tra trạng thái thanh toán đã cập nhật trên frontend.

## Definition of Done

- MVP chạy được từ frontend đến backend với database thật.
- Các issue bắt buộc cho demo đã ở trạng thái Done trên GitHub Scrum board.
- Không còn bug Critical chặn demo.
- Bug còn lại được ghi rõ mức độ và hướng xử lý.
- Tài liệu deployment, testing và reports đã được cập nhật.
- Nhóm đã tổng duyệt demo ít nhất một lần trước ngày 26/05/2026.

## Rủi ro cần theo dõi

- Luồng thanh toán phát sinh nghiệp vụ ngoài MVP.
- Demo phụ thuộc dữ liệu thủ công chưa được seed ổn định.
- Lỗi môi trường chạy local làm chậm buổi bàn giao.
- Thiếu thời gian polish UI sau khi fix bug tích hợp.
