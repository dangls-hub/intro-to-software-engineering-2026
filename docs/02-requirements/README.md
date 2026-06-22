# Yêu cầu phần mềm

## Mục tiêu

BlueMoon AMS là hệ thống quản lý chung cư hỗ trợ ban quản lý số hóa nghiệp vụ quản lý căn hộ, cư dân, khoản thu, thanh toán, phương tiện, thông báo và giao tiếp nội bộ. Hệ thống cung cấp cổng riêng cho cư dân và bộ công cụ quản trị cho admin/staff.

## Phạm vi MVP

### Trong phạm vi

- Đăng nhập bằng tài khoản quản trị, nhân viên hoặc cư dân (hỗ trợ Google OAuth).
- Quản lý căn hộ: thêm, xem, sửa, xóa hoặc vô hiệu hóa.
- Quản lý cư dân: thêm, xem, sửa, xóa hoặc vô hiệu hóa.
- Gán cư dân vào căn hộ và xác định chủ hộ.
- Quy trình cư dân xin vào căn hộ: upload ảnh CCCD mặt trước/sau, admin phê duyệt hoặc từ chối.
- Quản lý loại khoản thu và đợt thu.
- Ghi nhận thanh toán thủ công hoặc qua mock QR/payment.
- Dashboard tổng quan số lượng căn hộ, cư dân, khoản thu và thanh toán.
- Chat nội bộ real-time: gửi tin nhắn, chia sẻ file/ảnh, emoji reactions, reply, mention (@).
- Quản lý thông báo và sự kiện chung cư.
- Quản lý phương tiện (xe máy, ô tô) của cư dân.
- Cổng cư dân: xem khoản thu, thanh toán, gửi phản ánh/báo cáo.
- Gửi email thông báo tự động khi có sự kiện quan trọng.

### Ngoài phạm vi

- Tích hợp payment gateway thật ở môi trường production.
- Ứng dụng mobile riêng.
- Phân tích tài chính nâng cao.

## Tác nhân sử dụng

| Tác nhân | Mô tả | Quyền chính |
|---|---|---|
| Admin | Người quản trị hệ thống | Quản lý tài khoản, toàn bộ dữ liệu, cấu hình, phê duyệt cư dân |
| Staff | Nhân viên ban quản lý | Quản lý căn hộ, cư dân, khoản thu, thanh toán, thông báo |
| Resident | Cư dân | Xem khoản thu/thanh toán, gửi yêu cầu vào căn hộ, gửi phản ánh, chat |

## Yêu cầu chức năng

| Mã | Chức năng | Mô tả | Ưu tiên |
|---|---|---|---|
| FR-01 | Đăng nhập | Người dùng đăng nhập bằng tài khoản và mật khẩu, hệ thống trả JWT | Bắt buộc |
| FR-02 | Phân quyền | API quản trị yêu cầu token hợp lệ, phân biệt admin/staff ở mức cơ bản | Bắt buộc |
| FR-03 | Quản lý căn hộ | Thêm, xem danh sách, xem chi tiết, cập nhật, xóa/vô hiệu hóa căn hộ | Bắt buộc |
| FR-04 | Quản lý cư dân | Thêm, xem danh sách, xem chi tiết, cập nhật, xóa/vô hiệu hóa cư dân | Bắt buộc |
| FR-05 | Liên kết cư dân-căn hộ | Gán cư dân vào căn hộ, xác định chủ hộ và thành viên | Bắt buộc |
| FR-06 | Quản lý khoản thu | Tạo loại phí, đợt thu và khoản thu theo căn hộ | Bắt buộc |
| FR-07 | Ghi nhận thanh toán | Ghi nhận giao dịch thanh toán và cập nhật trạng thái khoản thu | Bắt buộc |
| FR-08 | Dashboard | Hiển thị thống kê tổng quan cho ban quản lý | Nên có |
| FR-09 | Tìm kiếm/lọc | Tìm kiếm căn hộ, cư dân, khoản thu theo thông tin chính | Nên có |
| FR-10 | Dynamic QR/mock payment | Tạo QR hoặc mô phỏng luồng thanh toán để demo | Nên có |
| FR-11 | Chat nội bộ | Gửi tin nhắn real-time, chia sẻ file/ảnh, emoji reactions, reply, mention | Đã triển khai |
| FR-12 | Upload CCCD | Cư dân upload ảnh CCCD mặt trước/sau khi xin vào căn hộ | Đã triển khai |
| FR-13 | Thông báo/Sự kiện | Tạo và quản lý thông báo, sự kiện cho cư dân | Đã triển khai |
| FR-14 | Quản lý phương tiện | Đăng ký và quản lý xe máy, ô tô của cư dân | Đã triển khai |
| FR-15 | Cổng cư dân | Cư dân đăng nhập xem khoản thu, thanh toán, gửi phản ánh | Đã triển khai |
| FR-16 | Google OAuth | Hỗ trợ đăng nhập bằng tài khoản Google | Đã triển khai |
| FR-17 | Email thông báo | Gửi email tự động khi có sự kiện quan trọng | Đã triển khai |
| FR-18 | Phản ánh/Báo cáo | Cư dân gửi phản ánh, admin/staff xem và xử lý | Đã triển khai |

