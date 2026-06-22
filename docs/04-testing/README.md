# Kế hoạch kiểm thử

## Mục tiêu kiểm thử

- Xác nhận các luồng MVP hoạt động đúng từ frontend đến backend và database.
- Phát hiện lỗi tích hợp sớm trước buổi demo cuối.
- Đảm bảo dữ liệu tài chính cơ bản không bị sai lệch sau khi thao tác.
- Có checklist rõ ràng để nhóm kiểm tra lại trước khi bàn giao.

## Phạm vi kiểm thử

| Nhóm | Nội dung |
|---|---|
| Auth | Đăng nhập đúng/sai, token thiếu hoặc hết hạn, Google OAuth |
| Apartment | CRUD căn hộ, validate mã căn hộ, trạng thái căn hộ |
| Resident | CRUD cư dân, validate thông tin định danh, liên kết căn hộ, upload CCCD |
| Fee | Tạo khoản thu, xem danh sách, cập nhật trạng thái |
| Payment | Ghi nhận thanh toán, cập nhật trạng thái khoản thu |
| Chat | Gửi tin nhắn, nhận tin real-time, gửi file/ảnh, emoji reactions, reply |
| Announcement | Tạo, xem, cập nhật thông báo |
| Vehicle | Đăng ký, xem, cập nhật phương tiện |
| Report | Cư dân gửi phản ánh, admin/staff xử lý |
| Resident Portal | Cư dân xem khoản thu, thanh toán, profile |
| Frontend | Routing, form, loading, error, responsive |
| Deployment | Chạy database, backend, frontend theo hướng dẫn |

## Môi trường kiểm thử

- Backend: Spring Boot chạy tại `http://localhost:8080`.
- Frontend: Vite chạy tại `http://localhost:5173`.
- Database: MySQL local hoặc MySQL Docker.
- Dữ liệu: seed data mẫu gồm user admin/staff, căn hộ, cư dân, khoản thu và thanh toán.

## Test case chính

| Mã | Luồng kiểm thử | Bước thực hiện | Kết quả mong đợi |
|---|---|---|---|
| TC-01 | Health check | Gọi `GET /api/v1/health` | Trả HTTP 200 |
| TC-02 | Đăng nhập thành công | Nhập đúng username/password | Trả JWT và thông tin người dùng |
| TC-03 | Đăng nhập thất bại | Nhập sai password | Trả lỗi xác thực rõ ràng |
| TC-04 | Tạo căn hộ | Nhập mã căn hộ hợp lệ và lưu | Căn hộ xuất hiện trong danh sách |
| TC-05 | Validate căn hộ | Tạo căn hộ thiếu mã | Trả lỗi validation |
| TC-06 | Tạo cư dân | Nhập thông tin cư dân hợp lệ | Cư dân xuất hiện trong danh sách |
| TC-07 | Gán cư dân vào căn hộ | Chọn căn hộ khi tạo/sửa cư dân | Cư dân hiển thị đúng căn hộ |
| TC-08 | Tạo khoản thu | Tạo khoản thu cho một căn hộ | Khoản thu có trạng thái chưa thanh toán |
| TC-09 | Ghi nhận thanh toán | Thanh toán khoản thu đang mở | Khoản thu chuyển sang đã thanh toán hoặc thanh toán một phần |
| TC-10 | Frontend loading/error | Tắt backend rồi thao tác gọi API | UI hiển thị lỗi, không trắng màn hình |
| TC-11 | Responsive | Mở giao diện trên màn hình nhỏ | Nội dung không tràn, thao tác chính vẫn dùng được |
| TC-12 | Demo end-to-end | Chạy toàn bộ kịch bản demo | Không gặp lỗi chặn luồng |
| TC-13 | Upload CCCD | Cư dân upload ảnh CCCD mặt trước/sau khi xin vào căn hộ | Ảnh được lưu, yêu cầu chuyển sang PENDING |
| TC-14 | Phê duyệt cư dân | Admin phê duyệt/từ chối yêu cầu vào căn hộ | Trạng thái cư dân thay đổi đúng |
| TC-15 | Chat gửi tin nhắn | Gửi tin nhắn trong chat | Tin nhắn hiển thị real-time cho các user khác |
| TC-16 | Chat gửi file | Upload file/ảnh trong chat | File được lưu và hiển thị đúng |
| TC-17 | Chat reaction | Thêm emoji reaction vào tin nhắn | Reaction hiển thị đúng, toggle on/off |
| TC-18 | Thông báo | Tạo thông báo cho cư dân | Thông báo xuất hiện trên cổng cư dân |
| TC-19 | Quản lý phương tiện | Đăng ký phương tiện cho cư dân | Phương tiện xuất hiện trong danh sách |
| TC-20 | Phản ánh cư dân | Cư dân gửi phản ánh | Phản ánh lưu thành công, admin/staff xem được |

## Checklist trước demo

- Backend build thành công.
- Frontend build thành công.
- MySQL có dữ liệu mẫu.
- Đăng nhập được bằng tài khoản demo.
- Các API chính trả đúng HTTP status.
- Không còn lỗi console nghiêm trọng ở frontend.
- Kịch bản demo chạy được liên tục.
- Các bug còn lại đã được ghi rõ mức độ.

## Phân loại lỗi

| Mức độ | Ý nghĩa | Cách xử lý |
|---|---|---|
| Critical | Lỗi làm hệ thống không chạy hoặc không demo được luồng chính | Phải sửa trước bàn giao |
| Major | Lỗi ảnh hưởng chức năng chính nhưng có cách tạm xử lý | Ưu tiên sửa trong tuần 3 |
| Minor | Lỗi nhỏ về hiển thị hoặc trải nghiệm | Sửa nếu còn thời gian |
| Backlog | Không thuộc MVP hoặc tính năng mở rộng | Ghi nhận cho giai đoạn sau |

## Definition of Done

- Chức năng có API hoặc UI tương ứng đã chạy được.
- Dữ liệu được lưu và đọc lại đúng từ database.
- Có xử lý lỗi cơ bản.
- Có ít nhất một test case hoặc checklist kiểm thử.
- Đã được review và demo nội bộ.
