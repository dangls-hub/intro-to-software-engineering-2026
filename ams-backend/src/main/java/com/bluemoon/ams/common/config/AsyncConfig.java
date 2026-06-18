package com.bluemoon.ams.common.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Bật xử lý bất đồng bộ (@Async) cho toàn ứng dụng và cung cấp executor riêng
 * cho việc gửi email — để gửi mail không chặn luồng request chính.
 *
 * Lưu ý: nếu không có @EnableAsync, mọi annotation @Async sẽ bị bỏ qua
 * và email vẫn gửi đồng bộ.
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {

    /**
     * Executor dành riêng cho gửi email. Các method trong BlueMoonEmailService
     * dùng @Async("emailExecutor") để chạy trên pool này.
     */
    @Bean(name = "emailExecutor")
    public Executor emailExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("email-");
        executor.initialize();
        return executor;
    }
}
