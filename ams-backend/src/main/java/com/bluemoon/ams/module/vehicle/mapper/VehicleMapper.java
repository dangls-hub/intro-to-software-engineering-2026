package com.bluemoon.ams.module.vehicle.mapper;

import com.bluemoon.ams.module.vehicle.dto.VehicleResponse;
import com.bluemoon.ams.module.vehicle.entity.Vehicle;
import org.springframework.stereotype.Component;

@Component
public class VehicleMapper {

    public VehicleResponse toResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();
        response.setId(vehicle.getId());
        response.setLicensePlate(vehicle.getLicensePlate());
        response.setBrand(vehicle.getBrand());
        response.setVehicleType(vehicle.getVehicleType().name());
        response.setColor(vehicle.getColor());
        response.setMonthlyFee(vehicle.getMonthlyFee());
        response.setActive(vehicle.getActive());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());

        if (vehicle.getResident() != null) {
            response.setResidentId(vehicle.getResident().getId());
            response.setResidentName(vehicle.getResident().getFullName());
        }

        if (vehicle.getApartment() != null) {
            response.setApartmentId(vehicle.getApartment().getId());
            response.setRoomNumber(vehicle.getApartment().getRoomNumber());
        }

        return response;
    }
}
