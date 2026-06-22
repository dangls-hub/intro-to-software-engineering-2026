package com.bluemoon.ams.common.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * Gửi email đặt lại mật khẩu với giao diện HTML
     *
     * @param toEmail Email người nhận
     * @param token   Mã OTP / Token để đặt lại mật khẩu
     */
    public void sendPasswordResetEmail(String toEmail, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("[BlueMoon AMS] Yêu cầu đặt lại mật khẩu");

            // Tạo nội dung email dạng HTML đẹp mắt
            String htmlContent = String.format(
                    "<html>" +
                    "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                    "   <h2 style='color: #0b1f28; text-align: center; border-bottom: 2px solid #c9a96e; padding-bottom: 10px;'>" +
                    "       BlueMoon AMS" +
                    "   </h2>" +
                    "   <p>Xin chào,</p>" +
                    "   <p>Bạn đã yêu cầu đặt lại mật khẩu cho tài khoản hệ thống quản lý chung cư BlueMoon.</p>" +
                    "   <p>Dưới đây là mã xác thực (Token) để bạn đổi mật khẩu mới. Mã này chỉ có hiệu lực trong vòng <strong>15 phút</strong>:</p>" +
                    "   <div style='background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #c9a96e; border-radius: 8px; margin: 20px 0;'>" +
                    "       %s" +
                    "   </div>" +
                    "   <p>Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này. Mật khẩu của bạn vẫn an toàn.</p>" +
                    "   <br/>" +
                    "   <p style='font-size: 12px; color: #888; text-align: center; border-top: 1px solid #eee; padding-top: 10px;'>" +
                    "       Đây là email tự động, vui lòng không phản hồi.<br/>" +
                    "       Bản quyền © 2026 Ban quản lý chung cư BlueMoon." +
                    "   </p>" +
                    "</body>" +
                    "</html>",
                    token
            );

            helper.setText(htmlContent, true); // true = isHtml

            mailSender.send(message);
            log.info("Password reset email sent successfully to {}", toEmail);

        } catch (MessagingException | org.springframework.mail.MailException e) {
            log.error("Failed to send password reset email to {}", toEmail, e);
            throw new RuntimeException("Không thể gửi email lúc này, vui lòng thử lại sau.");
        }
    }
}
