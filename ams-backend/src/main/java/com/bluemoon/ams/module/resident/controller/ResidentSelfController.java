package com.bluemoon.ams.module.resident.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.resident.dto.ApartmentJoinRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.service.ResidentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

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

    @PostMapping(value = "/apartment-request", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ResidentResponse>> requestApartmentJoin(
            Authentication authentication,
            @RequestParam("apartmentId") Long apartmentId,
            @RequestParam(value = "identityNumber", required = false) String identityNumber,
            @RequestParam(value = "phoneNumber", required = false) String phoneNumber,
            @RequestParam(value = "dateOfBirth", required = false) String dateOfBirth,
            @RequestParam(value = "gender", required = false) String gender,
            @RequestParam(value = "relationshipType", required = false, defaultValue = "OTHER") String relationshipType,
            @RequestPart("cccdFront") MultipartFile cccdFront,
            @RequestPart("cccdBack") MultipartFile cccdBack) {

        ApartmentJoinRequest request = new ApartmentJoinRequest();
        request.setApartmentId(apartmentId);
        request.setIdentityNumber(identityNumber);
        request.setPhoneNumber(phoneNumber);
        if (dateOfBirth != null && !dateOfBirth.isBlank()) {
            request.setDateOfBirth(LocalDate.parse(dateOfBirth));
        }
        request.setGender(gender);
        request.setRelationshipType(relationshipType);

        ResidentResponse response = residentService.requestApartmentJoin(
                authentication.getName(), request, cccdFront, cccdBack);
        return ResponseEntity.ok(ApiResponse.ok("Đã gửi yêu cầu vào căn hộ, vui lòng chờ admin duyệt", response));
    }
}
