package com.bluemoon.ams.module.fee.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.fee.dto.FeeRequest;
import com.bluemoon.ams.module.fee.dto.FeeResponse;
import com.bluemoon.ams.module.fee.service.FeeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller cho khoản thu.
 * Base path: /api/v1/fees
 */
@RestController
@RequestMapping("/api/v1/fees")
public class FeeController {

    private final FeeService feeService;

    public FeeController(FeeService feeService) {
        this.feeService = feeService;
    }

    /**
     * GET /api/v1/fees — Lấy danh sách tất cả khoản thu.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<FeeResponse>>> getAllFees() {
        List<FeeResponse> fees = feeService.getAllFees();
        return ResponseEntity.ok(ApiResponse.ok(fees));
    }

    /**
     * GET /api/v1/fees/{id} — Lấy chi tiết khoản thu theo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeResponse>> getFeeById(@PathVariable Long id) {
        FeeResponse fee = feeService.getFeeById(id);
        return ResponseEntity.ok(ApiResponse.ok(fee));
    }

    /**
     * POST /api/v1/fees — Tạo khoản thu mới.
     */
    @PostMapping
    public ResponseEntity<ApiResponse<FeeResponse>> createFee(@Valid @RequestBody FeeRequest request) {
        FeeResponse created = feeService.createFee(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Tạo khoản thu thành công", created));
    }

    /**
     * PUT /api/v1/fees/{id} — Cập nhật khoản thu.
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeResponse>> updateFee(
            @PathVariable Long id,
            @Valid @RequestBody FeeRequest request) {
        FeeResponse updated = feeService.updateFee(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật khoản thu thành công", updated));
    }

    /**
     * DELETE /api/v1/fees/{id} — Xóa khoản thu.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFee(@PathVariable Long id) {
        feeService.deleteFee(id);
        return ResponseEntity.noContent().build();
    }
}
