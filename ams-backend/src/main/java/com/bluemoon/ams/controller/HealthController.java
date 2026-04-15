package com.bluemoon.ams.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class HealthController {

    @GetMapping("/health")
    public ResponseEntity<String> checkHealth() {
        return ResponseEntity.ok("Hệ thống Quản lý Chung cư BlueMoon (AMS) đã chạy thành công!");
    }
}