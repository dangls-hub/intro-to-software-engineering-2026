package com.bluemoon.ams.module.payment.service;

import com.bluemoon.ams.module.payment.dto.PaymentRequestResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PaymentRequestService {

    PaymentRequestResponse submitRequest(Long feeId, java.math.BigDecimal amount,
                                         String paymentMethod, String note,
                                         MultipartFile proofImage,
                                         String submittedByUsername);

    List<PaymentRequestResponse> getAllRequests();

    List<PaymentRequestResponse> getRequestsByStatus(String status);

    List<PaymentRequestResponse> getRequestsByUser(String username);

    List<PaymentRequestResponse> getRequestsByApartment(Long apartmentId);

    long getPendingCount();

    PaymentRequestResponse approveRequest(Long id, String reviewNote, String reviewerUsername);

    PaymentRequestResponse rejectRequest(Long id, String reviewNote, String reviewerUsername);
}
