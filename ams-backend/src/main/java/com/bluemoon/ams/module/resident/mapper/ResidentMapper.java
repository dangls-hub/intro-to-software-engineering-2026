package com.bluemoon.ams.module.resident.mapper;

import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.resident.dto.HouseholdRequest;
import com.bluemoon.ams.module.resident.dto.HouseholdResponse;
import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.entity.Household;
import com.bluemoon.ams.module.resident.entity.RelationshipType;
import com.bluemoon.ams.module.resident.entity.Resident;
import com.bluemoon.ams.module.resident.entity.ResidentStatus;
import org.springframework.stereotype.Component;

@Component
public class ResidentMapper {

    public ResidentResponse toResponse(Resident resident) {
        ResidentResponse r = new ResidentResponse();
        r.setId(resident.getId());
        if (resident.getUser() != null) {
            r.setUserId(resident.getUser().getId());
            r.setUsername(resident.getUser().getUsername());
        }
        r.setFullName(resident.getFullName());
        r.setIdentityNumber(resident.getIdentityNumber());
        r.setPhoneNumber(resident.getPhoneNumber());
        r.setDateOfBirth(resident.getDateOfBirth());
        r.setGender(resident.getGender());
        r.setStatus(resident.getStatus() != null ? resident.getStatus().name() : null);
        r.setRelationshipType(resident.getRelationshipType() != null ? resident.getRelationshipType().name() : null);
        if (resident.getHousehold() != null) {
            r.setHouseholdId(resident.getHousehold().getId());
            r.setHouseholdCode(resident.getHousehold().getHouseholdCode());
        }
        if (resident.getApartment() != null) {
            r.setApartmentId(resident.getApartment().getId());
            r.setRoomNumber(resident.getApartment().getRoomNumber());
        }
        r.setCreatedAt(resident.getCreatedAt());
        r.setUpdatedAt(resident.getUpdatedAt());

        // Approval workflow fields
        r.setApprovalStatus(resident.getApprovalStatus() != null ? resident.getApprovalStatus().name() : null);
        r.setApprovedAt(resident.getApprovedAt());
        r.setRejectReason(resident.getRejectReason());
        if (resident.getApprovedByUser() != null) {
            r.setApprovedByName(resident.getApprovedByUser().getFullName());
        }

        // CCCD image fields
        r.setCccdFrontImage(resident.getCccdFrontImage());
        r.setCccdBackImage(resident.getCccdBackImage());

        return r;
    }

    public Resident toEntity(ResidentRequest request, Household household, Apartment apartment) {
        Resident resident = new Resident();
        applyFields(request, resident, household, apartment);
        return resident;
    }

    public void updateEntity(ResidentRequest request, Resident resident, Household household, Apartment apartment) {
        applyFields(request, resident, household, apartment);
    }

    private void applyFields(ResidentRequest req, Resident resident, Household household, Apartment apartment) {
        resident.setFullName(req.getFullName());
        resident.setIdentityNumber(req.getIdentityNumber());
        resident.setPhoneNumber(req.getPhoneNumber());
        resident.setDateOfBirth(req.getDateOfBirth());
        resident.setGender(req.getGender());

        if (req.getRelationshipType() != null && !req.getRelationshipType().isBlank()) {
            try {
                resident.setRelationshipType(RelationshipType.valueOf(req.getRelationshipType().toUpperCase()));
            } catch (IllegalArgumentException e) {
                resident.setRelationshipType(RelationshipType.OTHER);
            }
        } else {
            resident.setRelationshipType(null);
        }

        if (req.getStatus() != null && !req.getStatus().isBlank()) {
            try {
                resident.setStatus(ResidentStatus.valueOf(req.getStatus().toUpperCase()));
            } catch (IllegalArgumentException e) {
                if (resident.getStatus() == null) resident.setStatus(ResidentStatus.ACTIVE);
            }
        } else {
            if (resident.getStatus() == null) resident.setStatus(ResidentStatus.ACTIVE);
        }

        resident.setHousehold(household);
        resident.setApartment(apartment);
    }

    public HouseholdResponse toHouseholdResponse(Household household) {
        HouseholdResponse r = new HouseholdResponse();
        r.setId(household.getId());
        r.setHouseholdCode(household.getHouseholdCode());
        if (household.getApartment() != null) {
            r.setApartmentId(household.getApartment().getId());
            r.setRoomNumber(household.getApartment().getRoomNumber());
        }
        r.setCreatedAt(household.getCreatedAt());
        r.setUpdatedAt(household.getUpdatedAt());
        return r;
    }

    public Household toHouseholdEntity(HouseholdRequest request, Apartment apartment) {
        return Household.builder()
                .householdCode(request.getHouseholdCode())
                .apartment(apartment)
                .build();
    }
}
