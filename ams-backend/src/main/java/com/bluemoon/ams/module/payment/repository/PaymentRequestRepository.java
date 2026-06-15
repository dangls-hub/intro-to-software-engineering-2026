package com.bluemoon.ams.module.payment.repository;

import com.bluemoon.ams.module.payment.entity.PaymentRequest;
import com.bluemoon.ams.module.payment.entity.PaymentRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, Long> {

    List<PaymentRequest> findAllByOrderByCreatedAtDesc();

    List<PaymentRequest> findByStatusOrderByCreatedAtDesc(PaymentRequestStatus status);

    @Query("SELECT pr FROM PaymentRequest pr WHERE pr.fee.apartmentId = :apartmentId ORDER BY pr.createdAt DESC")
    List<PaymentRequest> findByApartmentId(@Param("apartmentId") Long apartmentId);

    List<PaymentRequest> findBySubmittedByIdOrderByCreatedAtDesc(Long userId);

    long countByStatus(PaymentRequestStatus status);
}
