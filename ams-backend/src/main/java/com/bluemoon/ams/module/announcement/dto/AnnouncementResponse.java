package com.bluemoon.ams.module.announcement.dto;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnnouncementResponse {

    private Long id;
    private String title;
    private String content;
    private String type; // ANNOUNCEMENT, EVENT
    private String eventDate;
    private Long postedById;
    private String postedByName;
    private String createdAt;
    private String updatedAt;
}
