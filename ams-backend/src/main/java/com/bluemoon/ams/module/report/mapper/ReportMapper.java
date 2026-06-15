package com.bluemoon.ams.module.report.mapper;

import com.bluemoon.ams.module.report.dto.ReportRequest;
import com.bluemoon.ams.module.report.dto.ReportResponse;
import com.bluemoon.ams.module.report.entity.ResidentReport;
import com.bluemoon.ams.module.report.entity.ReportType;
import org.springframework.stereotype.Component;

@Component
public class ReportMapper {

    public ResidentReport toEntity(ReportRequest request) {
        ResidentReport report = new ResidentReport();
        report.setTitle(request.getTitle());
        report.setContent(request.getContent());
        report.setType(request.getType() != null ? ReportType.valueOf(request.getType().toUpperCase()) : ReportType.OTHER);
        return report;
    }

    public ReportResponse toResponse(ResidentReport report) {
        if (report == null) return null;

        ReportResponse response = new ReportResponse();
        response.setId(report.getId());
        response.setTitle(report.getTitle());
        response.setContent(report.getContent());
        response.setType(report.getType() != null ? report.getType().name() : "OTHER");
        response.setStatus(report.getStatus() != null ? report.getStatus().name() : "PENDING");

        if (report.getSubmittedBy() != null) {
            response.setSubmittedById(report.getSubmittedBy().getId());
            response.setSubmittedByName(report.getSubmittedBy().getFullName() != null ? report.getSubmittedBy().getFullName() : report.getSubmittedBy().getUsername());
            response.setSubmittedByEmail(report.getSubmittedBy().getEmail());
        }

        if (report.getResolvedBy() != null) {
            response.setResolvedById(report.getResolvedBy().getId());
            response.setResolvedByName(report.getResolvedBy().getFullName() != null ? report.getResolvedBy().getFullName() : report.getResolvedBy().getUsername());
        }

        response.setResolveNote(report.getResolveNote());
        response.setResolvedAt(report.getResolvedAt() != null ? report.getResolvedAt().toString() : null);
        response.setCreatedAt(report.getCreatedAt() != null ? report.getCreatedAt().toString() : null);
        response.setUpdatedAt(report.getUpdatedAt() != null ? report.getUpdatedAt().toString() : null);

        return response;
    }
}
