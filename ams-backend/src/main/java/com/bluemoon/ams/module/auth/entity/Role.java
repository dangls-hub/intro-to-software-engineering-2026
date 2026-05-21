package com.bluemoon.ams.module.auth.entity;

public enum Role {
    ADMIN,      // Quản trị viên, quyền truy cập toàn bộ
    STAFF,      // Nhân viên quản lý, quyền truy cập giới hạn
    RESIDENT    // Cư dân, chỉ xem thông tin cá nhân, khoản thu và thanh toán
}
