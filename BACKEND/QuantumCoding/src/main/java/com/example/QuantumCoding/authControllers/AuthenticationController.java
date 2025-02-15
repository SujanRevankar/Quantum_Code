package com.example.QuantumCoding.authControllers;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.QuantumCoding.auth.AuthenticationRequest;
import com.example.QuantumCoding.auth.RegisterRequest;
import com.example.QuantumCoding.model.AuthenticationResponse;
import com.example.QuantumCoding.services.AuthenticationService;
import com.example.QuantumCoding.verification.VerificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;



@RestController()
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins="http://localhost:5173")
public class AuthenticationController {

        private final AuthenticationService authService;
        private final VerificationService verificationService;

        @PostMapping("/register")
        public ResponseEntity<AuthenticationResponse> register(@RequestBody RegisterRequest request){
            System.out.println(request);
            AuthenticationResponse response=authService.register(request);
            if(response.getToken().equals("Already registered")){
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }
            return ResponseEntity.ok(response);
        }
        
        @PostMapping("/login")
        public ResponseEntity<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
            AuthenticationResponse response=authService.authenticate(request);
            if (response.getToken().contains("ADMIN")) {
                System.out.println("Hello iam admin");
                return ResponseEntity.ok(response);
            }
            if(response.getToken().equals("Invalid email or password")){
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }else if(response.getToken().equals("User not verified")){
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            return ResponseEntity.ok(response);
        }
        @PostMapping("/verify-otp")
        public ResponseEntity<String> verifyOtp(@RequestBody OtpRequest otpRequest) {
        String email = otpRequest.getEmail();
        String otp = otpRequest.getOtp();
        System.out.println("email"+email+"otp"+otp);
        String result = verificationService.verifyOtp(email, otp);
        if(result.equals("OTP verified")){
            return ResponseEntity.ok("OTP verified successfully.");

        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(result);
    }
    @PostMapping("/send-otp")
        public ResponseEntity<String> sendOtp(@RequestBody OtpRequest otpRequest) {
        String email = otpRequest.getEmail();
        String result = verificationService.generateAndSaveOtp(email);
        if(result.equals("Success")){
            return ResponseEntity.ok(result);
        }
        else if(result.equals("Already sent")){
            return ResponseEntity.status(HttpStatus.ALREADY_REPORTED).body("OTP already sent and still valid.");
        }
        return ResponseEntity.status(HttpStatus.ALREADY_REPORTED).body("OTP already sent and still valid.");

    }
    @PostMapping("/resend-otp")
        public ResponseEntity<String> resendOtp(@RequestBody OtpRequest otpRequest) {
        String email = otpRequest.getEmail();
        String result = verificationService.ResendOtp(email);
        return ResponseEntity.ok(result);
    }
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody OtpRequest otpRequest){
        String email=otpRequest.getEmail();
        String password=otpRequest.getPassword();
        String res=authService.ResetPassword(email,password);
        if(res.equals("Success")){
            return ResponseEntity.ok("Password reset successfully");

        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(res);
    }
    
    public String getMethodName(@RequestParam String param) {
        return new String();
    }
    

    public static class OtpRequest {
        private String email;
        private String otp;
        private String password;
    
        // Getters and setters
        public String getEmail() {
            return email;
        }
    
        public void setEmail(String email) {
            this.email = email;
        }
    
        public String getOtp() {
            return otp;
        }
    
        public void setOtp(String otp) {
            this.otp = otp;
        }
        public String getPassword() {
            return password;
        }
    
        public void setMsg(String password) {
            this.password = password;
        }
    }
}
