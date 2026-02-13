package com.innoad.exception;

public class TooManyRequestsException extends RuntimeException {
    
    private long retryAfterSeconds;
    
    public TooManyRequestsException(String message) {
        super(message);
    }
    
    public TooManyRequestsException(String message, long retryAfterSeconds) {
        super(message);
        this.retryAfterSeconds = retryAfterSeconds;
    }
    
    public TooManyRequestsException(String message, Throwable cause) {
        super(message, cause);
    }
    
    public long getRetryAfterSeconds() {
        return retryAfterSeconds;
    }
    
    public void setRetryAfterSeconds(long retryAfterSeconds) {
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
