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

## Phân công công việc chi tiết

### Đỗ Hải Đăng — Tech Lead + Backend Dashboard & Tích hợp cuối

> **Vai trò:** Điều phối bàn giao, fix bug integration, code Dashboard API và báo cáo.

**Backend — Dashboard API:**
- `controller/DashboardController.java` — API `GET /api/dashboard/stats` trả về thống kê tổng quan (tổng căn hộ, tổng cư dân, tổng doanh thu tháng, tỷ lệ thanh toán)
- Hỗ trợ fix bug phát sinh ở `common/security/` và `common/exception/`

**Tài liệu & Báo cáo:**
- Tổng hợp `docs/06-reports/bao-cao-tuan-3.md`
- Chuẩn bị kịch bản demo (script demo 7 bước)
- Cập nhật `docs/05-deployment/README.md` — hướng dẫn chạy local hoàn chỉnh

---

### Hoàng Gia Huy — Backend Stabilization (Auth & Apartment)

- Fix bug liên quan đến JWT hết hạn, sai role, lỗi 403/401 không rõ nguyên nhân
- Thêm endpoint `GET /api/auth/me` — trả về thông tin user đang đăng nhập
- Thêm tìm kiếm/lọc cho API căn hộ (`?status=`, `?floor=`, `?search=`)
- Viết test: `AuthControllerTest.java`, `ApartmentControllerTest.java`

---

### Nguyễn Đức Khải — Backend Stabilization (Resident & Household)

- Fix bug liên quan đến liên kết cư dân ↔ căn hộ sai nghiệp vụ
- Thêm tìm kiếm/lọc cho API cư dân (`?apartmentId=`, `?name=`)
- Đảm bảo khi xoá căn hộ không gây lỗi cascade xoá cư dân
- Viết test: `ResidentControllerTest.java`

---

### Trần Đình Nam — Frontend Polish & Payment UI

**`src/features/fees/`:**
- `api/feeApi.js` — Hàm gọi CRUD `/api/fees`
- `pages/FeeListPage.jsx` — Danh sách khoản thu, lọc theo căn hộ/trạng thái
- `pages/FeeFormPage.jsx` — Form tạo/sửa khoản thu
- `components/FeeStatusBadge.jsx` — Badge trạng thái (Chưa thu / Đã thu / Quá hạn)

**`src/features/payments/`:**
- `api/paymentApi.js` — Hàm gọi `/api/payments`
- `pages/PaymentPage.jsx` — Ghi nhận thanh toán, hiển thị kết quả cập nhật trạng thái

**`src/features/dashboard/`:**
- `pages/DashboardPage.jsx` — Gọi API thống kê, hiển thị số liệu tổng quan

**Polish chung:**
- Xử lý loading spinner, error toast trên tất cả các màn hình
- Responsive layout cho màn hình nhỏ (tablet/mobile)
- Fix lỗi UI phát sinh sau khi tích hợp API thật

---

### Phạm Việt Tiến — Backend Payment, Seed Data & QA

**Backend `module/payment/` — Thanh toán:**
- `entity/Payment.java` — Entity ghi nhận thanh toán (khoản thu, số tiền, ngày, phương thức)
- `repository/PaymentRepository.java`
- `dto/PaymentRequest.java`, `dto/PaymentResponse.java`
- `mapper/PaymentMapper.java`
- `service/PaymentService.java` — Ghi nhận thanh toán, tự động cập nhật trạng thái Fee
- `controller/PaymentController.java` — API `POST /api/payments`, `GET /api/payments`

**Database:**
- `database/migrations/V5__create_payments_table.sql`
- `database/seed/seed_fees.sql` — Khoản thu mẫu cho các căn hộ
- `database/seed/seed_payments.sql` — Thanh toán mẫu

**QA / Kiểm thử:**
- Chạy checklist test tất cả các luồng theo kịch bản demo
- Ghi lại bug còn lại vào GitHub board, phân loại mức độ (Critical / High / Low)
- Viết `docs/04-testing/checklist.md` — danh sách test case đã chạy và kết quả

---

## Kịch bản demo bắt buộc (7 bước)

1. Đăng nhập bằng tài khoản admin/staff mẫu.
2. Xem dashboard tổng quan (số căn hộ, cư dân, doanh thu).
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

---

## 📊 Theo dõi tiến độ Sprint 3

| Hạng mục | Người thực hiện | Trạng thái |
|---|---|---|
| `DashboardController.java` (API stats) | Đỗ Hải Đăng | ⬜ Todo |
| Fix bug `common/security/` & `common/exception/` | Đỗ Hải Đăng | ✅ Done |
| `docs/06-reports/bao-cao-tuan-3.md` | Đỗ Hải Đăng | ⬜ Todo |
| `docs/05-deployment/README.md` (hướng dẫn hoàn chỉnh) | Đỗ Hải Đăng | ✅ Done |
| Fix bug JWT / 403 / 401 | Hoàng Gia Huy | ✅ Done |
| API `GET /api/auth/me` | Hoàng Gia Huy | ⚠️ Cần kiểm tra |
| Tìm kiếm/lọc API căn hộ | Hoàng Gia Huy | ⬜ Todo |
| `AuthControllerTest.java`, `ApartmentControllerTest.java` | Hoàng Gia Huy | ✅ Done |
| Fix bug resident ↔ apartment cascade | Nguyễn Đức Khải | ⚠️ Cần kiểm tra |
| Tìm kiếm/lọc API cư dân | Nguyễn Đức Khải | ⚠️ Cần kiểm tra |
| `ResidentControllerTest.java` | Nguyễn Đức Khải | ✅ Done |
| `features/fees/` (pages + api + components) | Trần Đình Nam | ✅ Done |
| `features/payments/` (pages + api) | Trần Đình Nam | ✅ Done |
| `features/dashboard/DashboardPage.jsx` | Trần Đình Nam | ✅ Done |
| Loading/error state toàn bộ màn hình | Trần Đình Nam | ✅ Done |
| Responsive layout | Trần Đình Nam | ⚠️ Cần kiểm tra |
| `module/payment/` (Entity → Controller) | Phạm Việt Tiến | ✅ Done |
| `database/migrations/V5__create_payments_table.sql` | Phạm Việt Tiến | ✅ Done |
| `database/seed/` fees, payments | Phạm Việt Tiến | ✅ Done |
| Checklist test (`docs/04-testing/checklist.md`) | Phạm Việt Tiến | ✅ Done (chưa điền kết quả) |
| Chạy test toàn bộ kịch bản demo | Phạm Việt Tiến | ⬜ Todo |
