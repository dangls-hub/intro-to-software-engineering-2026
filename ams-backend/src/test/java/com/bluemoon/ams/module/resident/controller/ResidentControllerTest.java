package com.bluemoon.ams.module.resident.controller;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.common.security.JwtUtil;
import com.bluemoon.ams.module.resident.dto.ResidentRequest;
import com.bluemoon.ams.module.resident.dto.ResidentResponse;
import com.bluemoon.ams.module.resident.service.ResidentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DisplayName("ResidentController")
class ResidentControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;
    @Autowired JwtUtil jwtUtil;

    @MockBean ResidentService residentService;

    private String adminToken;
    private String residentToken;
    private ResidentResponse sampleResponse;
    private ResidentRequest validRequest;

    @BeforeEach
    void setUp() {
        adminToken    = jwtUtil.generateToken("testAdmin",    "ADMIN");
        residentToken = jwtUtil.generateToken("testResident", "RESIDENT");

        sampleResponse = new ResidentResponse();
        sampleResponse.setId(1L);
        sampleResponse.setFullName("Nguyen Duc Khai");
        sampleResponse.setIdentityNumber("012345678910");
        sampleResponse.setPhoneNumber("0912345678");
        sampleResponse.setStatus("ACTIVE");
        sampleResponse.setCreatedAt(LocalDateTime.now());
        sampleResponse.setUpdatedAt(LocalDateTime.now());

        validRequest = new ResidentRequest();
        validRequest.setFullName("Nguyen Duc Khai");
        validRequest.setIdentityNumber("012345678910");
        validRequest.setPhoneNumber("0912345678");
    }

    // ── GET /api/v1/residents ───────────────────────────────────────────────

    @Test
    @DisplayName("GET / → 200 with paged result when ADMIN")
    void getAllResidents_asAdmin_returns200() throws Exception {
        Page<ResidentResponse> page = new PageImpl<>(List.of(sampleResponse));
        when(residentService.getAllResidents(any(), any(), any(Pageable.class))).thenReturn(page);

        mockMvc.perform(get("/api/v1/residents")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].fullName").value("Nguyen Duc Khai"));
    }

    @Test
    @DisplayName("GET / → 401 without token")
    void getAllResidents_withoutToken_returns401() throws Exception {
        mockMvc.perform(get("/api/v1/residents"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET / → 403 for RESIDENT role")
    void getAllResidents_asResident_returns403() throws Exception {
        mockMvc.perform(get("/api/v1/residents")
                        .header("Authorization", "Bearer " + residentToken))
                .andExpect(status().isForbidden());
    }

    // ── GET /api/v1/residents/{id} ─────────────────────────────────────────

    @Test
    @DisplayName("GET /{id} → 200 when resident exists")
    void getById_whenFound_returns200() throws Exception {
        when(residentService.getResidentById(1L)).thenReturn(sampleResponse);

        mockMvc.perform(get("/api/v1/residents/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("GET /{id} → 404 when resident does not exist")
    void getById_whenNotFound_returns404() throws Exception {
        when(residentService.getResidentById(99L))
                .thenThrow(new ResourceNotFoundException("Resident", 99L));

        mockMvc.perform(get("/api/v1/residents/99")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isNotFound());
    }

    // ── POST /api/v1/residents ─────────────────────────────────────────────

    @Test
    @DisplayName("POST / → 201 with valid body")
    void createResident_withValidBody_returns201() throws Exception {
        when(residentService.createResident(any(ResidentRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(post("/api/v1/residents")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.identityNumber").value("012345678910"));
    }

    @Test
    @DisplayName("POST / → 400 when fullName is blank")
    void createResident_withBlankFullName_returns400() throws Exception {
        ResidentRequest bad = new ResidentRequest();
        bad.setFullName(""); // violates @NotBlank

        mockMvc.perform(post("/api/v1/residents")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(bad)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("POST / → 400 when duplicate identity number")
    void createResident_withDuplicateIdentity_returns400() throws Exception {
        when(residentService.createResident(any()))
                .thenThrow(new IllegalArgumentException("Identity number '012345678910' is already registered"));

        mockMvc.perform(post("/api/v1/residents")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isBadRequest());
    }

    // ── PUT /api/v1/residents/{id} ─────────────────────────────────────────

    @Test
    @DisplayName("PUT /{id} → 200 on successful update")
    void updateResident_withValidBody_returns200() throws Exception {
        when(residentService.updateResident(eq(1L), any(ResidentRequest.class))).thenReturn(sampleResponse);

        mockMvc.perform(put("/api/v1/residents/1")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(validRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(1));
    }

    // ── DELETE /api/v1/residents/{id} ──────────────────────────────────────

    @Test
    @DisplayName("DELETE /{id} → 200 on successful delete")
    void deleteResident_whenExists_returns200() throws Exception {
        doNothing().when(residentService).deleteResident(1L);

        mockMvc.perform(delete("/api/v1/residents/1")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ── PATCH /api/v1/residents/{id}/deactivate ────────────────────────────

    @Test
    @DisplayName("PATCH /{id}/deactivate → 200 with status INACTIVE")
    void deactivateResident_whenExists_returnsInactive() throws Exception {
        ResidentResponse inactive = new ResidentResponse();
        inactive.setId(1L);
        inactive.setFullName("Nguyen Duc Khai");
        inactive.setStatus("INACTIVE");
        when(residentService.deactivateResident(1L)).thenReturn(inactive);

        mockMvc.perform(patch("/api/v1/residents/1/deactivate")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
    }
}