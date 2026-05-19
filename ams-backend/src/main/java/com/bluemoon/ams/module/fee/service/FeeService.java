package com.bluemoon.ams.module.fee.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.fee.dto.FeeRequest;
import com.bluemoon.ams.module.fee.dto.FeeResponse;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.fee.mapper.FeeMapper;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ khoản thu: CRUD + gán cho căn hộ.
 */
@Service
@Transactional
public class FeeService {

    private final FeeRepository feeRepository;
    private final FeeMapper feeMapper;

    public FeeService(FeeRepository feeRepository, FeeMapper feeMapper) {
        this.feeRepository = feeRepository;
        this.feeMapper = feeMapper;
    }

    /**
     * Lấy tất cả khoản thu.
     */
    @Transactional(readOnly = true)
    public List<FeeResponse> getAllFees() {
        return feeRepository.findAll().stream()
                .map(feeMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Lấy khoản thu theo ID.
     */
    @Transactional(readOnly = true)
    public FeeResponse getFeeById(Long id) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khoản thu", id));
        return feeMapper.toResponse(fee);
    }

    /**
     * Lấy khoản thu theo căn hộ.
     */
    @Transactional(readOnly = true)
    public List<FeeResponse> getFeesByApartmentId(Long apartmentId) {
        return feeRepository.findByApartmentId(apartmentId).stream()
                .map(feeMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Tạo mới khoản thu.
     */
    public FeeResponse createFee(FeeRequest request) {
        Fee fee = feeMapper.toEntity(request);
        Fee saved = feeRepository.save(fee);
        return feeMapper.toResponse(saved);
    }

    /**
     * Cập nhật khoản thu.
     */
    public FeeResponse updateFee(Long id, FeeRequest request) {
        Fee fee = feeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Khoản thu", id));
        feeMapper.updateEntity(fee, request);
        Fee updated = feeRepository.save(fee);
        return feeMapper.toResponse(updated);
    }

    /**
     * Xóa khoản thu.
     */
    public void deleteFee(Long id) {
        if (!feeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Khoản thu", id);
        }
        feeRepository.deleteById(id);
    }
}
