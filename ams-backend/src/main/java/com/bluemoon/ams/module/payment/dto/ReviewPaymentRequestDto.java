package com.bluemoon.ams.module.payment.dto;

/**
 * Request DTO khi admin duyệt/từ chối payment request.
 */
public class ReviewPaymentRequestDto {

    private String reviewNote;

    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
}
