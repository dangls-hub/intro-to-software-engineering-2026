package com.bluemoon.ams.module.dashboard.service;

import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.dashboard.dto.DashboardStatsResponse;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service tính toán thống kê Dashboard.
 * Lấy dữ liệu từ các repository: apartment, resident, fee, payment.
 */
@Service
public class DashboardService {

    private final ApartmentRepository apartmentRepository;
    private final ResidentRepository residentRepository;
    private final FeeRepository feeRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(ApartmentRepository apartmentRepository,
                            ResidentRepository residentRepository,
                            FeeRepository feeRepository,
                            PaymentRepository paymentRepository) {
        this.apartmentRepository = apartmentRepository;
        this.residentRepository = residentRepository;
        this.feeRepository = feeRepository;
        this.paymentRepository = paymentRepository;
    }

    /**
     * Tính toán và trả về thống kê tổng quan cho Dashboard.
     */
    public DashboardStatsResponse getStats() {
        // 1. Tổng số căn hộ
        long totalApartments = apartmentRepository.count();

        // 2. Tổng số cư dân
        long totalResidents = residentRepository.count();

        // 3. Tổng số khoản thu
        long totalFees = feeRepository.count();

        // 4. Tổng số lần thanh toán
        long totalPayments = paymentRepository.count();

        // 5. Tổng doanh thu tháng hiện tại
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        BigDecimal monthlyRevenue = paymentRepository
                .sumAmountByPaymentDateBetween(startOfMonth, now)
                .orElse(BigDecimal.ZERO);

        // 6. Tỷ lệ thanh toán: % khoản thu đã PAID / tổng khoản thu
        double paymentRate = 0.0;
        if (totalFees > 0) {
            long paidFees = feeRepository.countByStatus("PAID");
            paymentRate = BigDecimal.valueOf(paidFees)
                    .multiply(BigDecimal.valueOf(100))
                    .divide(BigDecimal.valueOf(totalFees), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        return new DashboardStatsResponse(
                totalApartments,
                totalResidents,
                totalFees,
                totalPayments,
                monthlyRevenue,
                paymentRate
        );
    }
}
