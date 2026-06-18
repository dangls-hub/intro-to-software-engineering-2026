package com.bluemoon.ams.module.vehicle.service.impl;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.repository.ApartmentRepository;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.repository.ResidentRepository;
import com.bluemoon.ams.module.vehicle.dto.VehicleRequest;
import com.bluemoon.ams.module.vehicle.dto.VehicleResponse;
import com.bluemoon.ams.module.vehicle.entity.Vehicle;
import com.bluemoon.ams.module.vehicle.entity.VehicleType;
import com.bluemoon.ams.module.vehicle.mapper.VehicleMapper;
import com.bluemoon.ams.module.vehicle.repository.VehicleRepository;
import com.bluemoon.ams.module.vehicle.service.VehicleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {

    private static final Logger log = LoggerFactory.getLogger(VehicleServiceImpl.class);

    // Pricing constants (VND/month)
    private static final BigDecimal STANDARD_FEE = BigDecimal.valueOf(100_000);
    private static final BigDecimal SURCHARGE_FEE = BigDecimal.valueOf(120_000);
    // Vehicles 1–2 of an apartment pay STANDARD_FEE; from vehicle 3 onwards: SURCHARGE_FEE
    private static final long STANDARD_THRESHOLD = 2;

    @Autowired
    private VehicleRepository vehicleRepository;
    @Autowired
    private ResidentRepository residentRepository;
    @Autowired
    private ApartmentRepository apartmentRepository;
    @Autowired
    private VehicleMapper vehicleMapper;

    @Override
    @Transactional(readOnly = true)
    public Page<VehicleResponse> getAllVehicles(String search, Pageable pageable) {
        Page<Vehicle> page = (search != null && !search.isBlank())
                ? vehicleRepository.searchVehicles(search.trim(), pageable)
                : vehicleRepository.findAll(pageable);
        return page.map(vehicleMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getVehiclesByApartment(Long apartmentId) {
        if (!apartmentRepository.existsById(apartmentId)) {
            throw new ResourceNotFoundException("Apartment", apartmentId);
        }
        return vehicleRepository.findAllByApartmentIdAndActiveTrue(apartmentId)
                .stream()
                .map(vehicleMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        return vehicleMapper.toResponse(vehicle);
    }

    @Override
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {
        String plate = request.getLicensePlate().trim().toUpperCase();

        if (vehicleRepository.existsByLicensePlate(plate)) {
            throw new IllegalStateException("Biển số xe '" + plate + "' đã được đăng ký trong hệ thống");
        }

        Resident resident = residentRepository.findById(request.getResidentId())
                .orElseThrow(() -> new ResourceNotFoundException("Resident", request.getResidentId()));

        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment", request.getApartmentId()));

        BigDecimal fee = calculateMonthlyFee(apartment);

        Vehicle vehicle = Vehicle.builder()
                .licensePlate(plate)
                .brand(request.getBrand())
                .vehicleType(parseVehicleType(request.getVehicleType()))
                .color(request.getColor())
                .monthlyFee(fee)
                .active(true)
                .resident(resident)
                .apartment(apartment)
                .build();

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle registered plate={} apartment={} fee={}", plate, apartment.getRoomNumber(), fee);
        return vehicleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));

        String plate = request.getLicensePlate().trim().toUpperCase();

        if (vehicleRepository.existsByLicensePlateAndIdNot(plate, id)) {
            throw new IllegalStateException("Biển số xe '" + plate + "' đã được đăng ký trong hệ thống");
        }

        Resident resident = residentRepository.findById(request.getResidentId())
                .orElseThrow(() -> new ResourceNotFoundException("Resident", request.getResidentId()));

        Apartment apartment = apartmentRepository.findById(request.getApartmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Apartment", request.getApartmentId()));

        vehicle.setLicensePlate(plate);
        vehicle.setBrand(request.getBrand());
        vehicle.setVehicleType(parseVehicleType(request.getVehicleType()));
        vehicle.setColor(request.getColor());
        vehicle.setResident(resident);
        vehicle.setApartment(apartment);

        Vehicle saved = vehicleRepository.save(vehicle);
        log.info("Vehicle updated id={} plate={}", id, plate);
        return vehicleMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteVehicle(Long id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle", id));
        vehicle.setActive(false);
        vehicleRepository.save(vehicle);
        log.info("Vehicle deactivated id={} plate={}", id, vehicle.getLicensePlate());
    }

    /**
     * Tính phí đỗ xe hàng tháng cho xe MỚI sắp đăng ký vào căn hộ này.
     * - Xe thứ 1 và 2: 100,000 VND/tháng
     * - Xe thứ 3 trở đi: 120,000 VND/tháng
     * Phí được tính trọn tháng bất kể ngày đăng ký trong tháng (Rule 1 & 2).
     */
    private BigDecimal calculateMonthlyFee(Apartment apartment) {
        long activeCount = vehicleRepository.countByApartmentIdAndActiveTrue(apartment.getId());
        // activeCount = số xe hiện tại; xe mới sẽ là vị trí (activeCount + 1)
        return (activeCount < STANDARD_THRESHOLD) ? STANDARD_FEE : SURCHARGE_FEE;
    }

    private VehicleType parseVehicleType(String type) {
        try {
            return VehicleType.valueOf(type.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Loại xe không hợp lệ: " + type +
                    ". Hợp lệ: CAR, MOTORBIKE, BICYCLE, ELECTRIC_BIKE, TRUCK, OTHER");
        }
    }
}
