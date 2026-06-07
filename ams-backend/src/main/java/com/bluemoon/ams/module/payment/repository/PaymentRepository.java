package com.bluemoon.ams.module.payment.repository;

import com.bluemoon.ams.module.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    List<Payment> findByFeeIdOrderByPaymentDateDesc(Long feeId);

    @Query("SELECT p FROM Payment p WHERE p.fee.apartmentId = :apartmentId ORDER BY p.paymentDate DESC")
    List<Payment> findByApartmentId(@Param("apartmentId") Long apartmentId);

    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.fee.id = :feeId")
    Optional<BigDecimal> sumAmountByFeeId(@Param("feeId") Long feeId);

    /**
     * Tổng số tiền thanh toán trong khoảng thời gian (dùng cho Dashboard — doanh thu tháng).
     */
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.paymentDate BETWEEN :start AND :end")
    Optional<BigDecimal> sumAmountByPaymentDateBetween(
            @Param("start") java.time.LocalDateTime start,
            @Param("end") java.time.LocalDateTime end);
}
