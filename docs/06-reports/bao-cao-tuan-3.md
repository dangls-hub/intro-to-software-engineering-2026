# Báo cáo tuần 3

## Thời gian

- Từ ngày: 20/05/2026
- Đến ngày: 26/05/2026

## Mục tiêu tuần

- Hoàn thiện luồng thanh toán (Payment) end-to-end.
- Kiểm thử toàn bộ hệ thống (backend API + frontend).
- Fix bug tích hợp và ổn định hệ thống.
- Triển khai Dashboard API thống kê tổng quan.
- Chuẩn bị kịch bản demo 7 bước và bàn giao MVP.
- Hoàn thiện tài liệu deployment, testing và báo cáo.

## Công việc đã hoàn thành

| Thành viên | Công việc | Kết quả |
|---|---|---|
| Đỗ Hải Đăng | `DashboardController.java` — API `GET /api/v1/dashboard/stats` trả về thống kê tổng quan (tổng căn hộ, cư dân, khoản thu, thanh toán, doanh thu tháng, tỷ lệ thanh toán) | ✅ Hoàn thành |
| Đỗ Hải Đăng | `DashboardService.java`, `DashboardStatsResponse.java` — Service và DTO cho Dashboard | ✅ Hoàn thành |
| Đỗ Hải Đăng | Fix bug `common/security/` và `common/exception/` — xử lý lỗi 401/403, chuẩn hoá response lỗi | ✅ Hoàn thành |
| Đỗ Hải Đăng | `docs/05-deployment/README.md` — hướng dẫn chạy local hoàn chỉnh | ✅ Hoàn thành |
| Đỗ Hải Đăng | Chuẩn bị kịch bản demo 7 bước, điều phối tích hợp cuối | ✅ Hoàn thành |
| Hoàng Gia Huy | Fix bug JWT hết hạn, lỗi 403/401 không rõ nguyên nhân | ✅ Hoàn thành |
| Hoàng Gia Huy | `AuthControllerTest.java`, `ApartmentControllerTest.java` — unit test cho Auth và Apartment | ✅ Hoàn thành |
| Hoàng Gia Huy | API `GET /api/auth/me` — trả về thông tin user đang đăng nhập | ⚠️ Cần kiểm tra |
| Hoàng Gia Huy | Tìm kiếm/lọc API căn hộ (`?status=`, `?floor=`, `?search=`) | ⬜ Chưa hoàn thành |
| Nguyễn Đức Khải | `ResidentControllerTest.java` — unit test cho Resident | ✅ Hoàn thành |
| Nguyễn Đức Khải | Fix bug resident ↔ apartment cascade khi xoá | ⚠️ Cần kiểm tra |
| Nguyễn Đức Khải | Tìm kiếm/lọc API cư dân (`?apartmentId=`, `?name=`) | ⚠️ Cần kiểm tra |
| Trần Đình Nam | `features/fees/` — FeeListPage, FeeFormPage, FeeStatusBadge, feeApi | ✅ Hoàn thành |
| Trần Đình Nam | `features/payments/` — PaymentPage, paymentApi | ✅ Hoàn thành |
| Trần Đình Nam | `features/dashboard/DashboardPage.jsx` — hiển thị thống kê tổng quan | ✅ Hoàn thành |
| Trần Đình Nam | Loading spinner, error toast trên tất cả màn hình | ✅ Hoàn thành |
| Trần Đình Nam | Responsive layout (tablet/mobile) | ⚠️ Cần kiểm tra |
| Phạm Việt Tiến | `module/payment/` — Entity, Repository, DTO, Mapper, Service, Controller đầy đủ | ✅ Hoàn thành |
| Phạm Việt Tiến | `database/migrations/V5__create_payments_table.sql` | ✅ Hoàn thành |
| Phạm Việt Tiến | `database/seed/` — dữ liệu mẫu fees và payments trong `sample_data.sql` | ✅ Hoàn thành |
| Phạm Việt Tiến | `docs/04-testing/checklist.md` — danh sách 37 test case end-to-end | ✅ Hoàn thành (chưa điền kết quả) |
| Phạm Việt Tiến | Chạy test toàn bộ kịch bản demo | ⬜ Chưa hoàn thành |

## Vấn đề gặp phải

