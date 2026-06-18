package com.bluemoon.ams.common.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;

/**
 * BlueMoonEmailService — dịch vụ gửi email trung tâm cho toàn bộ kịch bản vận hành
 * của BlueMoon AMS (hoá đơn, nhắc nợ, bảo trì, cảnh báo, OTP, chào mừng, ticket...).
 *
 * <p>Mọi method gửi mail đều {@code @Async("emailExecutor")} → chạy nền, không chặn
 * luồng request. Tất cả nội dung được bọc trong template Premium dùng Java Text Block.</p>
 *
 * <p>Dịch vụ này KHÔNG thay thế {@link EmailService} (luồng quên mật khẩu) — hai dịch vụ
 * tồn tại song song.</p>
 */
@Service
public class BlueMoonEmailService {

    private static final Logger log = LoggerFactory.getLogger(BlueMoonEmailService.class);

    /* ── Premium Design System tokens ───────────────── */
    private static final String TEAL  = "#0b1f28"; // Deep Teal — nền & header
    private static final String BEIGE = "#f8f5f0"; // Light Beige — thẻ nội dung
    private static final String GOLD  = "#d4af37"; // Gold — điểm nhấn & nút
    private static final String TEXT  = "#3a3a3a"; // Văn bản trên nền beige

    /** Liên kết cổng thanh toán cư dân (frontend). */
    private static final String PAYMENTS_URL = "http://localhost:5173/my-payments";

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /* ═══════════════════════════════════════════════════════════════
     *  GROUP 1 — TRANSACTION & FINANCE
     * ═══════════════════════════════════════════════════════════════ */

    /** 1. Thông báo hoá đơn phí dịch vụ hàng tháng + nút "THANH TOÁN NGAY". */
    @Async("emailExecutor")
    public void sendMonthlyInvoice(String email, String name, String apartmentNo,
                                   String month, BigDecimal totalAmount) {
        String content = greeting(name, apartmentNo)
                + para("Ban quản lý chung cư BlueMoon xin thông báo phí dịch vụ của căn hộ "
                        + "<b>" + esc(apartmentNo) + "</b> kỳ <b>" + esc(month) + "</b> đã được phát hành.")
                + highlightBox(
                        "<div style=\"font-size:13px; color:#6b6b6b; text-transform:uppercase; letter-spacing:1px;\">Tổng số tiền cần thanh toán</div>"
                        + "<div style=\"font-size:30px; font-weight:bold; color:" + TEAL + "; margin-top:6px;\">" + vnd(totalAmount) + "</div>")
                + para("Vui lòng thanh toán đúng hạn để tránh phát sinh phí trễ hạn. "
                        + "Bấm nút bên dưới để thanh toán trực tuyến nhanh chóng:")
                + goldButton("THANH TOÁN NGAY", PAYMENTS_URL);

        send(email, "[BlueMoon AMS] Thông báo phí dịch vụ kỳ " + month, content);
    }

    /** 2. Xác nhận đã nhận thanh toán thành công. */
    @Async("emailExecutor")
    public void sendPaymentConfirmation(String email, String name, BigDecimal amount, String date) {
        String content = greeting(name, null)
                + para("Chúng tôi xác nhận đã nhận được khoản thanh toán của Quý cư dân. "
                        + "Cảm ơn bạn đã hoàn tất nghĩa vụ tài chính đúng hạn.")
                + highlightBox(
                        kv("Số tiền", vnd(amount))
                        + kv("Thời gian", esc(date))
                        + kv("Trạng thái", "<span style=\"color:#0d9668;\">Thành công ✓</span>"))
                + para("Đây là email xác nhận tự động, vui lòng giữ lại để đối chiếu khi cần thiết.");

        send(email, "[BlueMoon AMS] Xác nhận thanh toán thành công", content);
    }

