package com.bluemoon.ams.module.report.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponse {

    private Long id;
    private String title;
    private String content;
    private String type;   // REFLECT, REPAIR, COMPLAINT, OTHER
    private String status; // PENDING, IN_PROGRESS, RESOLVED, REJECTED

    // Submitter info
    private Long submittedById;
    private String submittedByName;
    private String submittedByEmail;

    // Resolver info
    private Long resolvedById;
    private String resolvedByName;

    private String resolveNote;
    private String resolvedAt;
    private String createdAt;
    private String updatedAt;
}
