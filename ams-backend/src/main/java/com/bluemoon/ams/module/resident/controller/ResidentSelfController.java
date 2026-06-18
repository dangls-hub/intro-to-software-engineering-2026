package com.bluemoon.ams.module.resident.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.resident.dto.ApartmentJoinRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.service.ResidentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/residents/me")
@PreAuthorize("hasRole('RESIDENT')")
public class ResidentSelfController {

    @Autowired
    private ResidentService residentService;

    @GetMapping("/apartment-request")
    public ResponseEntity<ApiResponse<ResidentResponse>> getApartmentRequest(Authentication authentication) {
        ResidentResponse response = residentService.getCurrentResidentRequest(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Lấy yêu cầu căn hộ thành công", response));
    }

    @PostMapping("/apartment-request")
    public ResponseEntity<ApiResponse<ResidentResponse>> requestApartmentJoin(
            Authentication authentication,
            @Valid @RequestBody ApartmentJoinRequest request) {
        ResidentResponse response = residentService.requestApartmentJoin(authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi yêu cầu vào căn hộ, vui lòng chờ admin duyệt", response));
    }
}
