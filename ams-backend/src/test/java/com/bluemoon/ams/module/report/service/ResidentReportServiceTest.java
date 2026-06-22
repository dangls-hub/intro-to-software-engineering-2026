package com.bluemoon.ams.module.report.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.notification.service.NotificationService;
import com.bluemoon.ams.common.service.BlueMoonEmailService;
import com.bluemoon.ams.module.report.dto.ReportRequest;
import com.bluemoon.ams.module.report.dto.ReportResponse;
import com.bluemoon.ams.module.report.dto.ReviewReportRequest;
import com.bluemoon.ams.module.report.entity.ReportStatus;
import com.bluemoon.ams.module.report.entity.ReportType;
import com.bluemoon.ams.module.report.entity.ResidentReport;
import com.bluemoon.ams.module.report.mapper.ReportMapper;
import com.bluemoon.ams.module.report.repository.ResidentReportRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ResidentReportServiceTest {

    @Mock
    private ResidentReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ReportMapper reportMapper;

    @Mock
    private NotificationService notificationService;

    @Mock
    private BlueMoonEmailService blueMoonEmailService;

    @InjectMocks
    private ResidentReportService reportService;

    private User testUser;
    private User testAdmin;
    private ResidentReport testReport;
    private ReportRequest testRequest;
    private ReportResponse testResponse;

    @BeforeEach
    public void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("resident1")
                .email("resident1@example.com")
                .fullName("Cư dân 1")
                .build();

        testAdmin = User.builder()
                .id(2L)
                .username("admin")
                .email("admin@bluemoon.vn")
                .fullName("Quản trị viên")
                .build();

        testReport = ResidentReport.builder()
                .id(100L)
                .title("Hỏng đèn")
                .content("Bóng đèn hành lang hỏng")
                .type(ReportType.REPAIR)
                .status(ReportStatus.PENDING)
                .submittedBy(testUser)
                .createdAt(LocalDateTime.now())
                .build();

        testRequest = ReportRequest.builder()
                .title("Hỏng đèn")
                .content("Bóng đèn hành lang hỏng")
                .type("REPAIR")
                .build();

        testResponse = ReportResponse.builder()
                .id(100L)
                .title("Hỏng đèn")
                .content("Bóng đèn hành lang hỏng")
                .type("REPAIR")
                .status("PENDING")
                .submittedById(1L)
                .submittedByName("Cư dân 1")
                .build();
    }

    @Test
    public void submitReport_Success() {
        when(userRepository.findByUsername("resident1")).thenReturn(Optional.of(testUser));
        when(reportMapper.toEntity(testRequest)).thenReturn(testReport);
        when(reportRepository.save(any(ResidentReport.class))).thenReturn(testReport);
        when(reportMapper.toResponse(testReport)).thenReturn(testResponse);

        ReportResponse result = reportService.submitReport(testRequest, "resident1");

        assertNotNull(result);
        assertEquals(100L, result.getId());
        assertEquals("PENDING", result.getStatus());

        verify(userRepository, times(1)).findByUsername("resident1");
        verify(reportRepository, times(1)).save(any(ResidentReport.class));
    }

    @Test
    public void submitReport_UserNotFound_ThrowsException() {
        when(userRepository.findByUsername("resident1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> reportService.submitReport(testRequest, "resident1"));

        verify(reportRepository, never()).save(any());
    }

    @Test
    public void getMyReports_Success() {
        when(userRepository.findByUsername("resident1")).thenReturn(Optional.of(testUser));
        when(reportRepository.findBySubmittedByIdOrderByCreatedAtDesc(1L))
                .thenReturn(Collections.singletonList(testReport));
        when(reportMapper.toResponse(testReport)).thenReturn(testResponse);

        List<ReportResponse> results = reportService.getMyReports("resident1");

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(100L, results.get(0).getId());

        verify(userRepository, times(1)).findByUsername("resident1");
        verify(reportRepository, times(1)).findBySubmittedByIdOrderByCreatedAtDesc(1L);
    }

    @Test
    public void getAllReports_NoFilter_Success() {
        when(reportRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(Collections.singletonList(testReport));
        when(reportMapper.toResponse(testReport)).thenReturn(testResponse);

        List<ReportResponse> results = reportService.getAllReports(null);

        assertNotNull(results);
        assertEquals(1, results.size());

        verify(reportRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }

    @Test
    public void getAllReports_WithFilter_Success() {
        when(reportRepository.findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING))
                .thenReturn(Collections.singletonList(testReport));
        when(reportMapper.toResponse(testReport)).thenReturn(testResponse);

        List<ReportResponse> results = reportService.getAllReports("PENDING");

        assertNotNull(results);
        assertEquals(1, results.size());

        verify(reportRepository, times(1)).findByStatusOrderByCreatedAtDesc(ReportStatus.PENDING);
    }

    @Test
    public void reviewReport_Success() {
        ReviewReportRequest reviewRequest = ReviewReportRequest.builder()
                .status("RESOLVED")
                .resolveNote("Đã sửa xong bóng đèn")
                .build();

        ReportResponse resolvedResponse = ReportResponse.builder()
                .id(100L)
                .title("Hỏng đèn")
                .status("RESOLVED")
                .resolveNote("Đã sửa xong bóng đèn")
                .resolvedByName("Quản trị viên")
                .build();

        when(reportRepository.findById(100L)).thenReturn(Optional.of(testReport));
        when(userRepository.findByUsername("admin")).thenReturn(Optional.of(testAdmin));
        when(reportRepository.save(any(ResidentReport.class))).thenReturn(testReport);
        when(reportMapper.toResponse(testReport)).thenReturn(resolvedResponse);

        ReportResponse result = reportService.reviewReport(100L, reviewRequest, "admin");

        assertNotNull(result);
        assertEquals("RESOLVED", result.getStatus());
        assertEquals("Đã sửa xong bóng đèn", result.getResolveNote());

        verify(reportRepository, times(1)).findById(100L);
        verify(userRepository, times(1)).findByUsername("admin");
        verify(reportRepository, times(1)).save(testReport);
    }
}
