package com.bluemoon.ams.module.resident.service.impl;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.resident.dto.HouseholdRequest;
import com.bluemoon.ams.module.resident.dto.HouseholdResponse;
import com.bluemoon.ams.module.resident.entity.Household;
import com.bluemoon.ams.module.resident.mapper.ResidentMapper;
import com.bluemoon.ams.module.resident.repository.HouseholdRepository;
import com.bluemoon.ams.module.resident.service.HouseholdService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class HouseholdServiceImpl implements HouseholdService {
    /* Chứa nghiệp vụ xử lý của hộ gia đình: tạo, cập nhật, xoá, lấy thông tin, ...
     */

    private final HouseholdRepository householdRepository;
    private final ApartmentRepository apartmentRepository;
    private final ResidentMapper residentMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<HouseholdResponse> getAllHouseholds(String search, Pageable pageable) {
        /* API tìm kiếm hộ gia đình theo mã hộ gia đình, nếu search kO null và kO rỗng thì tìm theo mã hộ gia đình có chứa chuỗi search (không phân biệt hoa thường), nếu search null hoặc rỗng thì trả về tất cả hộ gia đình, kết quả trả về dạng trang (Page) để hỗ trợ phân trang ở frontend
         */
        Page<Household> page = (search != null && !search.isBlank())
                ? householdRepository.findByHouseholdCodeContainingIgnoreCase(search.trim(), pageable)
                : householdRepository.findAll(pageable);
        return page.map(residentMapper::toHouseholdResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public HouseholdResponse getHouseholdById(Long id) {
        return householdRepository.findById(id)
                .map(residentMapper::toHouseholdResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Household", id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HouseholdResponse> getHouseholdsByApartment(Long apartmentId) {
        return householdRepository.findByApartmentId(apartmentId).stream()
                .map(residentMapper::toHouseholdResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HouseholdResponse createHousehold(HouseholdRequest request) {
        if (householdRepository.existsByHouseholdCode(request.getHouseholdCode())) {
            throw new IllegalArgumentException(
                    "Household code '" + request.getHouseholdCode() + "' already exists");
        }
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment", request.getApartmentId()));

        Household saved = householdRepository.save(residentMapper.toHouseholdEntity(request, apartment));
        log.info("Created household id={} code={}", saved.getId(), saved.getHouseholdCode());
        return residentMapper.toHouseholdResponse(saved);
    }

    @Override
    @Transactional
    public HouseholdResponse updateHousehold(Long id, HouseholdRequest request) {
        Household household = householdRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Household", id));

        if (!household.getHouseholdCode().equals(request.getHouseholdCode())
                && householdRepository.existsByHouseholdCode(request.getHouseholdCode())) {
            throw new IllegalArgumentException(
                    "Household code '" + request.getHouseholdCode() + "' already exists");
        }
        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment", request.getApartmentId()));

        household.setHouseholdCode(request.getHouseholdCode());
        household.setApartment(apartment);
        Household saved = householdRepository.save(household);
        log.info("Updated household id={}", id);
        return residentMapper.toHouseholdResponse(saved);
    }

    @Override
    @Transactional
    public void deleteHousehold(Long id) {
        if (!householdRepository.existsById(id)) {
            throw new ResourceNotFoundException("Household", id);
        }
        householdRepository.deleteById(id);
        log.info("Deleted household id={}", id);
    }
}