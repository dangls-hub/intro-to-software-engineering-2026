package com.bluemoon.ams.module.vehicle.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class VehicleRequest {
    @NotBlank(message = "Vui lòng nhập biển số xe")
    @Size(max = 20, message = "Biển số xe không được vượt quá 20 ký tự")
    private String licensePlate;

    @Size(max = 100, message = "Hãng xe không được vượt quá 100 ký tự")
    private String brand;

    @NotBlank(message = "Vui lòng chọn loại xe")
    private String vehicleType;

    @Size(max = 50, message = "Màu sắc không được vượt quá 50 ký tự")
    private String color;

    @NotNull(message = "Vui lòng chọn cư dân")
    private Long residentId;

    @NotNull(message = "Vui lòng chọn căn hộ")
    private Long apartmentId;

    public VehicleRequest() {}

    public String getLicensePlate() { return licensePlate; }
    public void setLicensePlate(String licensePlate) { this.licensePlate = licensePlate; }
    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }
    public String getVehicleType() { return vehicleType; }
    public void setVehicleType(String vehicleType) { this.vehicleType = vehicleType; }
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }
    public Long getResidentId() { return residentId; }
    public void setResidentId(Long residentId) { this.residentId = residentId; }
    public Long getApartmentId() { return apartmentId; }
    public void setApartmentId(Long apartmentId) { this.apartmentId = apartmentId; }
}
