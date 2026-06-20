package com.bluemoon.ams.module.chat.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiService {

    @Value("${app.gemini.api-key}")
    private String apiKey;

    @Value("${app.gemini.model}")
    private String model;

    private final RestTemplate restTemplate = new RestTemplate();

    public String askGemini(String question) {
        if (apiKey == null || apiKey.trim().isEmpty() || "demo_key".equals(apiKey)) {
            return "🤖 **BlueMoon AI**: Xin chào! Hiện tại tính năng trợ lý ảo chưa được kích hoạt do **GEMINI_API_KEY** chưa được cấu hình hoặc đang để mặc định. Vui lòng thêm key hợp lệ vào file `application.yml` hoặc thiết lập biến môi trường `GEMINI_API_KEY` nhé!";
        }

        String url = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent?key=" + apiKey;

        try {
            // Build the JSON payload structure using Maps
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", question);

            Map<String, Object> contentPart = new HashMap<>();
            contentPart.put("parts", Collections.singletonList(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", Collections.singletonList(contentPart));

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // Execute POST request
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, entity, Map.class);
            Map<String, Object> responseBody = responseEntity.getBody();

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseBody != null) {
                List<?> candidates = (List<?>) responseBody.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    Map<?, ?> candidate = (Map<?, ?>) candidates.get(0);
                    Map<?, ?> content = (Map<?, ?>) candidate.get("content");
                    if (content != null) {
                        List<?> parts = (List<?>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            Map<?, ?> part = (Map<?, ?>) parts.get(0);
                            return (String) part.get("text");
                        }
                    }
                }
            }
            return "🤖 **BlueMoon AI**: Rất tiếc, mình không nhận được phản hồi hợp lệ từ máy chủ AI. Vui lòng thử lại sau.";
        } catch (Exception e) {
            System.err.println("Gemini API error: " + e.getMessage());
            return "🤖 **BlueMoon AI**: Đã xảy ra lỗi khi kết nối với máy chủ Google Gemini. Vui lòng kiểm tra lại API Key hoặc kết nối mạng.";
        }
    }
}