    /** 2b. Thông báo yêu cầu thanh toán bị từ chối (kèm lý do nếu có). */
    @Async("emailExecutor")
    public void sendPaymentRejection(String email, String name, String feeName, String reason) {
        String box = kv("Khoản phí", esc(feeName))
                + kv("Trạng thái", "<span style=\"color:#dc2626;\">Bị từ chối</span>");
        if (reason != null && !reason.isBlank()) {
            box += kv("Lý do", esc(reason));
        }
        String content = greeting(name, null)
                + para("Rất tiếc, yêu cầu thanh toán của bạn <b>chưa được duyệt</b>.")
                + highlightBox(box)
                + para("Vui lòng kiểm tra lại thông tin/biên lai chuyển khoản và gửi lại yêu cầu. "
                        + "Nếu cần hỗ trợ, hãy liên hệ Ban quản lý.")
                + goldButton("XEM & GỬI LẠI", PAYMENTS_URL);

        send(email, "[BlueMoon AMS] Yêu cầu thanh toán bị từ chối", content);
    }

    /** 3. Nhắc nhở nhẹ nhàng khoản phí còn nợ. */
    @Async("emailExecutor")
    public void sendDebtReminder(String email, String name, String apartmentNo, BigDecimal debtAmount) {
        String content = greeting(name, apartmentNo)
                + para("Ban quản lý xin gửi lời nhắc nhở thân thiện rằng căn hộ <b>" + esc(apartmentNo)
                        + "</b> hiện vẫn còn một khoản phí chưa được thanh toán.")
                + highlightBox(
                        "<div style=\"font-size:13px; color:#6b6b6b; text-transform:uppercase; letter-spacing:1px;\">Số tiền còn nợ</div>"
                        + "<div style=\"font-size:26px; font-weight:bold; color:" + TEAL + "; margin-top:6px;\">" + vnd(debtAmount) + "</div>")
                + para("Rất mong Quý cư dân sắp xếp thanh toán trong thời gian sớm nhất. "
                        + "Nếu bạn đã thanh toán, xin vui lòng bỏ qua email này.")
                + goldButton("THANH TOÁN NGAY", PAYMENTS_URL);

        send(email, "[BlueMoon AMS] Nhắc nhở thanh toán phí còn nợ", content);
    }

    /** 4. Thông báo thay đổi giá dịch vụ (vd: tăng phí gửi xe). */
    @Async("emailExecutor")
    public void sendServicePriceChange(String email, String name, String serviceName,
                                       BigDecimal oldPrice, BigDecimal newPrice, String effectiveDate) {
        String content = greeting(name, null)
                + para("Ban quản lý xin trân trọng thông báo về việc điều chỉnh giá dịch vụ "
                        + "<b>" + esc(serviceName) + "</b> trong thời gian sắp tới.")
                + highlightBox(
                        kv("Dịch vụ", esc(serviceName))
                        + kv("Giá hiện tại", "<span style=\"text-decoration:line-through; color:#9a8e7e;\">" + vnd(oldPrice) + "</span>")
                        + kv("Giá mới", "<span style=\"color:" + TEAL + "; font-size:17px;\">" + vnd(newPrice) + "</span>")
                        + kv("Hiệu lực từ", esc(effectiveDate)))
                + para("Mọi thắc mắc xin liên hệ Ban quản lý để được giải đáp. Xin cảm ơn sự thấu hiểu của Quý cư dân.");

        send(email, "[BlueMoon AMS] Thông báo thay đổi giá dịch vụ " + serviceName, content);
    }

    /** Thông báo chung từ Bảng tin — gửi cho toàn thể cư dân (đồng bộ với mục Bảng tin). */
    @Async("emailExecutor")
    public void sendAnnouncement(String email, String name, String title, String content) {
        String body = greeting(name, null)
                + para("Ban quản lý chung cư BlueMoon vừa đăng một thông báo mới trên bảng tin:")
                + highlightBox(
                        "<div style=\"font-size:17px; font-weight:bold; color:" + TEAL + "; margin-bottom:10px;\">" + esc(title) + "</div>"
                        + "<div style=\"color:" + TEXT + "; font-size:15px; line-height:1.7; white-space:pre-line;\">" + esc(content) + "</div>")
                + para("Vui lòng đăng nhập cổng thông tin cư dân để xem chi tiết.")
                + goldButton("XEM BẢNG TIN", "http://localhost:5173/announcements");

        send(email, "[BlueMoon AMS] " + title, body);
    }

