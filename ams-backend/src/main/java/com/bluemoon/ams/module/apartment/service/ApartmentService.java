package com.bluemoon.ams.module.apartment.service;

import com.bluemoon.ams.module.apartment.dto.ApartmentRequest;
import com.bluemoon.ams.module.apartment.dto.ApartmentResponse;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.entity.ApartmentStatus;
import com.bluemoon.ams.module.apartment.mapper.ApartmentMapper;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApartmentService {

    private static final Logger log = LoggerFactory.getLogger(ApartmentService.class);

    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private ApartmentMapper apartmentMapper;

    /**
     * Lấy tất cả căn hộ (có hỗ trợ phân trang, tìm kiếm, lọc)
     */
    public Page<ApartmentResponse> getAllApartments(
            Integer floor,
            String status,
            String search,
            Pageable pageable) {
        Page<Apartment> page;

        if (search != null && !search.isEmpty()) {
            // Tìm kiếm theo số phòng
            page = apartmentRepository.findByRoomNumberContainingIgnoreCase(search, pageable);
        } else if (floor != null && status != null) {
            // Lọc theo tầng và trạng thái
            try {
                ApartmentStatus apartmentStatus = ApartmentStatus.valueOf(status.toUpperCase());
                page = apartmentRepository.findByFloorAndStatus(floor, apartmentStatus, pageable);
            } catch (IllegalArgumentException e) {
                page = Page.empty(pageable);
            }
        } else if (floor != null) {
            // Lọc theo tầng
            page = apartmentRepository.findByFloor(floor, pageable);
        } else if (status != null) {
            // Lọc theo trạng thái
            try {
                ApartmentStatus apartmentStatus = ApartmentStatus.valueOf(status.toUpperCase());
                page = apartmentRepository.findByStatus(apartmentStatus, pageable);
            } catch (IllegalArgumentException e) {
                page = Page.empty(pageable);
            }
        } else {
            // Lấy tất cả
            page = apartmentRepository.findAll(pageable);
        }

        return page.map(apartmentMapper::toResponse);
    }

    /**
     * Lấy chi tiết căn hộ theo ID
     */
    public ApartmentResponse getApartmentById(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ với ID: " + id));
        return apartmentMapper.toResponse(apartment);
    }

    /**
     * Tạo mới căn hộ
     */
    @Transactional
    public ApartmentResponse createApartment(ApartmentRequest request) {
        // Kiểm tra số phòng không được trùng
        if (apartmentRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new IllegalArgumentException("Số phòng '" + request.getRoomNumber() + "' đã tồn tại");
        }

        Apartment apartment = apartmentMapper.toEntity(request);
        Apartment savedApartment = apartmentRepository.save(apartment);
        log.info("Tạo căn hộ mới: {}", savedApartment.getRoomNumber());
        return apartmentMapper.toResponse(savedApartment);
    }

    /**
     * Cập nhật căn hộ
     */
    @Transactional
    public ApartmentResponse updateApartment(Long id, ApartmentRequest request) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ với ID: " + id));

        // Kiểm tra số phòng không được trùng (nếu thay đổi số phòng)
        if (!apartment.getRoomNumber().equals(request.getRoomNumber()) 
                && apartmentRepository.existsByRoomNumber(request.getRoomNumber())) {
            throw new IllegalArgumentException("Số phòng '" + request.getRoomNumber() + "' đã tồn tại");
        }

        apartment.setRoomNumber(request.getRoomNumber());
        apartmentMapper.updateEntity(request, apartment);
        Apartment updatedApartment = apartmentRepository.save(apartment);
        log.info("Cập nhật căn hộ: {}", updatedApartment.getRoomNumber());
        return apartmentMapper.toResponse(updatedApartment);
    }

    /**
     * Xóa căn hộ
     */
    @Transactional
    public void deleteApartment(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ với ID: " + id));
        apartmentRepository.delete(apartment);
        log.info("Xóa căn hộ: {}", apartment.getRoomNumber());
    }

    /**
     * Vô hiệu hóa căn hộ (set status = INACTIVE)
     */
    @Transactional
    public ApartmentResponse deactivateApartment(Long id) {
        Apartment apartment = apartmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy căn hộ với ID: " + id));
        apartment.setStatus(ApartmentStatus.INACTIVE);
        Apartment updatedApartment = apartmentRepository.save(apartment);
        log.info("Vô hiệu hóa căn hộ: {}", updatedApartment.getRoomNumber());
        return apartmentMapper.toResponse(updatedApartment);
    }
}
