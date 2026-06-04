package com.bluemoon.ams.module.resident.service;

import com.bluemoon.ams.module.resident.dto.HouseholdRequest;
import com.bluemoon.ams.module.resident.dto.HouseholdResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface HouseholdService {
    Page<HouseholdResponse> getAllHouseholds(String search, Pageable pageable);
    HouseholdResponse getHouseholdById(Long id);
    List<HouseholdResponse> getHouseholdsByApartment(Long apartmentId);
    HouseholdResponse createHousehold(HouseholdRequest request);
    HouseholdResponse updateHousehold(Long id, HouseholdRequest request);
    void deleteHousehold(Long id);
}