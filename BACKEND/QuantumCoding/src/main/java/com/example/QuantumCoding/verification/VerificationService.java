package com.example.QuantumCoding.verification;

import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.Repositories.VerificationOtpRepository;
import com.example.QuantumCoding.model.Users;
import com.example.QuantumCoding.model.VerificationOtp;

@Service
public class VerificationService {
    private final VerificationOtpRepository verificationRepo;
    private final JavaMailSender mailSender;
    private final UserRepository repo;

    public VerificationService(VerificationOtpRepository verificationRepo, JavaMailSender mailSender,UserRepository repo) {
        this.verificationRepo = verificationRepo;
        this.mailSender = mailSender;
        this.repo=repo;
    }
    
    public String generateAndSaveOtp(String email){
        // Generate 6-digit OTP
        Optional<Users> existingUser=repo.findByEmail(email);
        if(existingUser.isPresent()){
            Users user=existingUser.get();
            String otp = generateNumericOtp();
        // Save OTP to database with an expiry time
        if(verificationRepo.findByEmail(user.getEmail()).isPresent()){
            VerificationOtp existingOtp = verificationRepo.findByEmail(user.getEmail()).get();
            if (existingOtp.getExpiryDateTime().isBefore(LocalDateTime.now())) {
                existingOtp.setOtp(otp);
                existingOtp.setExpiryDateTime(LocalDateTime.now().plusMinutes(1));
                verificationRepo.save(existingOtp);
                
                // Optionally, resend the OTP email
                sendVerificationEmail(user.getEmail(), otp);
                return "Success";
            }
            return "Already snet";
        }

        VerificationOtp verificationOtp = new VerificationOtp(user.getEmail(), otp, LocalDateTime.now().plusMinutes(1)); // Expiry set to 5 minutes
        verificationRepo.save(verificationOtp);
        
        // Send OTP via email
        sendVerificationEmail(user.getEmail(), otp);
        
        return "Success";
        }

        return "User with the specified email does not exist.";
        
    }
    public String ResendOtp(String email){
        VerificationOtp existingOtp = verificationRepo.findByEmail(email).get();
        String newOtp=generateNumericOtp();
        existingOtp.setOtp(newOtp);
        existingOtp.setExpiryDateTime(LocalDateTime.now().plusMinutes(1));
        verificationRepo.save(existingOtp);
        System.out.println("Resending otp");
        sendVerificationEmail(email, newOtp);
        return "OTP updated and resent";
    }

    private String generateNumericOtp() {
        int otp = 100000 + (int)(Math.random() * 900000);
        return String.valueOf(otp);
    }

    private ResponseEntity<String> sendVerificationEmail(String email, String otp) {
        // Create verification link with OTP as a query parameter
        System.out.println("Whats the problem");
        try {
            String verificationLink = "http://localhost:5173/verify";

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Email Verification");
            message.setText("Use the following OTP to verify your email: " + otp + "\n\nOr click the following link to verify: " + verificationLink);
            
            mailSender.send(message);
            System.out.println("Emailsent successfully go and check");
            return ResponseEntity.ok("Verification email sent successfully.");

        } catch (Exception e) {
            System.out.println("error"+e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error sending email: " + e.getMessage());
        }
    }

    public String verifyOtp(String email, String otp) {
        Optional<VerificationOtp> verificationOtp = verificationRepo.findByEmail(email);
        if(verificationOtp.isPresent()){

            VerificationOtp otpRecord=verificationOtp.get();
            if(otpRecord.getExpiryDateTime().isBefore(LocalDateTime.now())){
                return "OTP expired";
            }
            if(otpRecord.getOtp().equals(otp)){
                verificationRepo.delete(otpRecord);
                Optional<Users> userOptional=repo.findByEmail(email);
                if(userOptional.isPresent()){
                    Users user=userOptional.get();
                    if(!user.isVerified()){
                        user.setVerified(true);
                        repo.save(user);
                    }
                }
                return "OTP verified";
            }
            else{
                return "OTP does not match.";
            }
        }
        
        return "OTP record not found for this email."; // Validate OTP
    }
}
