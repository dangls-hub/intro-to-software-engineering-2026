package com.bluemoon.ams.module.resident.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.resident.dto.HouseholdRequest;
import com.bluemoon.ams.module.resident.dto.HouseholdResponse;
import com.bluemoon.ams.module.resident.service.HouseholdService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/households")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class HouseholdController {
    /* Chứa các API liên quan đến hộ gia đình: tạo, cập nhật, xoá, lấy thông tin, ...
    */

    @Autowired
    private HouseholdService householdService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<HouseholdResponse>>> getAllHouseholds(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("householdCode").ascending());
        return ResponseEntity.ok(ApiResponse.ok("Households retrieved successfully",
                householdService.getAllHouseholds(search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HouseholdResponse>> getHouseholdById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(householdService.getHouseholdById(id)));
    }

    @GetMapping("/by-apartment/{apartmentId}")
    public ResponseEntity<ApiResponse<List<HouseholdResponse>>> getByApartment(
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(ApiResponse.ok(householdService.getHouseholdsByApartment(apartmentId)));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HouseholdResponse>> createHousehold(
            @Valid @RequestBody HouseholdRequest request) {
        HouseholdResponse created = householdService.createHousehold(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Household created successfully", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HouseholdResponse>> updateHousehold(
            @PathVariable Long id,
            @Valid @RequestBody HouseholdRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Household updated successfully",
                householdService.updateHousehold(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteHousehold(@PathVariable Long id) {
        householdService.deleteHousehold(id);
        return ResponseEntity.ok(ApiResponse.ok("Household deleted successfully", null));
    }
}