    /* ═══════════════════════════════════════════════════════════════
     *  GROUP 2 — SECURITY & TECHNICAL
     * ═══════════════════════════════════════════════════════════════ */

    /** 5. Thông báo lịch bảo trì kỹ thuật. */
    @Async("emailExecutor")
    public void sendMaintenanceNotice(String email, String name, String issue,
                                      String startTime, String endTime) {
        String content = greeting(name, null)
                + para("Ban quản lý xin thông báo lịch bảo trì có thể ảnh hưởng đến sinh hoạt của Quý cư dân:")
                + highlightBox(
                        kv("Hạng mục", esc(issue))
                        + kv("Bắt đầu", esc(startTime))
                        + kv("Dự kiến kết thúc", esc(endTime)))
                + para("Rất mong Quý cư dân thông cảm vì sự bất tiện này. Chúng tôi sẽ hoàn tất trong thời gian sớm nhất.");

        send(email, "[BlueMoon AMS] Thông báo lịch bảo trì", content);
    }

    /** 6. Cảnh báo khẩn cấp (mất điện/nước đột xuất...). */
    @Async("emailExecutor")
    public void sendEmergencyAlert(String email, String name, String alertMessage) {
        String content = greeting(name, null)
                + alertBox("#dc2626", "⚠ CẢNH BÁO KHẨN CẤP", esc(alertMessage))
                + para("Vui lòng giữ bình tĩnh và làm theo hướng dẫn của Ban quản lý. "
                        + "Liên hệ hotline khẩn cấp nếu cần hỗ trợ ngay.");

        send(email, "[BlueMoon AMS] ⚠ Cảnh báo khẩn cấp", content);
    }

    /** 7. Cảnh báo an ninh (truy cập bất thường, sự cố an ninh...). */
    @Async("emailExecutor")
    public void sendSecurityAlert(String email, String name, String alertMessage) {
        String content = greeting(name, null)
                + alertBox("#d97706", "🔒 CẢNH BÁO AN NINH", esc(alertMessage))
                + para("Nếu đây không phải là hành động do bạn thực hiện, vui lòng liên hệ Ban quản lý ngay lập tức "
                        + "để được hỗ trợ kịp thời.");

        send(email, "[BlueMoon AMS] 🔒 Cảnh báo an ninh", content);
    }

    /* ═══════════════════════════════════════════════════════════════
     *  GROUP 3 — ACCOUNT & ADMINISTRATION
     * ═══════════════════════════════════════════════════════════════ */

    /** 8. Gửi mã OTP xác thực đăng nhập / giao dịch. */
    @Async("emailExecutor")
    public void sendOtpCode(String email, String name, String otpCode, int expirationMinutes) {
        String content = greeting(name, null)
                + para("Mã xác thực (OTP) của bạn là:")
                + "<div style=\"text-align:center; margin:24px 0;\">"
                + "  <span style=\"display:inline-block; background-color:" + TEAL + "; color:" + GOLD + ";"
                + "    font-size:32px; font-weight:bold; letter-spacing:10px; padding:16px 28px; border-radius:10px;"
                + "    font-family:'Courier New',monospace;\">" + esc(otpCode) + "</span>"
                + "</div>"
                + para("Mã có hiệu lực trong vòng <b>" + expirationMinutes + " phút</b>. "
                        + "Tuyệt đối <b>không chia sẻ</b> mã này cho bất kỳ ai, kể cả nhân viên Ban quản lý.");

        send(email, "[BlueMoon AMS] Mã xác thực OTP của bạn", content);
    }

