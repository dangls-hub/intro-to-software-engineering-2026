# Kế hoạch công việc Tuần 3: Thanh toán, kiểm thử và bàn giao

## Thông tin chung

- Thời gian: 20/05/2026 - 26/05/2026
- Mục tiêu: hoàn thiện luồng thanh toán, kiểm thử end-to-end, sửa bug, chuẩn bị demo và tài liệu bàn giao.
- Kết quả chính: MVP chạy được, có dữ liệu demo, có hướng dẫn setup, có kịch bản demo và báo cáo nhóm.

## Thành viên và vai trò

| Thành viên | Vai trò trong tuần 3 | Phạm vi phụ trách |
|---|---|---|
| Đỗ Hải Đăng | Release Lead | Chốt demo scope, review tích hợp, tổng hợp báo cáo, điều phối bàn giao |
| Hoàng Gia Huy | Backend Stabilization | Fix security/API, test backend, hỗ trợ bug |
| Nguyễn Đức Khải | Data Flow Stabilization | Fix resident/household flow, test nghiệp vụ, hỗ trợ bug |
| Trần Đình Nam | Frontend Polish | Màn khoản thu, thanh toán, polish UI, fix responsive |
| Phạm Việt Tiến | Payment / QA / Deployment | Thanh toán, QR/mock payment, E2E test, hướng dẫn deploy |

## Kế hoạch theo ngày

| Ngày | Đỗ Hải Đăng | Hoàng Gia Huy | Nguyễn Đức Khải | Trần Đình Nam | Phạm Việt Tiến |
|---|---|---|---|---|---|
| 20/05 | Chốt danh sách chức năng demo | Fix security/API lỗi tồn đọng | Fix nghiệp vụ cư dân | Làm màn khoản thu | Hoàn thiện API thanh toán |
| 21/05 | Review tích hợp toàn hệ thống | Hardening backend | Bổ sung export/tìm kiếm nếu kịp | Làm màn thanh toán | Làm Dynamic QR hoặc mock payment |
| 22/05 | Chuẩn hóa tài liệu API | Test backend | Test resident flow | Gắn payment API | Test payment flow |
| 23/05 | Viết báo cáo tiến độ và rủi ro | Fix bug nghiêm trọng | Fix bug nghiêm trọng | Fix UI/mobile | Viết Docker/dev setup guide |
| 24/05 | Chuẩn bị kịch bản demo | Review lần cuối backend | Review dữ liệu demo | Polish giao diện | Kiểm thử end-to-end |
| 25/05 | Tổng duyệt demo | Hỗ trợ fix bug | Hỗ trợ fix bug | Hỗ trợ fix bug UI | Checklist QA và đóng bug |
| 26/05 | Bàn giao bản hoàn chỉnh | Đóng task backend | Đóng task backend | Đóng task frontend | Đóng task test/deploy |

## Công việc chi tiết

### Đỗ Hải Đăng

- Chốt danh sách chức năng sẽ demo, không mở thêm scope lớn trong tuần 3.
- Review tích hợp toàn hệ thống: frontend, backend, database, dữ liệu mẫu.
- Viết kịch bản demo theo luồng: đăng nhập, dashboard, căn hộ, cư dân, khoản thu, thanh toán.
- Tổng hợp báo cáo nhóm: mục tiêu, công nghệ, phân công, kết quả, hạn chế, hướng phát triển.
- Điều phối ngày bàn giao 26/05/2026.

### Hoàng Gia Huy

- Rà soát security config và các endpoint cần bảo vệ.
- Fix các lỗi auth/căn hộ còn tồn đọng từ tuần 2.
- Kiểm tra validation, HTTP status code và response error.
- Chạy test backend và ghi lại kết quả.
- Hỗ trợ các bug tích hợp nếu liên quan backend.

### Nguyễn Đức Khải

- Rà soát luồng cư dân, hộ gia đình và liên kết căn hộ.
- Kiểm tra dữ liệu demo có phù hợp với kịch bản demo.
- Fix lỗi nghiệp vụ: trùng thông tin, xóa/sửa cư dân, thông tin chủ hộ.
- Nếu còn thời gian, bổ sung tìm kiếm/lọc hoặc export đơn giản.
- Hỗ trợ test end-to-end cho các flow có resident.

### Trần Đình Nam

- Làm màn khoản thu: danh sách, tạo mới, xem trạng thái.
- Làm màn thanh toán: danh sách giao dịch, ghi nhận thanh toán.
- Gắn API payment/fee vào frontend.
- Polish UI: spacing, responsive, empty state, loading, error.
- Kiểm tra các thao tác demo không bị dừng ở trạng thái lỗi không rõ nguyên nhân.

### Phạm Việt Tiến

- Hoàn thiện API thanh toán và trạng thái payment.
- Làm Dynamic QR ở mức demo hoặc mock payment nếu chưa tích hợp gateway thật.
- Chuẩn bị seed data đầy đủ cho demo.
- Viết hướng dẫn chạy dự án bằng Docker/MySQL và các lệnh cần thiết.
- Lập checklist QA và chạy test end-to-end trước ngày 26/05/2026.

## Kịch bản demo để kiểm thử

1. Đăng nhập bằng tài khoản admin/staff mẫu.
2. Xem dashboard tổng quan.
3. Tạo mới một căn hộ và cập nhật thông tin căn hộ.
4. Tạo mới cư dân, gán cư dân vào căn hộ.
5. Tạo khoản thu cho một căn hộ.
6. Ghi nhận thanh toán cho khoản thu.
7. Kiểm tra trạng thái thanh toán đã cập nhật trên frontend.

## Tiêu chí hoàn thành tuần 3

- MVP chạy được từ frontend đến backend với database thật.
- Demo được các luồng bắt buộc không cần sửa code thủ công.
- Có seed data đủ để thuyết trình và kiểm thử.
- Có hướng dẫn setup local/Docker.
- Có báo cáo nhóm và tài liệu API cơ bản.
- Bug còn lại được ghi rõ mức độ: bắt buộc sửa, có thể chấp nhận, làm sau.
