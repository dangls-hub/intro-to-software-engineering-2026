package com.bluemoon.ams.module.payment.mapper;

import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.payment.dto.PaymentRequest;
import com.bluemoon.ams.module.payment.dto.PaymentResponse;
import com.bluemoon.ams.module.payment.entity.Payment;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class PaymentMapper {

    public Payment toEntity(PaymentRequest request, Fee fee, User recordedBy) {
        return Payment.builder()
                .fee(fee)
                .recordedBy(recordedBy)
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .note(request.getNote())
                .paymentDate(LocalDateTime.now())
                .build();
    }

    public PaymentResponse toResponse(Payment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setFeeId(payment.getFee().getId());
        response.setFeeName(payment.getFee().getName());
        response.setApartmentId(payment.getFee().getApartmentId());
        response.setAmount(payment.getAmount());
        response.setPaymentMethod(payment.getPaymentMethod().name());
        response.setNote(payment.getNote());
        response.setPaymentDate(payment.getPaymentDate());
        response.setRecordedBy(payment.getRecordedBy().getUsername());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}
