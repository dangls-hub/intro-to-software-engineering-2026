package com.bluemoon.ams.common.exception;

/**
 * Exception khi không tìm thấy tài nguyên (404).
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " không tồn tại với id: " + id);
    }
}
