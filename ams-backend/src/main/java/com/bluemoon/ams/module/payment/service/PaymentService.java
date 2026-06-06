package com.bluemoon.ams.module.payment.service;

import com.bluemoon.ams.module.payment.dto.PaymentRequest;
import com.bluemoon.ams.module.payment.dto.PaymentResponse;

import java.util.List;

public interface PaymentService {

    List<PaymentResponse> getAllPayments();

    PaymentResponse getPaymentById(Long id);

    List<PaymentResponse> getPaymentsByFeeId(Long feeId);

    List<PaymentResponse> getPaymentsByApartmentId(Long apartmentId);

    PaymentResponse recordPayment(PaymentRequest request, String recordedByUsername);

    void deletePayment(Long id);
}
