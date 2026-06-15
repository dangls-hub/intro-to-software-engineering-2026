package com.bluemoon.ams.module.announcement.service;

import com.bluemoon.ams.common.exception.ResourceNotFoundException;
import com.bluemoon.ams.module.auth.entity.User;
import com.bluemoon.ams.module.auth.repository.UserRepository;
import com.bluemoon.ams.module.announcement.dto.AnnouncementRequest;
import com.bluemoon.ams.module.announcement.dto.AnnouncementResponse;
import com.bluemoon.ams.module.announcement.entity.Announcement;
import com.bluemoon.ams.module.announcement.mapper.AnnouncementMapper;
import com.bluemoon.ams.module.announcement.repository.AnnouncementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final UserRepository userRepository;
    private final AnnouncementMapper announcementMapper;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               UserRepository userRepository,
                               AnnouncementMapper announcementMapper) {
        this.announcementRepository = announcementRepository;
        this.userRepository = userRepository;
        this.announcementMapper = announcementMapper;
    }

    @Transactional(readOnly = true)
    public List<AnnouncementResponse> getAllAnnouncements() {
        return announcementRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(announcementMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AnnouncementResponse getAnnouncementById(Long id) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo", id));
        return announcementMapper.toResponse(announcement);
    }

    public AnnouncementResponse createAnnouncement(AnnouncementRequest request, String username) {
        User postedBy = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User '" + username + "' không tồn tại"));

        Announcement announcement = announcementMapper.toEntity(request);
        announcement.setPostedBy(postedBy);

        Announcement saved = announcementRepository.save(announcement);
        return announcementMapper.toResponse(saved);
    }

    public AnnouncementResponse updateAnnouncement(Long id, AnnouncementRequest request) {
        Announcement announcement = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Thông báo", id));

        announcementMapper.updateEntity(announcement, request);
        Announcement updated = announcementRepository.save(announcement);
        return announcementMapper.toResponse(updated);
    }

    public void deleteAnnouncement(Long id) {
        if (!announcementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Thông báo", id);
        }
        announcementRepository.deleteById(id);
    }
}
