package com.bluemoon.ams.module.report.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.report.dto.ReportRequest;
import com.bluemoon.ams.module.report.dto.ReportResponse;
import com.bluemoon.ams.module.report.dto.ReviewReportRequest;
import com.bluemoon.ams.module.report.entity.ReportStatus;
import com.bluemoon.ams.module.report.entity.ResidentReport;
import com.bluemoon.ams.module.report.mapper.ReportMapper;
import com.bluemoon.ams.module.report.repository.ResidentReportRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ResidentReportService {

    private final ResidentReportRepository reportRepository;
    private final UserRepository userRepository;
    private final ReportMapper reportMapper;

    public ResidentReportService(ResidentReportRepository reportRepository,
                                 UserRepository userRepository,
                                 ReportMapper reportMapper) {
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.reportMapper = reportMapper;
    }

    /**
     * Cư dân gửi phản ánh mới.
     */
    public ReportResponse submitReport(ReportRequest request, String username) {
        User submitter = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + username + "' không tồn tại"));

        ResidentReport report = reportMapper.toEntity(request);
        report.setSubmittedBy(submitter);
        report.setStatus(ReportStatus.PENDING);

        ResidentReport saved = reportRepository.save(report);
        return reportMapper.toResponse(saved);
    }

    /**
     * Cư dân lấy danh sách phản ánh của chính mình.
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getMyReports(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + username + "' không tồn tại"));

        return reportRepository.findBySubmittedByIdOrderByCreatedAtDesc(user.getId()).stream()
                .map(reportMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Ban quản lý lấy danh sách tất cả phản ánh.
     */
    @Transactional(readOnly = true)
    public List<ReportResponse> getAllReports(String statusStr) {
        if (statusStr != null && !statusStr.isBlank()) {
            ReportStatus status = ReportStatus.valueOf(statusStr.toUpperCase());
            return reportRepository.findByStatusOrderByCreatedAtDesc(status).stream()
                    .map(reportMapper::toResponse)
                    .collect(Collectors.toList());
        }

        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(reportMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Ban quản lý xử lý/phản hồi ý kiến cư dân.
     */
    public ReportResponse reviewReport(Long id, ReviewReportRequest request, String reviewerUsername) {
        ResidentReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Báo cáo phản ánh", id));

        User reviewer = userRepository.findByUsername(reviewerUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + reviewerUsername + "' không tồn tại"));

        report.setStatus(ReportStatus.valueOf(request.getStatus().toUpperCase()));
        report.setResolvedBy(reviewer);
        report.setResolveNote(request.getResolveNote());
        report.setResolvedAt(LocalDateTime.now());

        ResidentReport saved = reportRepository.save(report);
        return reportMapper.toResponse(saved);
    }
}
