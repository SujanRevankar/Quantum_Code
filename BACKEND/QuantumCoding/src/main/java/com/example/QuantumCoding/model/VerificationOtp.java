package com.example.QuantumCoding.model;

import java.time.LocalDateTime;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Getter;
import lombok.Setter;

@Document(collection="verification_tokens")
@Getter
@Setter
public class VerificationOtp {
    @Id
    private String id;
    private String email;
    private String otp;
    private LocalDateTime expiryDateTime;
    public VerificationOtp( String email, String otp,LocalDateTime expiryDateTime) {
        this.email = email;
        this.otp = otp;
        this.expiryDateTime = expiryDateTime;
    }
}
