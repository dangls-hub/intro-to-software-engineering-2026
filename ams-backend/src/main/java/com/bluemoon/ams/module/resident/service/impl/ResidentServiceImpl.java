package com.bluemoon.ams.module.resident.service.impl;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.entity.ApprovalStatus;
import com.bluemoon.ams.module.resident.entity.Household;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.entity.ResidentStatus;
import com.bluemoon.ams.module.resident.mapper.ResidentMapper;
import com.bluemoon.ams.module.resident.repository.HouseholdRepository;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import com.bluemoon.ams.module.resident.service.ResidentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResidentServiceImpl implements ResidentService {
// Chứa nghiệp vụ xử lý của dân cư: tạo, cập nhật, xoá, lấy thông tin, ...
    private final ResidentRepository residentRepository;
    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final UserRepository userRepository;
    private final ResidentMapper residentMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<ResidentResponse> getAllResidents(String search, String status, Pageable pageable){
        /*  API tìm kiếm 
        */
        ResidentStatus residentStatus = parseStatus(status);
        boolean hasSearch = search != null && !search.isBlank();

        Page<Resident> page;
        if (hasSearch && residentStatus != null) {
            page = residentRepository.findByStatusAndSearch(residentStatus, search.trim(), pageable);
        } else if (hasSearch) {
            page = residentRepository.searchResidents(search.trim(), pageable);
        } else if (residentStatus != null) {
            page = residentRepository.findByStatus(residentStatus, pageable);
        } else {
            page = residentRepository.findAll(pageable);
        }
        return page.map(residentMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ResidentResponse getResidentById(Long id) {
        return residentRepository.findById(id)  //tìm id trong repo cư dân
                .map(residentMapper::toResponse)  //nếu thấy thì map sang response
                .orElseThrow(() -> new ResourceNotFoundException("Resident", id)); //ko thấy thì ném lỗi
    }

    @Override
    @Transactional
    public ResidentResponse createResident(ResidentRequest request) { 
        /*
        Tạo mới một cư dân, validate dữ liệu đầu vào, kiểm tra trùng CCCD,
        liên kết với hộ gia đình và căn hộ nếu có.
        Nếu người tạo là ADMIN → tự động APPROVED.
        Nếu người tạo là STAFF → trạng thái PENDING, chờ ADMIN duyệt.
        */
        validateIdentityUnique(request.getIdentityNumber(), null);

        Household household = resolveHousehold(request.getHouseholdId());
        Apartment apartment = resolveApartment(request.getApartmentId());

        Resident resident = residentMapper.toEntity(request, household, apartment);

        // Xác định trạng thái duyệt dựa trên role của người tạo
        if (isCurrentUserAdmin()) {
            // ADMIN tạo → tự động duyệt
            resident.setApprovalStatus(ApprovalStatus.APPROVED);
            resident.setStatus(ResidentStatus.ACTIVE);
            String currentUsername = getCurrentUsername();
            if (currentUsername != null) {
                userRepository.findByUsername(currentUsername).ifPresent(user -> {
                    resident.setApprovedByUser(user);
                    resident.setApprovedAt(LocalDateTime.now());
                });
            }
        } else {
            // STAFF tạo → chờ duyệt
            resident.setApprovalStatus(ApprovalStatus.PENDING);
            resident.setStatus(ResidentStatus.INACTIVE); // Chưa duyệt thì chưa active
        }

        Resident saved = residentRepository.save(resident);
        log.info("Thêm ID cư dân mới={} tên={} approvalStatus={}", saved.getId(), saved.getFullName(), saved.getApprovalStatus());
        return residentMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public ResidentResponse updateResident(Long id, ResidentRequest request) {
        /* Cập nhật thông tin một cư dân, validate dữ liệu đầu vào, kiểm tra trùng CCCD (nếu có thay đổi), liên kết với hộ gia đình và căn hộ nếu có, lưu vào database và trả về thông tin đã cập nhật
         */
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", id));

        validateIdentityUnique(request.getIdentityNumber(), id);

        Household household = resolveHousehold(request.getHouseholdId());
        Apartment apartment = resolveApartment(request.getApartmentId());

        residentMapper.updateEntity(request, resident, household, apartment);
        resident = residentRepository.save(resident);

        log.info("Cập nhật ID cư dân={}", id);
        return residentMapper.toResponse(resident);
    }

    @Override
    @Transactional
    public void deleteResident(Long id) {
        /* Xóa một cư dân khỏi database
         */
        if (!residentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Resident", id);
        }
        residentRepository.deleteById(id);
        log.info("Xóa ID cư dân={}", id);
    }

    @Override
    @Transactional
    public ResidentResponse deactivateResident(Long id) {
        /* Hủy kích hoạt một cư dân bằng cách set status thành INACTIVE, không xóa bản ghi khỏi database để giữ lịch sử, trả về thông tin đã cập nhật
         */
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", id));
        resident.setStatus(ResidentStatus.INACTIVE);
        resident = residentRepository.save(resident);
        log.info("Vô hiệu hoá ID cư dân={}", id);
        return residentMapper.toResponse(resident);
    }

    // --- Approval workflow methods ---

    @Override
    @Transactional(readOnly = true)
    public Page<ResidentResponse> getPendingResidents(Pageable pageable) {
        return residentRepository.findByApprovalStatus(ApprovalStatus.PENDING, pageable)
                .map(residentMapper::toResponse);
    }

    @Override
    @Transactional
    public ResidentResponse approveResident(Long id, String approverUsername) {
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", id));

        if (resident.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Cư dân này đã được xử lý (trạng thái: " + resident.getApprovalStatus() + ")");
        }

        resident.setApprovalStatus(ApprovalStatus.APPROVED);
        resident.setStatus(ResidentStatus.ACTIVE);
        resident.setApprovedAt(LocalDateTime.now());
        resident.setRejectReason(null);

        userRepository.findByUsername(approverUsername).ifPresent(resident::setApprovedByUser);

        resident = residentRepository.save(resident);
        log.info("Phê duyệt cư dân ID={} bởi {}", id, approverUsername);
        return residentMapper.toResponse(resident);
    }

    @Override
    @Transactional
    public ResidentResponse rejectResident(Long id, String approverUsername, String reason) {
        Resident resident = residentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resident", id));

        if (resident.getApprovalStatus() != ApprovalStatus.PENDING) {
            throw new IllegalStateException("Cư dân này đã được xử lý (trạng thái: " + resident.getApprovalStatus() + ")");
        }

        resident.setApprovalStatus(ApprovalStatus.REJECTED);
        resident.setStatus(ResidentStatus.INACTIVE);
        resident.setApprovedAt(LocalDateTime.now());
        resident.setRejectReason(reason);

        userRepository.findByUsername(approverUsername).ifPresent(resident::setApprovedByUser);

        resident = residentRepository.save(resident);
        log.info("Từ chối cư dân ID={} bởi {} lý do: {}", id, approverUsername, reason);
        return residentMapper.toResponse(resident);
    }

    @Override
    @Transactional(readOnly = true)
    public long countPendingResidents() {
        return residentRepository.countByApprovalStatus(ApprovalStatus.PENDING);
    }

    // --- Private helpers ---

    private void validateIdentityUnique(String identityNumber, Long excludeId) {
        /* Kiểm tra tính duy nhất của số CCCD
         */
        if (identityNumber == null || identityNumber.isBlank()) return;
        residentRepository.findByIdentityNumber(identityNumber).ifPresent(existing -> {
            if (!existing.getId().equals(excludeId)) {
                throw new IllegalArgumentException(
                        "Identity number '" + identityNumber + "' is already registered");
            }
        });
    }

    private Household resolveHousehold(Long id) {
        /* Giải quyết quan hệ với hộ gia đình, nếu id không null thì tìm trong database, nếu không tìm thấy thì ném lỗi, nếu id null thì trả về null
         */
        if (id == null) return null;
        return householdRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household", id));
    }

    private Apartment resolveApartment(Long id) {
        /* Giải quyết quan hệ với căn hộ, nếu id không null thì tìm trong database, nếu không tìm thấy thì ném lỗi, nếu id null thì trả về null
         */
        if (id == null) return null;
        return apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment", id));
    }

    private ResidentStatus parseStatus(String status) { 
        /* Chuyển đổi chuỗi status từ request sang enum ResidentStatus, nếu không hợp lệ thì trả về null
         */
        if (status == null || status.isBlank()) return null;
        try {
            return ResidentStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    /**
     * Kiểm tra người dùng hiện tại có role ADMIN không
     */
    private boolean isCurrentUserAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(a -> a.equals("ROLE_ADMIN"));
    }

    /**
     * Lấy username của người dùng hiện tại từ SecurityContext
     */
    private String getCurrentUsername() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return null;
        return auth.getName();
    }
}