package com.bluemoon.ams.module.fee.mapper;

import com.bluemoon.ams.module.fee.dto.FeeRequest;
import com.bluemoon.ams.module.fee.dto.FeeResponse;
import com.bluemoon.ams.module.fee.entity.Fee;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

/**
 * Mapper thủ công chuyển đổi giữa Fee entity và DTO.
 */
@Component
public class FeeMapper {

    /**
     * Chuyển FeeRequest → Fee entity (dùng khi tạo mới).
     */
    public Fee toEntity(FeeRequest request) {
        Fee fee = new Fee();
        updateEntity(fee, request);
        return fee;
    }

    /**
     * Cập nhật Fee entity từ FeeRequest (dùng khi update).
     */
    public void updateEntity(Fee fee, FeeRequest request) {
        fee.setName(request.getName());
        fee.setType(request.getType() != null ? request.getType() : "MANDATORY");
        fee.setAmount(request.getAmount());
        fee.setDueDate(parseDate(request.getDueDate()));
        fee.setApartmentId(request.getApartmentId());
        fee.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            fee.setStatus(request.getStatus());
        }
    }

    /**
     * Chuyển Fee entity → FeeResponse.
     */
    public FeeResponse toResponse(Fee fee) {
        FeeResponse response = new FeeResponse();
        response.setId(fee.getId());
        response.setName(fee.getName());
        response.setType(fee.getType());
        response.setAmount(fee.getAmount());
        response.setDueDate(fee.getDueDate() != null ? fee.getDueDate().toString() : null);
        response.setApartmentId(fee.getApartmentId());
        response.setDescription(fee.getDescription());
        response.setStatus(fee.getStatus());
        response.setCreatedAt(fee.getCreatedAt() != null ? fee.getCreatedAt().toString() : null);
        response.setUpdatedAt(fee.getUpdatedAt() != null ? fee.getUpdatedAt().toString() : null);
        return response;
    }

    // --- Helper ---

    private LocalDate parseDate(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            return LocalDate.parse(dateStr);
        } catch (DateTimeParseException e) {
            return null;
        }
    }
}
