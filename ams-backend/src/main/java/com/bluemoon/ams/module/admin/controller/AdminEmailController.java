package com.bluemoon.ams.module.admin.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.common.service.EmailBroadcastService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

/**
 * Endpoint cho ADMIN chủ động gửi email hàng loạt tới cư dân:
 * bảo trì, khẩn cấp, an ninh, đổi giá dịch vụ, và trigger nhắc nợ thủ công.
 */
@RestController
@RequestMapping("/api/v1/admin/emails")
@PreAuthorize("hasRole('ADMIN')")
public class AdminEmailController {

    @Autowired
    private EmailBroadcastService broadcastService;

    @PostMapping("/maintenance")
    public ResponseEntity<ApiResponse<Integer>> maintenance(@Valid @RequestBody MaintenanceRequest req) {
        int n = broadcastService.broadcastMaintenance(req.getIssue(), req.getStartTime(), req.getEndTime());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi thông báo bảo trì tới " + n + " cư dân.", n));
    }

    @PostMapping("/emergency")
    public ResponseEntity<ApiResponse<Integer>> emergency(@Valid @RequestBody MessageRequest req) {
        int n = broadcastService.broadcastEmergency(req.getMessage());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi cảnh báo khẩn cấp tới " + n + " cư dân.", n));
    }

    @PostMapping("/security")
    public ResponseEntity<ApiResponse<Integer>> security(@Valid @RequestBody MessageRequest req) {
        int n = broadcastService.broadcastSecurity(req.getMessage());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi cảnh báo an ninh tới " + n + " cư dân.", n));
    }

    @PostMapping("/price-change")
    public ResponseEntity<ApiResponse<Integer>> priceChange(@Valid @RequestBody PriceChangeRequest req) {
        int n = broadcastService.broadcastPriceChange(
                req.getServiceName(), req.getOldPrice(), req.getNewPrice(), req.getEffectiveDate());
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi thông báo đổi giá tới " + n + " cư dân.", n));
    }

    @PostMapping("/debt-reminders")
    public ResponseEntity<ApiResponse<Integer>> debtReminders() {
        int n = broadcastService.runDebtReminders();
        return ResponseEntity.ok(ApiResponse.ok("Đã kích hoạt " + n + " email nhắc nợ.", n));
    }

    /* ── Request DTOs ───────────────────────────────── */

    public static class MaintenanceRequest {
        @NotBlank(message = "Vui lòng nhập hạng mục bảo trì")
        private String issue;
        @NotBlank(message = "Vui lòng nhập thời gian bắt đầu")
        private String startTime;
        @NotBlank(message = "Vui lòng nhập thời gian kết thúc")
        private String endTime;

        public String getIssue() { return issue; }
        public void setIssue(String issue) { this.issue = issue; }
        public String getStartTime() { return startTime; }
        public void setStartTime(String startTime) { this.startTime = startTime; }
        public String getEndTime() { return endTime; }
        public void setEndTime(String endTime) { this.endTime = endTime; }
    }

    public static class MessageRequest {
        @NotBlank(message = "Vui lòng nhập nội dung")
        private String message;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class PriceChangeRequest {
        @NotBlank(message = "Vui lòng nhập tên dịch vụ")
        private String serviceName;
        @NotNull(message = "Vui lòng nhập giá hiện tại")
        private BigDecimal oldPrice;
        @NotNull(message = "Vui lòng nhập giá mới")
        private BigDecimal newPrice;
        @NotBlank(message = "Vui lòng nhập ngày hiệu lực")
        private String effectiveDate;

        public String getServiceName() { return serviceName; }
        public void setServiceName(String serviceName) { this.serviceName = serviceName; }
        public BigDecimal getOldPrice() { return oldPrice; }
        public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }
        public BigDecimal getNewPrice() { return newPrice; }
        public void setNewPrice(BigDecimal newPrice) { this.newPrice = newPrice; }
        public String getEffectiveDate() { return effectiveDate; }
        public void setEffectiveDate(String effectiveDate) { this.effectiveDate = effectiveDate; }
    }
}
