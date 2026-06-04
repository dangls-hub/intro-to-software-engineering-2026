package com.bluemoon.ams.module.resident.controller;

import com.bluemoon.ams.common.response.ApiResponse;
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
}