    /** 9. Chào mừng cư dân mới + liên kết truy cập cổng thông tin. */
    @Async("emailExecutor")
    public void sendWelcomeEmail(String email, String name, String apartmentNo, String loginLink) {
        String content = greeting(name, apartmentNo)
                + para("Chào mừng bạn đến với cộng đồng cư dân chung cư <b>BlueMoon</b>! "
                        + "Tài khoản cho căn hộ <b>" + esc(apartmentNo) + "</b> của bạn đã được khởi tạo thành công.")
                + para("Tại cổng thông tin cư dân, bạn có thể xem khoản thu, thanh toán trực tuyến, "
                        + "gửi phản ánh và nhận thông báo từ Ban quản lý.")
                + goldButton("TRUY CẬP CỔNG THÔNG TIN", loginLink)
                + para("Nếu cần hỗ trợ, vui lòng liên hệ <b>support@bluemoon.vn</b> hoặc hotline <b>1900 1234</b>. "
                        + "Chúc bạn có những trải nghiệm tuyệt vời!");

        send(email, "[BlueMoon AMS] Chào mừng bạn đến với BlueMoon AMS", content);
    }

    /** 10. Cập nhật trạng thái yêu cầu/phản ánh (ticket). */
    @Async("emailExecutor")
    public void sendTicketUpdate(String email, String name, String ticketTitle,
                                 String status, String message) {
        String box = kv("Tiêu đề", esc(ticketTitle))
                + kv("Trạng thái", "<span style=\"display:inline-block; background-color:" + GOLD + ";"
                        + " color:" + TEAL + "; font-size:12px; font-weight:bold; padding:3px 12px; border-radius:999px;\">"
                        + esc(status) + "</span>");
        if (message != null && !message.isBlank()) {
            box += kv("Phản hồi", esc(message));
        }

        String content = greeting(name, null)
                + para("Yêu cầu/phản ánh của bạn vừa có cập nhật mới:")
                + highlightBox(box)
                + para("Cảm ơn bạn đã đồng hành cùng Ban quản lý trong việc nâng cao chất lượng dịch vụ.");

        send(email, "[BlueMoon AMS] Cập nhật yêu cầu: " + ticketTitle, content);
    }

    /* ═══════════════════════════════════════════════════════════════
     *  PRIVATE HELPERS
     * ═══════════════════════════════════════════════════════════════ */

    /**
     * Bọc nội dung cụ thể của mỗi email vào Premium Design System chung
     * (Deep Teal nền/header, Light Beige thẻ nội dung, Gold điểm nhấn).
     */
    private String buildBaseEmailTemplate(String content) {
        String template = """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0; padding:0; background-color:#0b1f28; font-family:Arial,Helvetica,sans-serif;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0b1f28;">
                <tr>
                  <td align="center" style="padding:32px 16px;">
                    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; border-radius:14px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,0.4);">
                      <tr>
                        <td align="center" style="background-color:#0b1f28; padding:30px 24px; border-bottom:3px solid #d4af37;">
                          <div style="color:#d4af37; font-size:27px; font-weight:bold; letter-spacing:1px; font-family:Georgia,'Times New Roman',serif;">🌙 BlueMoon AMS</div>
                          <div style="color:#9a8e7e; font-size:12px; letter-spacing:2px; text-transform:uppercase; margin-top:6px;">Hệ thống quản lý chung cư</div>
                        </td>
                      </tr>
                      <tr>
                        <td style="background-color:#f8f5f0; padding:36px 34px;">
                          <!--CONTENT-->
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="background-color:#0b1f28; padding:22px 28px;">
                          <div style="color:#9a8e7e; font-size:12px; line-height:1.6;">
                            Đây là email tự động, vui lòng không phản hồi trực tiếp.<br>
                            Hỗ trợ: <span style="color:#d4af37;">support@bluemoon.vn</span> &nbsp;•&nbsp; Hotline: <span style="color:#d4af37;">1900 1234</span>
                          </div>
                          <div style="color:#5e5448; font-size:11px; margin-top:10px;">
                            © 2026 Ban quản lý chung cư BlueMoon. Bảo lưu mọi quyền.
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
            """;
        return template.replace("<!--CONTENT-->", content);
    }

