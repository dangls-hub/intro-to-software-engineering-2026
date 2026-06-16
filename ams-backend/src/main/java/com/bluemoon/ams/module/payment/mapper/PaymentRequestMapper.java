package com.bluemoon.ams.module.payment.mapper;

import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.payment.dto.PaymentRequestResponse;
import com.bluemoon.ams.module.payment.entity.PaymentRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PaymentRequestMapper {

    @Autowired
    private ApartmentRepository apartmentRepository;

    public PaymentRequestResponse toResponse(PaymentRequest entity) {
        PaymentRequestResponse r = new PaymentRequestResponse();
        r.setId(entity.getId());
        r.setFeeId(entity.getFee().getId());
        r.setFeeName(entity.getFee().getName());
        r.setApartmentId(entity.getFee().getApartmentId());
        r.setFeeAmount(entity.getFee().getAmount());
        r.setAmount(entity.getAmount());
        r.setPaymentMethod(entity.getPaymentMethod().name());
        r.setNote(entity.getNote());
        r.setStatus(entity.getStatus().name());
        r.setCreatedAt(entity.getCreatedAt());

        // Proof image — serve via /api/v1/payment-requests/proof/{filename}
        if (entity.getProofImagePath() != null) {
            String filename = entity.getProofImagePath();
            // Strip directory prefix, keep only filename
            int lastSlash = Math.max(filename.lastIndexOf('/'), filename.lastIndexOf('\\'));
            if (lastSlash >= 0) filename = filename.substring(lastSlash + 1);
            r.setProofImageUrl("/payment-requests/proof/" + filename);
        }

        // Submitter info
        if (entity.getSubmittedBy() != null) {
            r.setSubmittedByUsername(entity.getSubmittedBy().getUsername());
            r.setSubmittedByFullName(entity.getSubmittedBy().getFullName());
        }

        // Reviewer info
        if (entity.getReviewedBy() != null) {
            r.setReviewedByUsername(entity.getReviewedBy().getUsername());
            r.setReviewNote(entity.getReviewNote());
            r.setReviewedAt(entity.getReviewedAt());
        }

        // Apartment code
        if (entity.getFee().getApartmentId() != null) {
            apartmentRepository.findById(entity.getFee().getApartmentId())
                    .map(Apartment::getRoomNumber)
                    .ifPresent(r::setApartmentCode);
        }

        return r;
    }
}
