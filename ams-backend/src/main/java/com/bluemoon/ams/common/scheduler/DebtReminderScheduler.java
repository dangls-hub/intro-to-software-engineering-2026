package com.bluemoon.ams.common.scheduler;

import com.bluemoon.ams.common.service.EmailBroadcastService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Tác vụ định kỳ gửi email nhắc nợ cho các khoản phí quá hạn.
 * Yêu cầu @EnableScheduling (đã bật ở AsyncConfig).
 */
@Component
public class DebtReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(DebtReminderScheduler.class);

    @Autowired
    private EmailBroadcastService broadcastService;

    /**
     * Chạy 08:00 mỗi ngày (giờ server). Quét phí quá hạn và gửi nhắc nợ.
     * cron: giây phút giờ ngày tháng thứ.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void sendDailyDebtReminders() {
        try {
            int n = broadcastService.runDebtReminders();
            log.info("[DebtReminderScheduler] Đã kích hoạt {} email nhắc nợ.", n);
        } catch (RuntimeException e) {
            log.error("[DebtReminderScheduler] Lỗi khi gửi nhắc nợ: {}", e.getMessage());
        }
    }
}
