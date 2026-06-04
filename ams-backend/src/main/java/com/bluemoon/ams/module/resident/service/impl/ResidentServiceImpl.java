package com.bluemoon.ams.module.resident.service.impl;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResidentServiceImpl implements ResidentService {
// Chứa nghiệp vụ xử lý của dân cư: tạo, cập nhật, xoá, lấy thông tin, ...
    private final ResidentRepository residentRepository;
    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
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
        Tạo mới một cư dân, validate dữ liệu đầu vào, kiểm tra trùng CCCD, liên kết với hộ gia đình và căn hộ nếu có, lưu vào database và trả về thông tin đã tạo
        */
        validateIdentityUnique(request.getIdentityNumber(), null); //kiểm tra xem CCCD đã tồn tại chưa, nếu có thì ném lỗi

        Household household = resolveHousehold(request.getHouseholdId()); // tìm hộ gia đình nếu có, nếu id hộ gia đình không null nhưng ko tìm thấy thì ném lỗi
        Apartment apartment = resolveApartment(request.getApartmentId()); // tìm căn hộ nếu có, nếu id căn hộ không null nhưng ko tìm thấy thì ném lỗi

        Resident resident = residentMapper.toEntity(request, household, apartment); // map từ request sang entity, đồng thời set quan hệ với hộ gia đình và căn hộ nếu có
        resident = residentRepository.save(resident); // lưu vào database, sau khi lưu sẽ có id được sinh ra

        log.info("Thêm ID cư dân mới={} tên ={}", resident.getId(), resident.getFullName()); 
        return residentMapper.toResponse(resident);
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
}