package com.bluemoon.ams.module.resident.service;

import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ResidentService {
    Page<ResidentResponse> getAllResidents(String search, String status, Pageable pageable);
    ResidentResponse getResidentById(Long id);
    ResidentResponse createResident(ResidentRequest request);
    ResidentResponse updateResident(Long id, ResidentRequest request);
    void deleteResident(Long id);
    ResidentResponse deactivateResident(Long id);
}