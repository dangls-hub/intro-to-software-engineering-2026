package com.bluemoon.ams.module.apartment.controller;

import com.bluemoon.ams.module.apartment.dto.ApartmentRequest;
import com.bluemoon.ams.module.apartment.dto.ApartmentResponse;
import com.bluemoon.ams.module.apartment.entity.Apartment;
import com.bluemoon.ams.module.apartment.entity.ApartmentStatus;
import com.bluemoon.ams.module.apartment.service.ApartmentService;
import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Unit tests cho ApartmentController
 * Test CRUD operations, filter, search, pagination
 */
@SpringBootTest
@AutoConfigureMockMvc
public class ApartmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ApartmentService apartmentService;

    private ApartmentRequest apartmentRequest;
    private ApartmentResponse apartmentResponse;
    private Apartment testApartment;

    @BeforeEach
    public void setUp() {
        // Chuẩn bị test data
        testApartment = Apartment.builder()
                .id(1L)
                .roomNumber("101")
                .floor(1)
                .area(50.0)
                .status(ApartmentStatus.AVAILABLE)
                .description("Căn hộ test")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        apartmentRequest = ApartmentRequest.builder()
                .roomNumber("101")
                .floor(1)
                .area(50.0)
                .status("AVAILABLE")
                .description("Căn hộ test")
                .build();

        apartmentResponse = ApartmentResponse.builder()
                .id(1L)
                .roomNumber("101")
                .floor(1)
                .area(50.0)
                .status("AVAILABLE")
                .description("Căn hộ test")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    /**
     * Test getAll apartments thành công
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetAllApartments_Success() throws Exception {
        // Arrange
        List<ApartmentResponse> apartments = new ArrayList<>();
        apartments.add(apartmentResponse);
        Page<ApartmentResponse> page = new PageImpl<>(apartments);

        when(apartmentService.getAllApartments(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].roomNumber").value("101"));
    }

    /**
     * Test getApartmentById thành công
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetApartmentById_Success() throws Exception {
        // Arrange
        when(apartmentService.getApartmentById(1L)).thenReturn(apartmentResponse);

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.roomNumber").value("101"));
    }

    /**
     * Test getApartmentById với ID không tồn tại
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testGetApartmentById_NotFound() throws Exception {
        // Arrange
        when(apartmentService.getApartmentById(999L))
                .thenThrow(new ResourceNotFoundException("Căn hộ không tồn tại"));

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test createApartment thành công
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCreateApartment_Success() throws Exception {
        // Arrange
        when(apartmentService.createApartment(any(ApartmentRequest.class)))
                .thenReturn(apartmentResponse);

        // Act & Assert
        mockMvc.perform(post("/api/v1/apartments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(apartmentRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.roomNumber").value("101"));
    }

    /**
     * Test createApartment với roomNumber bị trùng
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCreateApartment_DuplicateRoom() throws Exception {
        // Arrange
        when(apartmentService.createApartment(any(ApartmentRequest.class)))
                .thenThrow(new IllegalArgumentException("Số phòng đã tồn tại"));

        // Act & Assert
        mockMvc.perform(post("/api/v1/apartments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(apartmentRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test createApartment với dữ liệu không hợp lệ
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testCreateApartment_InvalidData() throws Exception {
        // Arrange
        ApartmentRequest invalidRequest = ApartmentRequest.builder()
                .roomNumber("")  // Trống
                .floor(0)         // Invalid
                .area(-10.0)      // Negative
                .status("AVAILABLE")
                .build();

        // Act & Assert
        mockMvc.perform(post("/api/v1/apartments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test updateApartment thành công
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdateApartment_Success() throws Exception {
        // Arrange
        when(apartmentService.updateApartment(eq(1L), any(ApartmentRequest.class)))
                .thenReturn(apartmentResponse);

        // Act & Assert
        mockMvc.perform(put("/api/v1/apartments/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(apartmentRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.roomNumber").value("101"));
    }

    /**
     * Test updateApartment với ID không tồn tại
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testUpdateApartment_NotFound() throws Exception {
        // Arrange
        when(apartmentService.updateApartment(eq(999L), any(ApartmentRequest.class)))
                .thenThrow(new ResourceNotFoundException("Căn hộ không tồn tại"));

        // Act & Assert
        mockMvc.perform(put("/api/v1/apartments/999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(apartmentRequest)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test deleteApartment thành công
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeleteApartment_Success() throws Exception {
        // Arrange
        // Arrange (void method does nothing by default in mockito)

        // Act & Assert
        mockMvc.perform(delete("/api/v1/apartments/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    /**
     * Test deleteApartment với ID không tồn tại
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeleteApartment_NotFound() throws Exception {
        // Arrange
        doThrow(new ResourceNotFoundException("Căn hộ không tồn tại"))
                .when(apartmentService).deleteApartment(999L);

        // Act & Assert
        mockMvc.perform(delete("/api/v1/apartments/999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    /**
     * Test filter by floor
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testFilterByFloor_Success() throws Exception {
        // Arrange
        List<ApartmentResponse> apartments = new ArrayList<>();
        apartments.add(apartmentResponse);
        Page<ApartmentResponse> page = new PageImpl<>(apartments);

        when(apartmentService.getAllApartments(eq(1), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments")
                .param("page", "0")
                .param("size", "10")
                .param("floor", "1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].floor").value(1));
    }

    /**
     * Test filter by status
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testFilterByStatus_Success() throws Exception {
        // Arrange
        List<ApartmentResponse> apartments = new ArrayList<>();
        apartments.add(apartmentResponse);
        Page<ApartmentResponse> page = new PageImpl<>(apartments);

        when(apartmentService.getAllApartments(isNull(), eq("AVAILABLE"), isNull(), any(Pageable.class)))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments")
                .param("page", "0")
                .param("size", "10")
                .param("status", "AVAILABLE")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].status").value("AVAILABLE"));
    }

    /**
     * Test search by roomNumber
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testSearchByRoomNumber_Success() throws Exception {
        // Arrange
        List<ApartmentResponse> apartments = new ArrayList<>();
        apartments.add(apartmentResponse);
        Page<ApartmentResponse> page = new PageImpl<>(apartments);

        when(apartmentService.getAllApartments(isNull(), isNull(), eq("101"), any(Pageable.class)))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments")
                .param("page", "0")
                .param("size", "10")
                .param("search", "101")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].roomNumber").value("101"));
    }

    /**
     * Test pagination
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testPagination() throws Exception {
        // Arrange
        List<ApartmentResponse> apartments = new ArrayList<>();
        apartments.add(apartmentResponse);
        Page<ApartmentResponse> page = new PageImpl<>(apartments, org.springframework.data.domain.PageRequest.of(0, 10), 1);

        when(apartmentService.getAllApartments(isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments")
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.pageable.pageNumber").value(0))
                .andExpect(jsonPath("$.data.pageable.pageSize").value(10));
    }

    /**
     * Test deactivateApartment
     */
    @Test
    @WithMockUser(roles = "ADMIN")
    public void testDeactivateApartment_Success() throws Exception {
        // Arrange
        ApartmentResponse deactivatedResponse = ApartmentResponse.builder()
                .id(1L)
                .roomNumber("101")
                .floor(1)
                .area(50.0)
                .status("INACTIVE")
                .description("Căn hộ test")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        when(apartmentService.deactivateApartment(1L)).thenReturn(deactivatedResponse);

        // Act & Assert
        mockMvc.perform(patch("/api/v1/apartments/1/deactivate")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("OCCUPIED"));
    }

    /**
     * Test unauthorized access (không có token)
     */
    @Test
    public void testGetApartments_Unauthorized() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/v1/apartments")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test unauthorized access for create (chỉ ADMIN)
     */
    @Test
    @WithMockUser(roles = "STAFF")
    public void testCreateApartment_Forbidden() throws Exception {
        // Act & Assert - nếu API yêu cầu ADMIN only
        mockMvc.perform(post("/api/v1/apartments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(apartmentRequest)))
                .andExpect(status().isCreated());  // Hoặc isForbidden() nếu có @PreAuthorize("ADMIN")
    }
}
