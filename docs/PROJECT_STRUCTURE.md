# Cấu trúc thư mục dự án BlueMoon AMS

Dự án được tổ chức theo hướng monorepo, trong đó `ams-backend` là ứng dụng backend Spring Boot và `ams-frontend` là ứng dụng giao diện React/Vite.

```text
intro-to-software-engineering-2026/
|-- ams-backend/                  # Backend Spring Boot
|   |-- src/main/java/com/bluemoon/ams/
|   |   |-- controller/            # Controller hiện có, ví dụ HealthController
|   |   |-- common/                # Thành phần dùng chung
|   |   |   |-- config/
|   |   |   |-- exception/
|   |   |   |-- response/
|   |   |   |-- security/
|   |   |   `-- util/
|   |   `-- module/                # Nghiệp vụ chính, chia theo miền chức năng
|   |       |-- apartment/
|   |       |-- auth/
|   |       |-- fee/
|   |       |-- payment/
|   |       `-- resident/
|   |-- src/main/resources/
|   |   |-- db/migration/          # Migration cơ sở dữ liệu
|   |   `-- static/assets/         # Tài nguyên tĩnh nếu backend cần phục vụ
|   `-- src/test/                  # Kiểm thử đơn vị và kiểm thử tích hợp backend
|-- ams-frontend/                 # Frontend React/Vite
|   |-- public/                    # Tệp tĩnh public
|   |-- src/
|   |   |-- assets/                # Ảnh, icon, media dùng trong giao diện
|   |   |-- components/            # Component dùng chung
|   |   |   |-- layout/
|   |   |   `-- ui/
|   |   |-- features/              # Màn hình và logic theo nghiệp vụ
|   |   |   |-- apartments/
|   |   |   |-- auth/
|   |   |   |-- dashboard/
|   |   |   |-- fees/
|   |   |   |-- payments/
|   |   |   `-- residents/
|   |   |-- hooks/
|   |   |-- lib/
|   |   |-- routes/
|   |   |-- store/
|   |   `-- utils/
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
|-- database/
|   |-- diagrams/                  # ERD, sơ đồ cơ sở dữ liệu
|   |-- migrations/                # Script SQL độc lập nếu cần
|   `-- seed/                      # Dữ liệu mẫu
|-- deployment/
|   |-- docker/                    # Cấu hình Docker bổ sung
|   |-- environments/              # Mẫu cấu hình môi trường
|   `-- nginx/                     # Reverse proxy nếu triển khai web
|-- docs/
|   |-- 01-planning/
|   |-- 02-requirements/
|   |-- 03-design/
|   |-- 04-testing/
|   |-- 05-deployment/
|   `-- 06-reports/
|-- scripts/                       # Script hỗ trợ build, chạy ứng dụng, sao lưu
`-- tests/
    |-- api/                       # Bộ sưu tập Postman/HTTP
    `-- test-data/                 # Dữ liệu phục vụ kiểm thử
```

Quy ước:
- Thư mục gốc chỉ giữ các tệp cấu hình chung và các module lớn.
- Backend chia theo `common` cho thành phần dùng chung và `module` cho nghiệp vụ.
- Frontend chia theo `features` để mỗi nghiệp vụ có thể gom riêng API, component và page.
- Mỗi module nghiệp vụ có các lớp `controller`, `service`, `repository`, `entity`, `dto`, `mapper` khi bắt đầu hiện thực.
- Tài liệu dự án nằm trong `docs`, script cơ sở dữ liệu nằm trong `database`, cấu hình triển khai nằm trong `deployment`.
