package com.bluemoon.ams.module.payment.repository;

import com.bluemoon.ams.module.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByApartmentId(Long apartmentId);
    List<Payment> findByStatus(String status);
}