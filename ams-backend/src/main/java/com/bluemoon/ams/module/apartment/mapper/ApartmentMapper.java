package com.bluemoon.ams.module.apartment.mapper;

import com.bluemoon.ams.module.apartment.dto.ApartmentRequest;
import com.bluemoon.ams.module.apartment.dto.ApartmentResponse;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.entity.ApartmentStatus;
import org.springframework.stereotype.Component;

@Component
public class ApartmentMapper {

    /**
     * Chuyển đổi Apartment entity sang ApartmentResponse DTO
     */
    public ApartmentResponse toResponse(Apartment apartment) {
        if (apartment == null) {
            return null;
        }
        return ApartmentResponse.builder()
                .id(apartment.getId())
                .roomNumber(apartment.getRoomNumber())
                .floor(apartment.getFloor())
                .area(apartment.getArea())
                .status(apartment.getStatus().name())
                .description(apartment.getDescription())
                .createdAt(apartment.getCreatedAt())
                .updatedAt(apartment.getUpdatedAt())
                .build();
    }

    /**
     * Chuyển đổi ApartmentRequest DTO sang Apartment entity
     */
    public Apartment toEntity(ApartmentRequest request) {
        if (request == null) {
            return null;
        }
        ApartmentStatus status = ApartmentStatus.AVAILABLE;
        if (request.getStatus() != null) {
            try {
                status = ApartmentStatus.valueOf(request.getStatus().toUpperCase());
            } catch (IllegalArgumentException e) {
                status = ApartmentStatus.AVAILABLE;
            }
        }
        
        return Apartment.builder()
                .roomNumber(request.getRoomNumber())
                .floor(request.getFloor())
                .area(request.getArea())
                .status(status)
                .description(request.getDescription())
                .build();
    }

    /**
     * Cập nhật entity từ request DTO
     */
    public void updateEntity(ApartmentRequest request, Apartment apartment) {
        if (request == null || apartment == null) {
            return;
        }
        apartment.setRoomNumber(request.getRoomNumber());
        apartment.setFloor(request.getFloor());
        apartment.setArea(request.getArea());
        apartment.setDescription(request.getDescription());
        
        if (request.getStatus() != null) {
            try {
                apartment.setStatus(ApartmentStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                apartment.setStatus(ApartmentStatus.AVAILABLE);
            }
        }
    }
}
