package com.bluemoon.ams.common.service;

import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.auth.entity.Role;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import com.bluemoon.ams.module.resident.entity.Household;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.repository.HouseholdRepository;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Gửi email hàng loạt cho các kịch bản admin chủ động (bảo trì, khẩn cấp, an ninh,
 * đổi giá) và quét nhắc nợ định kỳ. Resolve danh sách người nhận rồi uỷ thác cho
 * {@link BlueMoonEmailService} (mỗi mail chạy @Async).
 */
@Service
public class EmailBroadcastService {

    private static final Logger log = LoggerFactory.getLogger(EmailBroadcastService.class);

    @Autowired private UserRepository userRepository;
    @Autowired private FeeRepository feeRepository;
    @Autowired private PaymentRepository paymentRepository;
    @Autowired private ResidentRepository residentRepository;
    @Autowired private HouseholdRepository householdRepository;
    @Autowired private ApartmentRepository apartmentRepository;
    @Autowired private BlueMoonEmailService emailService;

    /** Thông báo bảo trì tới toàn bộ cư dân. Trả về số email đã kích hoạt. */
    @Transactional(readOnly = true)
    public int broadcastMaintenance(String issue, String startTime, String endTime) {
        List<User> recipients = allResidentsWithEmail();
        for (User u : recipients) {
            emailService.sendMaintenanceNotice(u.getEmail(), u.getFullName(), issue, startTime, endTime);
        }
        log.info("Broadcast bảo trì tới {} cư dân", recipients.size());
        return recipients.size();
    }

    /** Cảnh báo khẩn cấp (mất điện/nước...) tới toàn bộ cư dân. */
    @Transactional(readOnly = true)
    public int broadcastEmergency(String message) {
        List<User> recipients = allResidentsWithEmail();
        for (User u : recipients) {
            emailService.sendEmergencyAlert(u.getEmail(), u.getFullName(), message);
        }
        log.info("Broadcast khẩn cấp tới {} cư dân", recipients.size());
        return recipients.size();
    }

    /** Cảnh báo an ninh tới toàn bộ cư dân. */
    @Transactional(readOnly = true)
    public int broadcastSecurity(String message) {
        List<User> recipients = allResidentsWithEmail();
        for (User u : recipients) {
            emailService.sendSecurityAlert(u.getEmail(), u.getFullName(), message);
        }
        log.info("Broadcast an ninh tới {} cư dân", recipients.size());
        return recipients.size();
    }

    /** Thông báo thay đổi giá dịch vụ tới toàn bộ cư dân. */
    @Transactional(readOnly = true)
    public int broadcastPriceChange(String serviceName, BigDecimal oldPrice,
                                    BigDecimal newPrice, String effectiveDate) {
        List<User> recipients = allResidentsWithEmail();
        for (User u : recipients) {
            emailService.sendServicePriceChange(u.getEmail(), u.getFullName(),
                    serviceName, oldPrice, newPrice, effectiveDate);
        }
        log.info("Broadcast đổi giá '{}' tới {} cư dân", serviceName, recipients.size());
        return recipients.size();
    }

    /**
     * Quét các khoản phí chưa thanh toán đã quá hạn và gửi email nhắc nợ
     * (theo số tiền còn lại). Trả về số email đã kích hoạt.
     */
    @Transactional(readOnly = true)
    public int runDebtReminders() {
        List<Fee> overdue = feeRepository.findByStatusInAndDueDateBefore(
                List.of("PENDING", "PARTIAL", "OVERDUE"), LocalDate.now());
        int count = 0;
        for (Fee fee : overdue) {
            if (fee.getApartmentId() == null || fee.getAmount() == null) continue;

            BigDecimal paid = paymentRepository.sumAmountByFeeId(fee.getId()).orElse(BigDecimal.ZERO);
            BigDecimal remaining = fee.getAmount().subtract(paid);
            if (remaining.signum() <= 0) continue; // đã trả đủ

            String roomNumber = apartmentRepository.findById(fee.getApartmentId())
                    .map(Apartment::getRoomNumber).orElse("");

            for (User u : apartmentResidentsWithEmail(fee.getApartmentId())) {
                emailService.sendDebtReminder(u.getEmail(), u.getFullName(), roomNumber, remaining);
                count++;
            }
        }
        log.info("Quét nhắc nợ: {} khoản quá hạn, {} email đã kích hoạt", overdue.size(), count);
        return count;
    }

    /* ── Helpers resolve người nhận ─────────────────── */

    /** Tất cả cư dân (role RESIDENT) có email hợp lệ. */
    private List<User> allResidentsWithEmail() {
        List<User> out = new ArrayList<>();
        for (User u : userRepository.findByRole(Role.RESIDENT)) {
            if (hasEmail(u)) out.add(u);
        }
        return out;
    }

    /** Cư dân của một căn hộ (trực tiếp + qua hộ gia đình), khử trùng lặp theo userId. */
    private List<User> apartmentResidentsWithEmail(Long apartmentId) {
        Map<Long, User> map = new LinkedHashMap<>();
        for (Resident r : residentRepository.findByApartmentId(apartmentId)) {
            if (r.getUser() != null && hasEmail(r.getUser())) map.put(r.getUser().getId(), r.getUser());
        }
        for (Household h : householdRepository.findByApartmentId(apartmentId)) {
            for (Resident r : residentRepository.findByHouseholdId(h.getId())) {
                if (r.getUser() != null && hasEmail(r.getUser())) map.put(r.getUser().getId(), r.getUser());
            }
        }
        return new ArrayList<>(map.values());
    }

    private boolean hasEmail(User u) {
        return u.getEmail() != null && !u.getEmail().isBlank();
    }
}
