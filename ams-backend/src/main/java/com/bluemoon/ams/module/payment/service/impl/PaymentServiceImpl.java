package com.bluemoon.ams.module.payment.service.impl;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.payment.dto.PaymentRequest;
import com.bluemoon.ams.module.payment.dto.PaymentResponse;
import com.bluemoon.ams.module.payment.entity.Payment;
import com.bluemoon.ams.module.payment.mapper.PaymentMapper;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import com.bluemoon.ams.module.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;
import com.bluemoon.ams.module.notification.service.NotificationService;
import com.bluemoon.ams.module.resident.entity.Household;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.repository.HouseholdRepository;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final UserRepository userRepository;
    private final PaymentMapper paymentMapper;
    private final NotificationService notificationService;
    private final ResidentRepository residentRepository;
    private final HouseholdRepository householdRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));
        return paymentMapper.toResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByFeeId(Long feeId) {
        if (!feeRepository.existsById(feeId)) {
            throw new ResourceNotFoundException("Fee", feeId);
        }
        return paymentRepository.findByFeeIdOrderByPaymentDateDesc(feeId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByApartmentId(Long apartmentId) {
        return paymentRepository.findByApartmentId(apartmentId).stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    /* Quy tắc nghiệp vụ:
    1. Khoản phí phải tồn tại và ch được thanh toán đầy đủ 
    2/ Số tiền thanh toán > 0, < số tiền còn nợ
    3. Sau khi lưu khoản thanh toán, cập nhật trạng thái khoản phí:
        - Nếu tổng đã thanh toán >= số tiền phí => PAID
        - Nếu tổng đã thanh toán > 0 nhưng < số tiền phí => PARTIAL
     */
    @Override
    @Transactional
    public PaymentResponse recordPayment(PaymentRequest request, String recordedByUsername) {
        Fee fee = feeRepository.findById(request.getFeeId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee", request.getFeeId()));

        if ("PAID".equals(fee.getStatus())) {
            throw new IllegalArgumentException("Fee " + fee.getId() + " is already fully paid");
        }

        BigDecimal totalPaid = paymentRepository.sumAmountByFeeId(fee.getId())
                .orElse(BigDecimal.ZERO);
        BigDecimal remaining = fee.getAmount().subtract(totalPaid);

        if (request.getAmount().compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "Payment amount " + request.getAmount() + " exceeds remaining debt " + remaining);
        }

        User staff = userRepository.findByUsername(recordedByUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + recordedByUsername + "' không tồn tại"));

        Payment payment = paymentMapper.toEntity(request, fee, staff);
        payment = paymentRepository.save(payment);

        BigDecimal newTotal = totalPaid.add(request.getAmount());
        fee.setStatus(newTotal.compareTo(fee.getAmount()) >= 0 ? "PAID" : "PARTIAL");
        feeRepository.save(fee);

        // Send notification to residents
        if (fee.getApartmentId() != null) {
            Set<Long> userIds = new HashSet<>();
            List<Resident> residents = residentRepository.findByApartmentId(fee.getApartmentId());
            for (Resident r : residents) {
                if (r.getUser() != null) userIds.add(r.getUser().getId());
            }
            List<Household> households = householdRepository.findByApartmentId(fee.getApartmentId());
            for (Household h : households) {
                List<Resident> hResidents = residentRepository.findByHouseholdId(h.getId());
                for (Resident r : hResidents) {
                    if (r.getUser() != null) userIds.add(r.getUser().getId());
                }
            }
            for (Long uid : userIds) {
                notificationService.createAndSendNotification(
                        uid,
                        staff.getId(),
                        "NEW_PAYMENT",
                        "Giao dịch thành công: Khoản phí " + fee.getName() + " đã được thanh toán " + request.getAmount() + " VNĐ.",
                        "/my-fees"
                );
            }
        }

        return paymentMapper.toResponse(payment);
    }

    /*  1.Xóa một khoản thanh toán (Payment) và tính toán lại trạng thái của khoản phí (Fee) tương ứng để đảm bảo tính nhất quán dữ liệu.
        2.Chỉ người dùng có quyền ADMIN mới được phép thực hiện chức năng này (được kiểm soát ở Controller).
     */
    @Override
    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", id));

        Fee fee = payment.getFee();
        BigDecimal currentTotal = paymentRepository.sumAmountByFeeId(fee.getId())
                .orElse(BigDecimal.ZERO);
        BigDecimal newTotal = currentTotal.subtract(payment.getAmount()).max(BigDecimal.ZERO);

        paymentRepository.deleteById(id);

        String newStatus;
        if (newTotal.compareTo(BigDecimal.ZERO) == 0) {
            newStatus = "PENDING";
        } else if (newTotal.compareTo(fee.getAmount()) >= 0) {
            newStatus = "PAID";
        } else {
            newStatus = "PARTIAL";
        }
        fee.setStatus(newStatus);
        feeRepository.save(fee);
    }
}
