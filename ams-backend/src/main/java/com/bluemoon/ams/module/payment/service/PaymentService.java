package com.bluemoon.ams.module.payment.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.payment.entity.Payment;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final ApartmentRepository apartmentRepository;
    private final FeeRepository feeRepository;

    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Transactional
    public Payment createPayment(Long apartmentId, Long feeId, Double amount) {
        Apartment apartment = apartmentRepository.findById(apartmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Apartment", "id", apartmentId));
        
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", "id", feeId));

        // Tự động tạo link mã QR động dựa trên số tài khoản giả định của Ban Quản Lý
        String description = "Thanh toan " + fee.getName() + " phong " + apartment.getApartmentNumber();
        String targetQr = String.format("https://api.vietqr.io/image/970416-123456789-QrcBP9.jpg?amt=%s&add=%s", 
                amount.intValue(), description.replace(" ", "%20"));

        Payment payment = Payment.builder()
                .apartment(apartment)
                .fee(fee)
                .amount(amount)
                .status("PENDING")
                .qrCodeUrl(targetQr)
                .build();

        return paymentRepository.save(payment);
    }

    @Transactional
    public Payment processPayment(Long id, String method, String transactionNo) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        
        payment.setStatus("PAID");
        payment.setPaymentMethod(method);
        payment.setTransactionNo(transactionNo);
        payment.setPaidAt(LocalDateTime.now());
        return paymentRepository.save(payment);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        paymentRepository.delete(payment);
    }
}