package com.example.QuantumCoding.filter;

import java.io.IOException;
import java.util.Optional;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.QuantumCoding.Repositories.TokenRepository;
import com.example.QuantumCoding.Repositories.UserRepository;
import com.example.QuantumCoding.services.JwtService;
import com.example.QuantumCoding.services.UserService;
import com.example.QuantumCoding.token.Token;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserService userDetailsService;
    private final UserRepository repo;
    private final TokenRepository tokenRepository;



    public JwtAuthenticationFilter(JwtService jwtService, UserService userDetailsService, UserRepository repo,TokenRepository tokenRepository) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
        this.repo = repo;
        this.tokenRepository=tokenRepository;
    }



    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        
        // Get the Authorization header
            
        String authHeader = request.getHeader("Authorization");
        System.out.println("Authorization Header: " + request.getHeader("Authorization"));

        // If there is no Authorization header or it doesn't start with 'Bearer ', pass the request through the filter chain
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("No Bearer token found, proceeding without authentication.");
            filterChain.doFilter(request, response);
            return;
        }

        // Extract token from Authorization header
        String token = authHeader.substring(7);
        System.out.println("Extracted Token: " + token);

        String email = jwtService.extractEmail(token);
        System.out.println("Extracted Username from Token: " + email);

        // If username is found and no authentication is already set in the SecurityContext
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Load user details
            Optional<Token> isTokenValid=tokenRepository.findByToken((token));
            UserDetails userDetails = userDetailsService.loadUserByUsername(email);

            // If the token is valid, set the authentication in the SecurityContext
            System.out.println(jwtService.isValid(token, userDetails));
            if (jwtService.isValid(token, userDetails) && isTokenValid.isPresent()) {
                System.out.println("Token is valid, setting authentication.");

                System.out.println("Get authorities"+userDetails.getAuthorities());

                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null,userDetails.getAuthorities());
                // Set authentication details (optional, for capturing additional data like IP address)
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                // Set the authentication in the SecurityContextHolder
                SecurityContextHolder.getContext().setAuthentication(authToken);
               
                System.out.println("authtoken"+authToken);
            } else {
                System.out.println("Invalid token for the provided user details.");
            }
        } else {
            System.out.println("Username is null or authentication is already set.");
        }

        // Proceed with the next filter in the chain
        
        filterChain.doFilter(request, response);
    }

}
