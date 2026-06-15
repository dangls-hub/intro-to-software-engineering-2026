package com.bluemoon.ams.module.announcement.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.announcement.dto.AnnouncementRequest;
import com.bluemoon.ams.module.announcement.dto.AnnouncementResponse;
import com.bluemoon.ams.module.announcement.entity.Announcement;
import com.bluemoon.ams.module.announcement.entity.AnnouncementType;
import com.bluemoon.ams.module.announcement.mapper.AnnouncementMapper;
import com.bluemoon.ams.module.announcement.repository.AnnouncementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AnnouncementServiceTest {

    @Mock
    private AnnouncementRepository announcementRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AnnouncementMapper announcementMapper;

    @InjectMocks
    private AnnouncementService announcementService;

    private User testUser;
    private Announcement testAnnouncement;
    private AnnouncementRequest testRequest;
    private AnnouncementResponse testResponse;

    @BeforeEach
    public void setUp() {
        testUser = User.builder()
                .id(1L)
                .username("admin1")
                .email("admin1@bluemoon.vn")
                .fullName("Quản trị viên")
                .build();

        testAnnouncement = Announcement.builder()
                .id(10L)
                .title("Thông báo bảo trì")
                .content("Bảo trì thang máy số 3")
                .type(AnnouncementType.ANNOUNCEMENT)
                .postedBy(testUser)
                .createdAt(LocalDateTime.now())
                .build();

        testRequest = AnnouncementRequest.builder()
                .title("Thông báo bảo trì")
                .content("Bảo trì thang máy số 3")
                .type("ANNOUNCEMENT")
                .build();

        testResponse = AnnouncementResponse.builder()
                .id(10L)
                .title("Thông báo bảo trì")
                .content("Bảo trì thang máy số 3")
                .type("ANNOUNCEMENT")
                .postedById(1L)
                .postedByName("Quản trị viên")
                .build();
    }

    @Test
    public void getAllAnnouncements_Success() {
        when(announcementRepository.findAllByOrderByCreatedAtDesc())
                .thenReturn(Collections.singletonList(testAnnouncement));
        when(announcementMapper.toResponse(testAnnouncement)).thenReturn(testResponse);

        List<AnnouncementResponse> results = announcementService.getAllAnnouncements();

        assertNotNull(results);
        assertEquals(1, results.size());
        assertEquals(10L, results.get(0).getId());

        verify(announcementRepository, times(1)).findAllByOrderByCreatedAtDesc();
    }

    @Test
    public void getAnnouncementById_Success() {
        when(announcementRepository.findById(10L)).thenReturn(Optional.of(testAnnouncement));
        when(announcementMapper.toResponse(testAnnouncement)).thenReturn(testResponse);

        AnnouncementResponse result = announcementService.getAnnouncementById(10L);

        assertNotNull(result);
        assertEquals(10L, result.getId());

        verify(announcementRepository, times(1)).findById(10L);
    }

    @Test
    public void getAnnouncementById_NotFound_ThrowsException() {
        when(announcementRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> announcementService.getAnnouncementById(10L));

        verify(announcementRepository, times(1)).findById(10L);
    }

    @Test
    public void createAnnouncement_Success() {
        when(userRepository.findByUsername("admin1")).thenReturn(Optional.of(testUser));
        when(announcementMapper.toEntity(testRequest)).thenReturn(testAnnouncement);
        when(announcementRepository.save(any(Announcement.class))).thenReturn(testAnnouncement);
        when(announcementMapper.toResponse(testAnnouncement)).thenReturn(testResponse);

        AnnouncementResponse result = announcementService.createAnnouncement(testRequest, "admin1");

        assertNotNull(result);
        assertEquals(10L, result.getId());

        verify(userRepository, times(1)).findByUsername("admin1");
        verify(announcementRepository, times(1)).save(any(Announcement.class));
    }

    @Test
    public void createAnnouncement_UserNotFound_ThrowsException() {
        when(userRepository.findByUsername("admin1")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> announcementService.createAnnouncement(testRequest, "admin1"));

        verify(announcementRepository, never()).save(any());
    }

    @Test
    public void updateAnnouncement_Success() {
        when(announcementRepository.findById(10L)).thenReturn(Optional.of(testAnnouncement));
        doNothing().when(announcementMapper).updateEntity(testAnnouncement, testRequest);
        when(announcementRepository.save(testAnnouncement)).thenReturn(testAnnouncement);
        when(announcementMapper.toResponse(testAnnouncement)).thenReturn(testResponse);

        AnnouncementResponse result = announcementService.updateAnnouncement(10L, testRequest);

        assertNotNull(result);
        assertEquals(10L, result.getId());

        verify(announcementRepository, times(1)).findById(10L);
        verify(announcementMapper, times(1)).updateEntity(testAnnouncement, testRequest);
        verify(announcementRepository, times(1)).save(testAnnouncement);
    }

    @Test
    public void updateAnnouncement_NotFound_ThrowsException() {
        when(announcementRepository.findById(10L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> announcementService.updateAnnouncement(10L, testRequest));

        verify(announcementRepository, times(1)).findById(10L);
        verify(announcementRepository, never()).save(any());
    }

    @Test
    public void deleteAnnouncement_Success() {
        when(announcementRepository.existsById(10L)).thenReturn(true);
        doNothing().when(announcementRepository).deleteById(10L);

        assertDoesNotThrow(() -> announcementService.deleteAnnouncement(10L));

        verify(announcementRepository, times(1)).existsById(10L);
        verify(announcementRepository, times(1)).deleteById(10L);
    }

    @Test
    public void deleteAnnouncement_NotFound_ThrowsException() {
        when(announcementRepository.existsById(10L)).thenReturn(false);

        assertThrows(ResourceNotFoundException.class, () -> announcementService.deleteAnnouncement(10L));

        verify(announcementRepository, times(1)).existsById(10L);
        verify(announcementRepository, never()).deleteById(anyLong());
    }
}
