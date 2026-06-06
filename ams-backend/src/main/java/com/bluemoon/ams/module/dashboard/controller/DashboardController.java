package com.bluemoon.ams.module.dashboard.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.dashboard.dto.DashboardStatsResponse;
import com.bluemoon.ams.module.dashboard.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller cho Dashboard.
 * Base path: /api/v1/dashboard
 */
@RestController
@RequestMapping("/api/v1/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/v1/dashboard/stats — Trả về thống kê tổng quan.
     * Bao gồm: tổng căn hộ, tổng cư dân, tổng khoản thu, tổng thanh toán,
     * doanh thu tháng hiện tại và tỷ lệ thanh toán.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getStats() {
        DashboardStatsResponse stats = dashboardService.getStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }
}
