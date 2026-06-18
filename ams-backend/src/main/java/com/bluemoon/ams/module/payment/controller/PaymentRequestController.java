package com.bluemoon.ams.module.payment.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.payment.dto.PaymentRequestResponse;
import com.bluemoon.ams.module.payment.dto.ReviewPaymentRequestDto;
import com.bluemoon.ams.module.payment.service.PaymentRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payment-requests")
public class PaymentRequestController {

    @Autowired
    private PaymentRequestService paymentRequestService;

    @Value("${app.upload.proof-dir:uploads/proofs}")
    private String proofUploadDir;

    /**
     * Cư dân gửi yêu cầu thanh toán kèm ảnh biên lai.
     */
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'RESIDENT')")
    public ResponseEntity<ApiResponse<PaymentRequestResponse>> submitRequest(
            @RequestParam("feeId") Long feeId,
            @RequestParam("amount") BigDecimal amount,
            @RequestParam("paymentMethod") String paymentMethod,
            @RequestParam(value = "note", required = false) String note,
            @RequestParam(value = "proofImage", required = false) MultipartFile proofImage,
            Authentication authentication) {

        PaymentRequestResponse response = paymentRequestService.submitRequest(
                feeId, amount, paymentMethod, note, proofImage, authentication.getName());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Yêu cầu thanh toán đã được gửi", response));
    }

    /**
     * Admin/Staff xem tất cả payment requests.
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<List<PaymentRequestResponse>>> getAllRequests(
            @RequestParam(value = "status", required = false) String status) {
        List<PaymentRequestResponse> list = (status != null && !status.isEmpty())
                ? paymentRequestService.getRequestsByStatus(status)
                : paymentRequestService.getAllRequests();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    /**
     * Cư dân xem payment requests của mình.
     */
    @GetMapping("/my-requests")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'RESIDENT')")
    public ResponseEntity<ApiResponse<List<PaymentRequestResponse>>> getMyRequests(
            Authentication authentication) {
        return ResponseEntity.ok(
                ApiResponse.ok(paymentRequestService.getRequestsByUser(authentication.getName())));
    }

    /**
     * Lấy requests theo căn hộ.
     */
    @GetMapping("/by-apartment/{apartmentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'RESIDENT')")
    public ResponseEntity<ApiResponse<List<PaymentRequestResponse>>> getByApartment(
            @PathVariable Long apartmentId) {
        return ResponseEntity.ok(
                ApiResponse.ok(paymentRequestService.getRequestsByApartment(apartmentId)));
    }

    /**
     * Đếm số lượng requests đang chờ duyệt.
     */
    @GetMapping("/pending/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Map<String, Long>>> getPendingCount() {
        long count = paymentRequestService.getPendingCount();
        return ResponseEntity.ok(ApiResponse.ok(Map.of("count", count)));
    }

    /**
     * Admin duyệt yêu cầu thanh toán.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentRequestResponse>> approve(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewPaymentRequestDto dto,
            Authentication authentication) {
        String note = dto != null ? dto.getReviewNote() : null;
        PaymentRequestResponse response = paymentRequestService.approveRequest(
                id, note, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Đã duyệt yêu cầu thanh toán", response));
    }

    /**
     * Admin từ chối yêu cầu thanh toán.
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentRequestResponse>> reject(
            @PathVariable Long id,
            @RequestBody(required = false) ReviewPaymentRequestDto dto,
            Authentication authentication) {
        String note = dto != null ? dto.getReviewNote() : null;
        PaymentRequestResponse response = paymentRequestService.rejectRequest(
                id, note, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Đã từ chối yêu cầu thanh toán", response));
    }

    /**
     * Serve ảnh biên lai (proof image).
     */
    @GetMapping("/proof/{filename:.+}")
    public ResponseEntity<Resource> serveProofImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get(proofUploadDir).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                String contentType = "image/jpeg";
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".webp")) contentType = "image/webp";
                else if (filename.endsWith(".gif")) contentType = "image/gif";

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                        .body(resource);
            }
            return ResponseEntity.notFound().build();
        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
