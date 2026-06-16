package com.bluemoon.ams.module.vehicle.service;

import com.bluemoon.ams.module.vehicle.dto.VehicleRequest;
import com.bluemoon.ams.module.vehicle.dto.VehicleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VehicleService {

    Page<VehicleResponse> getAllVehicles(String search, Pageable pageable);

    List<VehicleResponse> getVehiclesByApartment(Long apartmentId);

    VehicleResponse getVehicleById(Long id);

    VehicleResponse createVehicle(VehicleRequest request);

    VehicleResponse updateVehicle(Long id, VehicleRequest request);

    void deleteVehicle(Long id);
}
