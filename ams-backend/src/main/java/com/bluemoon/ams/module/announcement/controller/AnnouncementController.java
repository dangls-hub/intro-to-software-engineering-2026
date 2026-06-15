package com.bluemoon.ams.module.announcement.controller;

import com.bluemoon.ams.common.response.ApiResponse;
import com.bluemoon.ams.module.announcement.dto.AnnouncementRequest;
import com.bluemoon.ams.module.announcement.dto.AnnouncementResponse;
import com.bluemoon.ams.module.announcement.service.AnnouncementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AnnouncementResponse>>> getAllAnnouncements() {
        List<AnnouncementResponse> responses = announcementService.getAllAnnouncements();
        return ResponseEntity.ok(ApiResponse.ok("Lấy danh sách thông báo thành công", responses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> getAnnouncementById(@PathVariable Long id) {
        AnnouncementResponse response = announcementService.getAnnouncementById(id);
        return ResponseEntity.ok(ApiResponse.ok("Lấy chi tiết thông báo thành công", response));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> createAnnouncement(
            Authentication authentication,
            @Valid @RequestBody AnnouncementRequest request) {
        AnnouncementResponse response = announcementService.createAnnouncement(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Tạo thông báo thành công", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<AnnouncementResponse>> updateAnnouncement(
            @PathVariable Long id,
            @Valid @RequestBody AnnouncementRequest request) {
        AnnouncementResponse response = announcementService.updateAnnouncement(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thông báo thành công", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.ok("Xóa thông báo thành công", null));
    }
}
