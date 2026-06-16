package com.bluemoon.ams.module.payment.service.impl;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.fee.entity.Fee;
import com.bluemoon.ams.module.fee.repository.FeeRepository;
import com.bluemoon.ams.module.payment.dto.PaymentRequestResponse;
import com.bluemoon.ams.module.payment.entity.PaymentMethod;
import com.bluemoon.ams.module.payment.entity.PaymentRequest;
import com.bluemoon.ams.module.payment.entity.PaymentRequestStatus;
import com.bluemoon.ams.module.payment.mapper.PaymentRequestMapper;
import com.bluemoon.ams.module.payment.repository.PaymentRequestRepository;
import com.bluemoon.ams.module.payment.repository.PaymentRepository;
import com.bluemoon.ams.module.payment.service.PaymentRequestService;
import com.bluemoon.ams.module.payment.service.PaymentService;
import com.bluemoon.ams.module.notification.service.NotificationService;
import com.bluemoon.ams.module.auth.entity.Role;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentRequestServiceImpl implements PaymentRequestService {

    private final PaymentRequestRepository paymentRequestRepository;
    private final PaymentRepository paymentRepository;
    private final FeeRepository feeRepository;
    private final UserRepository userRepository;
    private final PaymentRequestMapper paymentRequestMapper;
    private final PaymentService paymentService;
    private final NotificationService notificationService;

    @Value("${app.upload.proof-dir:uploads/proofs}")
    private String proofUploadDir;

    @Override
    @Transactional
    public PaymentRequestResponse submitRequest(Long feeId, BigDecimal amount,
                                                 String paymentMethod, String note,
                                                 MultipartFile proofImage,
                                                 String submittedByUsername) {
        Fee fee = feeRepository.findById(feeId)
                .orElseThrow(() -> new ResourceNotFoundException("Fee", feeId));

        if ("PAID".equals(fee.getStatus())) {
            throw new IllegalArgumentException("Khoản thu này đã được thanh toán đầy đủ.");
        }

        User submitter = userRepository.findByUsername(submittedByUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + submittedByUsername + "' không tồn tại"));

        // Validate amount
        BigDecimal totalPaid = paymentRepository.sumAmountByFeeId(fee.getId())
                .orElse(BigDecimal.ZERO);
        BigDecimal remaining = fee.getAmount().subtract(totalPaid);
        if (amount.compareTo(remaining) > 0) {
            throw new IllegalArgumentException(
                    "Số tiền " + amount + " vượt quá số tiền còn lại " + remaining);
        }

        // Save proof image
        String imagePath = null;
        if (proofImage != null && !proofImage.isEmpty()) {
            imagePath = saveProofImage(proofImage);
        }

        PaymentRequest request = PaymentRequest.builder()
                .fee(fee)
                .submittedBy(submitter)
                .amount(amount)
                .paymentMethod(PaymentMethod.valueOf(paymentMethod))
                .note(note)
                .proofImagePath(imagePath)
                .status(PaymentRequestStatus.PENDING)
                .build();

        request = paymentRequestRepository.save(request);

        // Send notification to all ADMIN users
        List<User> admins = userRepository.findByRole(Role.ADMIN);
        for (User admin : admins) {
            notificationService.createAndSendNotification(
                    admin.getId(),
                    submitter.getId(),
                    "NEW_PAYMENT_REQUEST",
                    "Có một yêu cầu duyệt thanh toán phí " + fee.getName() + " mới từ cư dân.",
                    "/payment-approvals"
            );
        }

        return paymentRequestMapper.toResponse(request);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentRequestResponse> getAllRequests() {
        return paymentRequestRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(paymentRequestMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentRequestResponse> getRequestsByStatus(String status) {
        PaymentRequestStatus s = PaymentRequestStatus.valueOf(status.toUpperCase());
        return paymentRequestRepository.findByStatusOrderByCreatedAtDesc(s).stream()
                .map(paymentRequestMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentRequestResponse> getRequestsByUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + username + "' không tồn tại"));
        return paymentRequestRepository.findBySubmittedByIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(paymentRequestMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentRequestResponse> getRequestsByApartment(Long apartmentId) {
        return paymentRequestRepository.findByApartmentId(apartmentId).stream()
                .map(paymentRequestMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long getPendingCount() {
        return paymentRequestRepository.countByStatus(PaymentRequestStatus.PENDING);
    }

    @Override
    @Transactional
    public PaymentRequestResponse approveRequest(Long id, String reviewNote, String reviewerUsername) {
        PaymentRequest request = paymentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentRequest", id));

        if (request.getStatus() != PaymentRequestStatus.PENDING) {
            throw new IllegalArgumentException("Yêu cầu này đã được xử lý.");
        }

        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + reviewerUsername + "' không tồn tại"));

        request.setStatus(PaymentRequestStatus.APPROVED);
        request.setReviewedBy(reviewer);
        request.setReviewNote(reviewNote);
        request.setReviewedAt(LocalDateTime.now());
        paymentRequestRepository.save(request);

        // Auto-record the actual payment after approval
        com.bluemoon.ams.module.payment.dto.PaymentRequest paymentDto =
                new com.bluemoon.ams.module.payment.dto.PaymentRequest();
        paymentDto.setFeeId(request.getFee().getId());
        paymentDto.setAmount(request.getAmount());
        paymentDto.setPaymentMethod(request.getPaymentMethod());
        paymentDto.setNote("Tự động ghi nhận từ yêu cầu #" + request.getId()
                + (request.getNote() != null ? " — " + request.getNote() : ""));

        paymentService.recordPayment(paymentDto, reviewerUsername);

        // Send notification to submitter
        if (request.getSubmittedBy() != null) {
            notificationService.createAndSendNotification(
                    request.getSubmittedBy().getId(),
                    reviewer.getId(),
                    "PAYMENT_REQUEST_APPROVED",
                    "Yêu cầu thanh toán của bạn cho khoản phí " + request.getFee().getName() + " đã được phê duyệt.",
                    "/my-fees"
            );
        }

        return paymentRequestMapper.toResponse(request);
    }

    @Override
    @Transactional
    public PaymentRequestResponse rejectRequest(Long id, String reviewNote, String reviewerUsername) {
        PaymentRequest request = paymentRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("PaymentRequest", id));

        if (request.getStatus() != PaymentRequestStatus.PENDING) {
            throw new IllegalArgumentException("Yêu cầu này đã được xử lý.");
        }

        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + reviewerUsername + "' không tồn tại"));

        request.setStatus(PaymentRequestStatus.REJECTED);
        request.setReviewedBy(reviewer);
        request.setReviewNote(reviewNote);
        request.setReviewedAt(LocalDateTime.now());
        paymentRequestRepository.save(request);

        // Send notification to submitter
        if (request.getSubmittedBy() != null) {
            notificationService.createAndSendNotification(
                    request.getSubmittedBy().getId(),
                    reviewer.getId(),
                    "PAYMENT_REQUEST_REJECTED",
                    "Yêu cầu thanh toán của bạn cho khoản phí " + request.getFee().getName() + " đã bị từ chối.",
                    "/my-fees"
            );
        }

        return paymentRequestMapper.toResponse(request);
    }

    // --- Private helpers ---

    private String saveProofImage(MultipartFile file) {
        try {
            Path uploadPath = Paths.get(proofUploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf('.'));
            }
            String filename = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return filePath.toString();
        } catch (IOException e) {
            throw new RuntimeException("Không thể lưu ảnh biên lai: " + e.getMessage(), e);
        }
    }
}
