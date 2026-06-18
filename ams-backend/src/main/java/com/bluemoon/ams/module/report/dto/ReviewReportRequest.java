package com.bluemoon.ams.module.report.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Builder;

@Builder
public class ReviewReportRequest {

    @NotBlank(message = "Trạng thái phê duyệt không được để trống")
    private String status; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    private String resolveNote;

    public ReviewReportRequest() {}

    public ReviewReportRequest(String status, String resolveNote) {
        this.status = status;
        this.resolveNote = resolveNote;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getResolveNote() { return resolveNote; }
    public void setResolveNote(String resolveNote) { this.resolveNote = resolveNote; }
}
