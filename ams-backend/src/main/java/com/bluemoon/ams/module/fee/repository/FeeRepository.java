package com.bluemoon.ams.module.fee.repository;

import com.bluemoon.ams.module.fee.entity.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

/**
 * JPA Repository cho entity Fee.
 */
@Repository
public interface FeeRepository extends JpaRepository<Fee, Long> {

    /**
     * Tìm tất cả khoản thu theo căn hộ.
     */
    List<Fee> findByApartmentId(Long apartmentId);

    /**
     * Tìm tất cả khoản thu theo trạng thái.
     */
    List<Fee> findByStatus(String status);

    /**
     * Đếm số khoản thu theo trạng thái (dùng cho Dashboard — tỷ lệ thanh toán).
     */
    long countByStatus(String status);

    /**
     * Khoản thu chưa tất toán đã quá hạn — dùng cho job nhắc nợ.
     */
    List<Fee> findByStatusInAndDueDateBefore(Collection<String> statuses, LocalDate date);
}
