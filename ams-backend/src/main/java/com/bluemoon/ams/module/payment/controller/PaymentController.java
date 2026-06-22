package com.bluemoon.ams.module.payment.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.payment.dto.PaymentRequest;
import com.bluemoon.ams.module.payment.dto.PaymentResponse;
import com.bluemoon.ams.module.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getAllPayments()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentById(id)));
    }

    @GetMapping("/by-fee/{feeId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByFee(@PathVariable Long feeId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentsByFeeId(feeId)));
    }

    @GetMapping("/by-apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'RESIDENT')")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getByApartment(
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentsByApartmentId(apartmentId)));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<PaymentResponse>> recordPayment(
            @Valid @RequestBody PaymentRequest request,
            Authentication authentication) {
        PaymentResponse response = paymentService.recordPayment(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok("Payment recorded", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.ok("Payment deleted", null));
    }
}