| Vấn đề | Ảnh hưởng | Hướng xử lý |
|---|---|---|
| API tìm kiếm/lọc căn hộ chưa hoàn thành | Frontend không thể lọc danh sách căn hộ theo trạng thái/tầng | Hoàng Gia Huy cần bổ sung query parameter vào `ApartmentController` |
| Chưa chạy checklist test end-to-end đầy đủ | Không xác nhận được toàn bộ luồng demo hoạt động ổn định | Phạm Việt Tiến cần chạy và điền kết quả vào `docs/04-testing/checklist.md` |
| Cascade xoá resident ↔ apartment cần kiểm tra | Có thể xoá căn hộ gây mất dữ liệu cư dân | Nguyễn Đức Khải cần verify logic cascade và viết test case bổ sung |
| Responsive layout chưa được kiểm tra kỹ | UI có thể vỡ trên màn hình nhỏ khi demo | Trần Đình Nam cần test trên các viewport tablet/mobile |

## Kế hoạch tuần tiếp theo

- Hoàn thành các task còn ⬜ Todo và ⚠️ Cần kiểm tra.
- Chạy toàn bộ checklist test và điền kết quả.
- Tổng duyệt demo nội bộ ít nhất 1 lần trước khi bàn giao.
- Chuẩn bị báo cáo cuối kỳ (`docs/06-reports/`) theo dàn ý đã có.
- Fix các bug còn lại (nếu có) sau khi chạy test end-to-end.

## Đánh giá tiến độ

- **Đúng tiến độ:** Dashboard API, Payment module (backend + frontend), Fee UI, Loading/Error states, Deployment docs, Test checklist, Bug fixes (auth/security).
- **Chậm tiến độ:** API lọc căn hộ (Hoàng Gia Huy), chạy test kịch bản demo (Phạm Việt Tiến), báo cáo tuần 3 (Đỗ Hải Đăng — đã bổ sung).
- **Rủi ro:** Responsive layout chưa kiểm tra có thể ảnh hưởng trải nghiệm demo trên thiết bị nhỏ. Cascade xoá cư dân chưa xác nhận có thể gây lỗi khi demo xoá căn hộ.

---

## Tổng kết MVP

### Các module đã hoàn thành

| Module | Backend | Frontend | Database |
|---|---|---|---|
| Authentication (JWT + Google OAuth) | ✅ | ✅ | ✅ |
| Apartment Management | ✅ | ✅ | ✅ |
| Resident & Household | ✅ | ✅ | ✅ |
| CCCD Upload & Approval | ✅ | ✅ | ✅ |
| Fee Management | ✅ | ✅ | ✅ |
| Payment Recording | ✅ | ✅ | ✅ |
| Dashboard Stats | ✅ | ✅ | — |
| Chat System (real-time) | ✅ | ✅ | ✅ |
| Announcements & Events | ✅ | ✅ | ✅ |
| Vehicle Management | ✅ | ✅ | ✅ |
| Resident Reports | ✅ | ✅ | ✅ |
| Resident Portal | ✅ | ✅ | — |
| Email Notifications | ✅ | — | — |

### Kịch bản demo 10 bước

1. Đăng nhập bằng tài khoản admin/staff mẫu.
2. Xem dashboard tổng quan (số căn hộ, cư dân, doanh thu).
3. Tạo mới hoặc cập nhật một căn hộ.
4. Tạo mới cư dân và gán vào căn hộ.
5. Tạo khoản thu cho căn hộ.
6. Ghi nhận thanh toán cho khoản thu.
7. Kiểm tra trạng thái thanh toán đã cập nhật trên frontend.
8. Đăng nhập bằng tài khoản cư dân, xin vào căn hộ (upload CCCD), admin phê duyệt.
9. Sử dụng chat: gửi tin nhắn, chia sẻ file, thêm reaction.
10. Tạo thông báo, đăng ký phương tiện, gửi phản ánh.

### Thống kê tài liệu

| Tài liệu | Đường dẫn | Trạng thái |
|---|---|---|
| Yêu cầu phần mềm | `docs/02-requirements/` | ✅ Done |
| Thiết kế hệ thống | `docs/03-design/` | ✅ Done |
| Checklist kiểm thử | `docs/04-testing/checklist.md` | ✅ Done |
| Hướng dẫn deployment | `docs/05-deployment/README.md` | ✅ Done |
| Báo cáo tuần 3 | `docs/06-reports/bao-cao-tuan-3.md` | ✅ Done |
