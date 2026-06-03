package com.bluemoon.ams.module.payment.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.payment.entity.Payment;
import com.bluemoon.ams.module.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Payment>>> getAllPayments() {
        List<Payment> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Hiển thị danh sách hóa đơn thành công", payments));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Payment>> createPayment(
            @RequestParam Long apartmentId,
            @RequestParam Long feeId,
            @RequestParam Double amount) {
        Payment payment = paymentService.createPayment(apartmentId, feeId, amount);
        return ResponseEntity.ok(ApiResponse.success("Khởi tạo hóa đơn thanh toán thành công", payment));
    }

    @PutMapping("/{id}/pay")
    public ResponseEntity<ApiResponse<Payment>> payInvoice(
            @PathVariable Long id,
            @RequestParam String method,
            @RequestParam String transactionNo) {
        Payment updatedPayment = paymentService.processPayment(id, method, transactionNo);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận thanh toán thành công", updatedPayment));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa hóa đơn thành công", null));
    }
}