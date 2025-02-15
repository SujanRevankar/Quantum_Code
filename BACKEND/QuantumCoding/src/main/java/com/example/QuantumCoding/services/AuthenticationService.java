package com.example.QuantumCoding.services;

import java.util.Optional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.QuantumCoding.Repositories.TokenRepository;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.auth.AuthenticationRequest;
import com.example.QuantumCoding.auth.RegisterRequest;
import com.example.QuantumCoding.model.AuthenticationResponse;
import com.example.QuantumCoding.model.Role;
import com.example.QuantumCoding.model.Status;
import com.example.QuantumCoding.model.Users;
import com.example.QuantumCoding.token.Token;
import com.example.QuantumCoding.verification.VerificationService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
        private final UserRepository repo;
        private final PasswordEncoder passwordEncoder;
        private final JwtService jwtService;
        private final AuthenticationManager authenticationManager;
        private final VerificationService verificationService; // Add VerificationService
        private final TokenRepository tokenRepository;
                
        public AuthenticationResponse register(RegisterRequest request){
            System.out.println(request.getUsername());
            Users user=new Users();
            user.setId(request.getId());
            user.setUsername(request.getEmail().split("@")[0]);
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            
            user.setLinkedIn(request.getLinkedIn());
            user.setGithub(request.getGithub());  
            user.setGuildName(request.getGuildName());
            user.setGuildRole(Role.NONE);
            user.setLanguages(request.getLanguages());  
            user.setConnections(request.getConnections());
            user.setRole(request.getRole() != null ? request.getRole() : Role.USER); 
            user.setVerified(false);
            user.setStage(request.getStage() != null ? request.getStage() : Status.BEGINNER); 
            
            try {
                if(repo.findByEmail(user.getEmail()).isPresent()){
                    System.out.println("This email is alredy registered."+user.getEmail());
                    return new AuthenticationResponse("Already registered");
                }
                user = repo.save(user);

                verificationService.generateAndSaveOtp(user.getEmail());
                } catch (Exception e) {
                    System.err.println("Error saving user: " + e.getMessage());
                }
                    
            System.out.println("User registered with ID: " + user.getId() + " and Username: " + user);
            
            String token=jwtService.generateToken(user);
            SaveUserToken(user,token);
            System.out.println("Generated JWT Token: " + token);
            
            return AuthenticationResponse.builder().token(token).build();
        }
            
    public AuthenticationResponse authenticate(AuthenticationRequest request){
                    // HttpServletResponse response=null;
        System.out.println("Attempting to authenticate user: " + request.getEmail());
            try {
                authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
                );
            // UserResponse userResponse=new UserResponse();
            Users user=repo.findByEmail((String) request.getEmail()).orElseThrow();
            if(user.getRole()==Role.ADMIN){
                String token=jwtService.generateToken(user);
                System.out.println("Generated JWT Token: " + token);
                SaveUserToken(user,token);
                token+="ADMIN";
                return AuthenticationResponse.builder().token(token).build();            
            }
            if(!user.isVerified()){
                return new AuthenticationResponse("User not verified");
        
            }
                    System.out.println("Authenticated user: " + user.getEmail());
            
                    String token=jwtService.generateToken(user);
                    System.out.println("Generated JWT Token: " + token);
                    SaveUserToken(user,token);
                    return AuthenticationResponse.builder().token(token).build();
                } catch (Exception e) {
                    // TODO: handle exception
                    System.out.println("Authentication failed: Invalid email or password."+e);
                    return new AuthenticationResponse("Invalid email or password");
        
                }
            }
            
            private void SaveUserToken(Users user,String token){
                Optional<Token> existingToken=tokenRepository.findAllValidTokenByUser(user.getId());
                
                if(existingToken.isPresent()){
                    System.out.println("Existing token"+existingToken);
                    System.out.println("Existing token"+existingToken.get());
                    tokenRepository.delete(existingToken.get());
                }
                var storeToken =Token.builder()
                        .user(user)
                        .token(token)
                        .revoked(false)
                        .expired(false)
                        .build();
                        tokenRepository.save(storeToken);
            }
            
            public String ResetPassword(String email,String password){
                Optional<Users> usersOpt=repo.findByEmail(email);
                if(usersOpt.isPresent()){
                    Users user=usersOpt.get();
                    user.setPassword(passwordEncoder.encode(password));
                    repo.save(user);
            return "Success";
        }
        return "User not exist";
    }

}
