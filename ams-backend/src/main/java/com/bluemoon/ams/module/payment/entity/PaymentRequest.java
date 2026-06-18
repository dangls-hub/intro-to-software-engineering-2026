package com.bluemoon.ams.module.payment.entity;

import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.fee.entity.Fee;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_requests")
public class PaymentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_id", nullable = false)
    private Fee fee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submitted_by", nullable = false)
    private User submittedBy;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, length = 20)
    private PaymentMethod paymentMethod;

    @Column(length = 500)
    private String note;

    @Column(name = "proof_image_path", length = 1000)
    private String proofImagePath;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PaymentRequestStatus status = PaymentRequestStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "review_note", length = 500)
    private String reviewNote;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public PaymentRequest() {}

    public PaymentRequest(Long id, Fee fee, User submittedBy, BigDecimal amount,
                          PaymentMethod paymentMethod, String note, String proofImagePath,
                          PaymentRequestStatus status, User reviewedBy, String reviewNote,
                          LocalDateTime reviewedAt, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.fee = fee;
        this.submittedBy = submittedBy;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.note = note;
        this.proofImagePath = proofImagePath;
        this.status = status != null ? status : PaymentRequestStatus.PENDING;
        this.reviewedBy = reviewedBy;
        this.reviewNote = reviewNote;
        this.reviewedAt = reviewedAt;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    @PrePersist
    protected void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = PaymentRequestStatus.PENDING;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private Fee fee;
        private User submittedBy;
        private BigDecimal amount;
        private PaymentMethod paymentMethod;
        private String note;
        private String proofImagePath;
        private PaymentRequestStatus status = PaymentRequestStatus.PENDING;
        private User reviewedBy;
        private String reviewNote;
        private LocalDateTime reviewedAt;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder fee(Fee fee) { this.fee = fee; return this; }
        public Builder submittedBy(User submittedBy) { this.submittedBy = submittedBy; return this; }
        public Builder amount(BigDecimal amount) { this.amount = amount; return this; }
        public Builder paymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; return this; }
        public Builder note(String note) { this.note = note; return this; }
        public Builder proofImagePath(String proofImagePath) { this.proofImagePath = proofImagePath; return this; }
        public Builder status(PaymentRequestStatus status) { this.status = status; return this; }
        public Builder reviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; return this; }
        public Builder reviewNote(String reviewNote) { this.reviewNote = reviewNote; return this; }
        public Builder reviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public PaymentRequest build() {
            return new PaymentRequest(id, fee, submittedBy, amount, paymentMethod, note,
                    proofImagePath, status, reviewedBy, reviewNote, reviewedAt, createdAt, updatedAt);
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Fee getFee() { return fee; }
    public void setFee(Fee fee) { this.fee = fee; }
    public User getSubmittedBy() { return submittedBy; }
    public void setSubmittedBy(User submittedBy) { this.submittedBy = submittedBy; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
    public String getProofImagePath() { return proofImagePath; }
    public void setProofImagePath(String proofImagePath) { this.proofImagePath = proofImagePath; }
    public PaymentRequestStatus getStatus() { return status; }
    public void setStatus(PaymentRequestStatus status) { this.status = status; }
    public User getReviewedBy() { return reviewedBy; }
    public void setReviewedBy(User reviewedBy) { this.reviewedBy = reviewedBy; }
    public String getReviewNote() { return reviewNote; }
    public void setReviewNote(String reviewNote) { this.reviewNote = reviewNote; }
    public LocalDateTime getReviewedAt() { return reviewedAt; }
    public void setReviewedAt(LocalDateTime reviewedAt) { this.reviewedAt = reviewedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PaymentRequest)) return false;
        PaymentRequest that = (PaymentRequest) o;
        return java.util.Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() { return java.util.Objects.hash(id); }

    @Override
    public String toString() {
        return "PaymentRequest{id=" + id + ", amount=" + amount + ", status=" + status + "}";
    }
}