## Yêu cầu phi chức năng

| Mã | Yêu cầu | Mô tả |
|---|---|---|
| NFR-01 | Bảo mật | Mật khẩu phải được mã hóa, API quản trị phải yêu cầu xác thực |
| NFR-02 | Toàn vẹn dữ liệu | Dữ liệu tài chính cần tránh mất mát, sai lệch hoặc xóa nhầm |
| NFR-03 | Dễ vận hành | Dự án có hướng dẫn chạy backend, frontend và database rõ ràng |
| NFR-04 | Khả năng mở rộng | Cấu trúc module cho phép bổ sung nghiệp vụ sau MVP |
| NFR-05 | Khả năng kiểm thử | Các luồng chính có checklist hoặc test case rõ ràng |
| NFR-06 | Trải nghiệm người dùng | Giao diện dễ đọc, thao tác CRUD rõ ràng, có trạng thái loading/error |

## User stories chính

| Mã | User story | Tiêu chí chấp nhận |
|---|---|---|
| US-01 | Là nhân viên, tôi muốn đăng nhập để sử dụng hệ thống quản lý | Đăng nhập đúng trả token, đăng nhập sai trả lỗi rõ ràng |
| US-02 | Là nhân viên, tôi muốn thêm căn hộ để quản lý dữ liệu chung cư | Tạo căn hộ thành công, căn hộ xuất hiện trong danh sách |
| US-03 | Là nhân viên, tôi muốn thêm cư dân vào căn hộ để lưu thông tin hộ dân | Tạo cư dân thành công và hiển thị liên kết với căn hộ |
| US-04 | Là nhân viên, tôi muốn tạo khoản thu để theo dõi nghĩa vụ tài chính | Khoản thu được tạo với số tiền, hạn nộp và trạng thái |
| US-05 | Là nhân viên, tôi muốn ghi nhận thanh toán để cập nhật công nợ | Sau khi ghi nhận, trạng thái khoản thu thay đổi đúng |
| US-06 | Là cư dân, tôi muốn xin vào căn hộ bằng cách upload CCCD | Upload ảnh CCCD, gửi yêu cầu thành công, chờ phê duyệt |
| US-07 | Là cư dân, tôi muốn chat với ban quản lý và cư dân khác | Gửi tin nhắn, nhận tin nhắn real-time, gửi file/ảnh |
| US-08 | Là cư dân, tôi muốn xem khoản thu và thanh toán của mình | Hiển thị đúng danh sách khoản thu và lịch sử thanh toán |
| US-09 | Là admin, tôi muốn phê duyệt yêu cầu vào căn hộ của cư dân | Xem ảnh CCCD, phê duyệt hoặc từ chối với lý do |
| US-10 | Là cư dân, tôi muốn gửi phản ánh về vấn đề trong chung cư | Tạo phản ánh thành công, ban quản lý nhận được thông báo |

## Ràng buộc dữ liệu cơ bản

- Mỗi căn hộ có mã căn hộ duy nhất.
- Mỗi cư dân có thông tin định danh không được trùng trong phạm vi dữ liệu hiện có.
- Một khoản thu phải thuộc về một căn hộ hoặc một đợt thu xác định.
- Một thanh toán phải liên kết với khoản thu cụ thể.
- Số tiền khoản thu và thanh toán không được âm.
