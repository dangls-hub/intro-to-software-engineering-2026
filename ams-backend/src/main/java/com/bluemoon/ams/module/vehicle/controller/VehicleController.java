package com.bluemoon.ams.module.vehicle.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.vehicle.dto.VehicleRequest;
import com.bluemoon.ams.module.vehicle.dto.VehicleResponse;
import com.bluemoon.ams.module.vehicle.service.VehicleService;
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
@RequestMapping("/api/v1/vehicles")
@PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<VehicleResponse>>> getAllVehicles(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        Page<VehicleResponse> result = vehicleService.getAllVehicles(search, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Danh sách xe", result));
    }

    @GetMapping("/apartment/{apartmentId}")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByApartment(
            @PathVariable Long apartmentId
    ) {
        List<VehicleResponse> result = vehicleService.getVehiclesByApartment(apartmentId);
        return ResponseEntity.ok(ApiResponse.ok("Danh sách xe theo căn hộ", result));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse result = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.ok("Chi tiết xe", result));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
            @Valid @RequestBody VehicleRequest request
    ) {
        VehicleResponse created = vehicleService.createVehicle(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Đăng ký xe thành công", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request
    ) {
        VehicleResponse updated = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông tin xe thành công", updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.ok("Xoá xe thành công", null));
    }
}