    /** Gửi email HTML — bọc nội dung qua template rồi gửi. Nuốt lỗi (chạy async). */
    private void send(String to, String subject, String content) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(buildBaseEmailTemplate(content), true); // true = HTML
            mailSender.send(message);
            log.info("Email '{}' đã gửi tới {}", subject, to);
        } catch (MessagingException | RuntimeException e) {
            // Trong ngữ cảnh @Async, ném exception ra cũng bị nuốt → chỉ log để không làm gãy luồng nghiệp vụ.
            log.error("Gửi email '{}' tới {} thất bại: {}", subject, to, e.getMessage());
        }
    }

    /** Lời chào cá nhân hoá: ưu tiên tên cư dân, fallback theo số căn hộ. */
    private String greeting(String name, String apartmentNo) {
        String line;
        if (name != null && !name.isBlank()) {
            line = "Kính chào " + esc(name) + ",";
        } else if (apartmentNo != null && !apartmentNo.isBlank()) {
            line = "Chào chủ nhân căn hộ " + esc(apartmentNo) + ",";
        } else {
            line = "Kính chào Quý cư dân,";
        }
        return "<p style=\"font-size:17px; font-weight:bold; color:" + TEAL + "; margin:0 0 18px;\">" + line + "</p>";
    }

    /** Đoạn văn bản chuẩn trên nền beige. */
    private String para(String html) {
        return "<p style=\"color:" + TEXT + "; font-size:15px; line-height:1.7; margin:0 0 14px;\">" + html + "</p>";
    }

    /** Dòng nhãn : giá trị (dùng bên trong box). */
    private String kv(String label, String valueHtml) {
        return "<div style=\"margin:6px 0; font-size:14px;\">"
                + "<span style=\"color:#6b6b6b;\">" + esc(label) + ": </span>"
                + "<b style=\"color:" + TEAL + ";\">" + valueHtml + "</b></div>";
    }

    /** Khối nhấn mạnh viền vàng. */
    private String highlightBox(String innerHtml) {
        return "<div style=\"background-color:#ffffff; border:1px solid " + GOLD + "; border-left:4px solid " + GOLD + ";"
                + " border-radius:8px; padding:18px 20px; margin:22px 0;\">" + innerHtml + "</div>";
    }

    /** Khối cảnh báo có màu nhấn (đỏ/cam) cho email khẩn cấp / an ninh. */
    private String alertBox(String hexColor, String title, String message) {
        return "<div style=\"background-color:#ffffff; border:1px solid " + hexColor + "; border-left:5px solid " + hexColor + ";"
                + " border-radius:8px; padding:18px 20px; margin:22px 0;\">"
                + "<div style=\"color:" + hexColor + "; font-size:16px; font-weight:bold; margin-bottom:8px;\">" + title + "</div>"
                + "<div style=\"color:" + TEXT + "; font-size:15px; line-height:1.6;\">" + message + "</div>"
                + "</div>";
    }

    /** Nút Call-to-Action vàng. */
    private String goldButton(String text, String url) {
        return "<table role=\"presentation\" cellpadding=\"0\" cellspacing=\"0\" style=\"margin:26px auto;\">"
                + "<tr><td style=\"border-radius:8px; background-color:" + GOLD + ";\">"
                + "<a href=\"" + url + "\" target=\"_blank\" style=\"display:inline-block; padding:14px 34px;"
                + " font-size:15px; font-weight:bold; color:" + TEAL + "; text-decoration:none;"
                + " font-family:Arial,sans-serif; border-radius:8px;\">" + text + "</a>"
                + "</td></tr></table>";
    }

    /** Định dạng tiền tệ VND: "1.500.000 đ". */
    private String vnd(BigDecimal amount) {
        if (amount == null) return "—";
        NumberFormat nf = NumberFormat.getInstance(new Locale("vi", "VN"));
        nf.setMaximumFractionDigits(0);
        return nf.format(amount) + " đ";
    }

    /** Escape tối thiểu để dữ liệu đầu vào không phá vỡ HTML. */
    private String esc(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }
}
