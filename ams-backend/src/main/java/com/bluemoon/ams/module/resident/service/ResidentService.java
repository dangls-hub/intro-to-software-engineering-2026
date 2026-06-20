package com.bluemoon.ams.module.resident.service;

import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.dto.ApartmentJoinRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface ResidentService {
    Page<ResidentResponse> getAllResidents(String search, String status, Pageable pageable);
    ResidentResponse getResidentById(Long id);
    ResidentResponse createResident(ResidentRequest request);
    ResidentResponse updateResident(Long id, ResidentRequest request);
    void deleteResident(Long id);
    ResidentResponse deactivateResident(Long id);
    ResidentResponse getCurrentResidentRequest(String username);
    ResidentResponse requestApartmentJoin(String username, ApartmentJoinRequest request,
                                          MultipartFile cccdFront, MultipartFile cccdBack);

    // Approval workflow
    Page<ResidentResponse> getPendingResidents(Pageable pageable);
    ResidentResponse approveResident(Long id, String approverUsername);
    ResidentResponse rejectResident(Long id, String approverUsername, String reason);
    long countPendingResidents();
}
