package com.bluemoon.ams.module.announcement.mapper;

import com.bluemoon.ams.module.announcement.dto.AnnouncementRequest;
import com.bluemoon.ams.module.announcement.dto.AnnouncementResponse;
import com.bluemoon.ams.module.announcement.entity.Announcement;
import com.bluemoon.ams.module.announcement.entity.AnnouncementType;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;

@Component
public class AnnouncementMapper {

    public Announcement toEntity(AnnouncementRequest request) {
        Announcement announcement = new Announcement();
        updateEntity(announcement, request);
        return announcement;
    }

    public void updateEntity(Announcement announcement, AnnouncementRequest request) {
        announcement.setTitle(request.getTitle());
        announcement.setContent(request.getContent());
        announcement.setType(request.getType() != null ? AnnouncementType.valueOf(request.getType().toUpperCase()) : AnnouncementType.ANNOUNCEMENT);
        announcement.setEventDate(parseDateTime(request.getEventDate()));
    }

    public AnnouncementResponse toResponse(Announcement announcement) {
        if (announcement == null) return null;

        AnnouncementResponse response = new AnnouncementResponse();
        response.setId(announcement.getId());
        response.setTitle(announcement.getTitle());
        response.setContent(announcement.getContent());
        response.setType(announcement.getType() != null ? announcement.getType().name() : "ANNOUNCEMENT");
        response.setEventDate(announcement.getEventDate() != null ? announcement.getEventDate().toString() : null);

        if (announcement.getPostedBy() != null) {
            response.setPostedById(announcement.getPostedBy().getId());
            response.setPostedByName(announcement.getPostedBy().getFullName() != null ? announcement.getPostedBy().getFullName() : announcement.getPostedBy().getUsername());
        }

        response.setCreatedAt(announcement.getCreatedAt() != null ? announcement.getCreatedAt().toString() : null);
        response.setUpdatedAt(announcement.getUpdatedAt() != null ? announcement.getUpdatedAt().toString() : null);

        return response;
    }

    private LocalDateTime parseDateTime(String dateStr) {
        if (dateStr == null || dateStr.isBlank()) {
            return null;
        }
        try {
            if (dateStr.contains("T")) {
                return LocalDateTime.parse(dateStr);
            }
            return LocalDateTime.parse(dateStr.replace(" ", "T"));
        } catch (DateTimeParseException e) {
            try {
                return java.time.LocalDate.parse(dateStr).atStartOfDay();
            } catch (DateTimeParseException ex) {
                return null;
            }
        }
    }
}
