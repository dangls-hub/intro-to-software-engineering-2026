package com.bluemoon.ams.module.vehicle.repository;

import com.bluemoon.ams.module.vehicle.entity.Vehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    boolean existsByLicensePlate(String licensePlate);

    boolean existsByLicensePlateAndIdNot(String licensePlate, Long id);

    Optional<Vehicle> findByLicensePlate(String licensePlate);

    List<Vehicle> findAllByApartmentIdAndActiveTrue(Long apartmentId);

    Page<Vehicle> findAllByApartmentId(Long apartmentId, Pageable pageable);

    long countByApartmentIdAndActiveTrue(Long apartmentId);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:search IS NULL OR LOWER(v.licensePlate) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.color) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Vehicle> searchVehicles(@Param("search") String search, Pageable pageable);
}
