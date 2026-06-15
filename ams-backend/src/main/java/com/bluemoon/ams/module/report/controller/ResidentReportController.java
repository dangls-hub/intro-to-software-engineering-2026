package com.bluemoon.ams.module.report.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.report.dto.ReportRequest;
import com.bluemoon.ams.module.report.dto.ReportResponse;
import com.bluemoon.ams.module.report.dto.ReviewReportRequest;
import com.bluemoon.ams.module.report.service.ResidentReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ResidentReportController {

    private final ResidentReportService reportService;

    /**
     * POST /api/v1/reports — Resident submits a report.
     */
    @PostMapping
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<ReportResponse>> submitReport(
            Authentication authentication,
            @Valid @RequestBody ReportRequest request) {
        ReportResponse response = reportService.submitReport(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Gửi phản ánh thành công", response));
    }

    /**
     * GET /api/v1/reports/my — Resident views their own reports.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('RESIDENT')")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getMyReports(Authentication authentication) {
        List<ReportResponse> response = reportService.getMyReports(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách phản ánh thành công", response));
    }

    /**
     * GET /api/v1/reports — Admin/Staff views all reports.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<ReportResponse>>> getAllReports(
            @RequestParam(required = false) String status) {
        List<ReportResponse> response = reportService.getAllReports(status);
        return ResponseEntity.ok(ApiResponse.ok("Lấy toàn bộ danh sách phản ánh thành công", response));
    }

    /**
     * PUT /api/v1/reports/{id}/review — Admin/Staff reviews a report.
     */
    @PutMapping("/{id}/review")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<ReportResponse>> reviewReport(
            @PathVariable Long id,
            Authentication authentication,
            @Valid @RequestBody ReviewReportRequest request) {
        ReportResponse response = reportService.reviewReport(id, request, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật trạng thái phản ánh thành công", response));
    }
}
