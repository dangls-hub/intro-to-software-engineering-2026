package com.bluemoon.ams.module.apartment.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.apartment.dto.ApartmentRequest;
import com.bluemoon.ams.module.apartment.dto.ApartmentResponse;
import com.bluemoon.ams.module.apartment.service.ApartmentService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/apartments")
public class ApartmentController {

    private static final Logger log = LoggerFactory.getLogger(ApartmentController.class);

    @Autowired
    private ApartmentService apartmentService;

    /**
     * Lấy danh sách căn hộ (có hỗ trợ tìm kiếm, lọc, phân trang)
     * GET /api/v1/apartments?page=0&size=10&search=A&floor=1&status=ACTIVE
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ApartmentResponse>>> getAllApartments(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer floor,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ApartmentResponse> apartments = apartmentService.getAllApartments(floor, status, search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách căn hộ thành công", apartments));
    }

    /**
     * Lấy chi tiết căn hộ
     * GET /api/v1/apartments/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ApartmentResponse>> getApartmentById(@PathVariable Long id) {
        ApartmentResponse apartment = apartmentService.getApartmentById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy thông tin căn hộ thành công", apartment));
    }

    /**
     * Tạo mới căn hộ
     * POST /api/v1/apartments
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ApartmentResponse>> createApartment(@Valid @RequestBody ApartmentRequest request) {
        ApartmentResponse apartment = apartmentService.createApartment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo căn hộ thành công", apartment));
    }

    /**
     * Cập nhật căn hộ
     * PUT /api/v1/apartments/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ApartmentResponse>> updateApartment(
            @PathVariable Long id,
            @Valid @RequestBody ApartmentRequest request) {
        ApartmentResponse apartment = apartmentService.updateApartment(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật căn hộ thành công", apartment));
    }

    /**
     * Xóa căn hộ
     * DELETE /api/v1/apartments/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> deleteApartment(@PathVariable Long id) {
        apartmentService.deleteApartment(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa căn hộ thành công", null));
    }

    /**
     * Vô hiệu hóa căn hộ
     * PATCH /api/v1/apartments/{id}/deactivate
     */
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<ApiResponse<ApartmentResponse>> deactivateApartment(@PathVariable Long id) {
        ApartmentResponse apartment = apartmentService.deactivateApartment(id);
        return ResponseEntity.ok(ApiResponse.ok("Vô hiệu hóa căn hộ thành công", apartment));
    }
}
