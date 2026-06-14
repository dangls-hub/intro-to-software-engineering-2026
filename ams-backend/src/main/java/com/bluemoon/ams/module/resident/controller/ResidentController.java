package com.bluemoon.ams.module.resident.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.resident.dto.ApprovalRequest;
import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.service.ResidentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/residents")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class ResidentController {
    /* Chứa các API liên quan đến cư dân: tạo, cập nhật, xoá, lấy thông tin, ... Các API này chỉ cho phép ADMIN và STAFF truy cập
     */

    private final ResidentService residentService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ResidentResponse>>> getAllResidents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("fullName").ascending());
        Page<ResidentResponse> result = residentService.getAllResidents(search, status, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Residents retrieved successfully", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResidentResponse>> getResidentById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(residentService.getResidentById(id)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResidentResponse>> createResident(
            @Valid @RequestBody ResidentRequest request) {
        ResidentResponse created = residentService.createResident(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Resident created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResidentResponse>> updateResident(
            @PathVariable Long id,
            @Valid @RequestBody ResidentRequest request) {
        ResidentResponse updated = residentService.updateResident(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Resident updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteResident(@PathVariable Long id) {
        residentService.deleteResident(id);
        return ResponseEntity.ok(ApiResponse.ok("Resident deleted successfully", null));
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<ResidentResponse>> deactivateResident(@PathVariable Long id) {
        ResidentResponse result = residentService.deactivateResident(id);
        return ResponseEntity.ok(ApiResponse.ok("Resident deactivated successfully", result));
    }

    // --- Approval workflow endpoints (ADMIN only) ---

    /**
     * Lấy danh sách cư dân đang chờ phê duyệt
     * GET /api/v1/residents/pending
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<ResidentResponse>>> getPendingResidents(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ResidentResponse> result = residentService.getPendingResidents(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Pending residents retrieved successfully", result));
    }

    /**
     * Đếm số lượng cư dân đang chờ phê duyệt (cho badge trên sidebar)
     * GET /api/v1/residents/pending/count
     */
    @GetMapping("/pending/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> countPendingResidents() {
        long count = residentService.countPendingResidents();
        return ResponseEntity.ok(ApiResponse.ok("Pending count retrieved", count));
    }

    /**
     * Phê duyệt hoặc từ chối cư dân
     * POST /api/v1/residents/{id}/approve
     * Body: { "action": "APPROVE" } hoặc { "action": "REJECT", "rejectReason": "..." }
     */
    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ResidentResponse>> approveOrRejectResident(
            @PathVariable Long id,
            @Valid @RequestBody ApprovalRequest request,
            Authentication authentication) {
        String approverUsername = authentication.getName();
        ResidentResponse result;

        if ("APPROVE".equalsIgnoreCase(request.getAction())) {
            result = residentService.approveResident(id, approverUsername);
            return ResponseEntity.ok(ApiResponse.ok("Phê duyệt cư dân thành công", result));
        } else if ("REJECT".equalsIgnoreCase(request.getAction())) {
            if (request.getRejectReason() == null || request.getRejectReason().isBlank()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Vui lòng nhập lý do từ chối"));
            }
            result = residentService.rejectResident(id, approverUsername, request.getRejectReason());
            return ResponseEntity.ok(ApiResponse.ok("Từ chối cư dân thành công", result));
        } else {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Hành động không hợp lệ. Chỉ chấp nhận APPROVE hoặc REJECT."));
        }
    }
}