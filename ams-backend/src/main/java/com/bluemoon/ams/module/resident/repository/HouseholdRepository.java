package com.bluemoon.ams.module.resident.repository;

import com.bluemoon.ams.module.resident.entity.Household;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HouseholdRepository extends JpaRepository<Household, Long> {
    Optional<Household> findByHouseholdCode(String householdCode);

    boolean existsByHouseholdCode(String householdCode);

    List<Household> findByApartmentId(Long apartmentId);

    Page<Household> findByHouseholdCodeContainingIgnoreCase(String search, Pageable pageable);
}
