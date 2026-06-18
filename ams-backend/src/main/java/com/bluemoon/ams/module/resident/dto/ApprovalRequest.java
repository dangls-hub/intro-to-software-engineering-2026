package com.bluemoon.ams.module.resident.dto;

import jakarta.validation.constraints.NotBlank;

public class ApprovalRequest {
    @NotBlank(message = "Hành động không được để trống (APPROVE hoặc REJECT)")
    private String action;

    private String rejectReason;

    public ApprovalRequest() {}

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getRejectReason() { return rejectReason; }
    public void setRejectReason(String rejectReason) { this.rejectReason = rejectReason; }
}
