package com.bluemoon.ams.common.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Sinh & xác thực mã OTP 6 chữ số, lưu tạm trong bộ nhớ (kèm thời hạn).
 * Dùng cho xác thực đăng nhập / giao dịch. Lưu ý: lưu in-memory nên OTP sẽ mất
 * khi restart và không chia sẻ giữa nhiều instance — phù hợp môi trường đơn node.
 */
@Service
public class OtpService {

    public static final int EXPIRATION_MINUTES = 5;

    private final Map<String, Entry> store = new ConcurrentHashMap<>();
    private final SecureRandom random = new SecureRandom();

    /** Sinh OTP mới cho email và lưu lại (ghi đè mã cũ nếu có). */
    public String generate(String email) {
        String code = String.format("%06d", random.nextInt(1_000_000));
        store.put(key(email), new Entry(code, Instant.now().plusSeconds(EXPIRATION_MINUTES * 60L)));
        return code;
    }

    /** Xác thực OTP; đúng thì xoá mã (dùng một lần). Sai/hết hạn → false. */
    public boolean verify(String email, String code) {
        if (email == null || code == null) return false;
        Entry entry = store.get(key(email));
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt)) {
            store.remove(key(email));
            return false;
        }
        boolean matched = entry.code.equals(code.trim());
        if (matched) store.remove(key(email));
        return matched;
    }

    private String key(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private static final class Entry {
        final String code;
        final Instant expiresAt;
        Entry(String code, Instant expiresAt) {
            this.code = code;
            this.expiresAt = expiresAt;
        }
    }
}
