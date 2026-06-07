package com.bluemoon.ams.module.resident.repository;

import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.entity.ResidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ResidentRepository extends JpaRepository<Resident, Long> {

    Optional<Resident> findByIdentityNumber(String identityNumber);

    boolean existsByIdentityNumber(String identityNumber);

    Page<Resident> findByStatus(ResidentStatus status, Pageable pageable);

    List<Resident> findByHouseholdId(Long householdId);

    List<Resident> findByApartmentId(Long apartmentId);

    List<Resident> findByFullName(String fullName);

    // Tìm theo từ khoá theo tên, CCCD và sdt
    @Query("SELECT r FROM Resident r WHERE " +
           "LOWER(r.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR r.identityNumber LIKE CONCAT('%', :search, '%') " +
           "OR r.phoneNumber LIKE CONCAT('%', :search, '%')")
    Page<Resident> searchResidents(@Param("search") String search, Pageable pageable);

    // Tìm theo trạng thái và từ khoá
    @Query("SELECT r FROM Resident r WHERE r.status = :status AND (" +
           "LOWER(r.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR r.identityNumber LIKE CONCAT('%', :search, '%'))")
    Page<Resident> findByStatusAndSearch(
            @Param("status") ResidentStatus status,
            @Param("search") String search,
            Pageable pageable);
}