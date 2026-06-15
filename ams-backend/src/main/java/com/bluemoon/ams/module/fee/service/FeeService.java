package com.bluemoon.ams.module.fee.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.fee.dto.FeeRequest;
import com.bluemoon.ams.module.fee.dto.FeeResponse;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.fee.mapper.FeeMapper;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.notification.service.NotificationService;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import com.bluemoon.ams.module.payment.repository.PaymentRequestRepository;
import com.bluemoon.ams.module.resident.entity.Household;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.repository.HouseholdRepository;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Service xử lý nghiệp vụ khoản thu: CRUD + gán cho căn hộ.
 */
@Service
@Transactional
public class FeeService {

    private final FeeRepository feeRepository;
    private final FeeMapper feeMapper;
    private final PaymentRepository paymentRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final NotificationService notificationService;
    private final ResidentRepository residentRepository;
    private final HouseholdRepository householdRepository;

    public FeeService(FeeRepository feeRepository, FeeMapper feeMapper,
                      PaymentRepository paymentRepository, PaymentRequestRepository paymentRequestRepository,
                      NotificationService notificationService, ResidentRepository residentRepository, HouseholdRepository householdRepository) {
        this.feeRepository = feeRepository;
        this.feeMapper = feeMapper;
        this.paymentRepository = paymentRepository;
        this.paymentRequestRepository = paymentRequestRepository;
        this.notificationService = notificationService;
        this.residentRepository = residentRepository;
        this.householdRepository = householdRepository;
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

        // Gửi thông báo cho cư dân liên quan
        if (saved.getApartmentId() != null) {
            Set<Long> userIds = new HashSet<>();
            
            // 1. Lấy cư dân trực tiếp
            List<Resident> residents = residentRepository.findByApartmentId(saved.getApartmentId());
            for (Resident r : residents) {
                if (r.getUser() != null) userIds.add(r.getUser().getId());
            }
            
            // 2. Lấy cư dân qua hộ gia đình
            List<Household> households = householdRepository.findByApartmentId(saved.getApartmentId());
            for (Household h : households) {
                List<Resident> hResidents = residentRepository.findByHouseholdId(h.getId());
                for (Resident r : hResidents) {
                    if (r.getUser() != null) userIds.add(r.getUser().getId());
                }
            }

            // Gửi thông báo
            for (Long uid : userIds) {
                notificationService.createAndSendNotification(
                        uid, 
                        null, 
                        "NEW_FEE", 
                        "Khoản thu mới: " + saved.getName() + " đã được tạo cho căn hộ của bạn.", 
                        "/my-fees"
                );
            }
        }

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
        if (paymentRepository.existsByFeeId(id)) {
            throw new IllegalArgumentException("Không thể xóa khoản thu này vì đã có cư dân nộp tiền.");
        }
        paymentRequestRepository.deleteByFeeId(id);
        feeRepository.deleteById(id);
    }
}
