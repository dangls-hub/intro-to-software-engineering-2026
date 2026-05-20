package com.bluemoon.ams.module.apartment.repository;

import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.entity.ApartmentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface ApartmentRepository extends JpaRepository<Apartment, Long> {
    /**
     * Tìm căn hộ theo số phòng
     */
    Optional<Apartment> findByRoomNumber(String roomNumber);

    /**
     * Kiểm tra số phòng có tồn tại không
     */
    boolean existsByRoomNumber(String roomNumber);

    /**
     * Tìm căn hộ theo tầng
     */
    List<Apartment> findByFloor(Integer floor);

    /**
     * Tìm căn hộ theo trạng thái
     */
    List<Apartment> findByStatus(ApartmentStatus status);

    /**
     * Tìm kiếm căn hộ theo số phòng (chứa text tìm kiếm)
     */
    Page<Apartment> findByRoomNumberContainingIgnoreCase(String search, Pageable pageable);

    /**
     * Tìm căn hộ theo tầng với phân trang
     */
    Page<Apartment> findByFloor(Integer floor, Pageable pageable);

    /**
     * Tìm căn hộ theo trạng thái với phân trang
     */
    Page<Apartment> findByStatus(ApartmentStatus status, Pageable pageable);

    /**
     * Tìm căn hộ theo tầng và trạng thái với phân trang
     */
    Page<Apartment> findByFloorAndStatus(Integer floor, ApartmentStatus status, Pageable pageable);
}
