package com.bluemoon.ams.module.apartment.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Builder;

@Builder
public class ApartmentRequest {
    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Positive(message = "Tầng phải lớn hơn 0")
    private Integer floor;

    @NotNull(message = "Diện tích không được để trống")
    @Positive(message = "Diện tích phải lớn hơn 0")
    private Double area;

    private String description;

    private String status;

    public ApartmentRequest() {}
    public ApartmentRequest(String roomNumber, Integer floor, Double area, String description, String status) {
        this.roomNumber = roomNumber;
        this.floor = floor;
        this.area = area;
        this.description = description;
        this.status = status;
    }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }
    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }
    public Double getArea() { return area; }
    public void setArea(Double area) { this.area = area; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
