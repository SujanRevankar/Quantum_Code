package com.example.QuantumCoding.config;

import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.LogoutHandler;
import org.springframework.stereotype.Service;
import com.example.QuantumCoding.Repositories.TokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class LogoutService implements LogoutHandler {

    private final TokenRepository tokenRepository;

    @Override
    public void logout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) {
        final String authHeader = request.getHeader("Authorization");
        final String token;

        // Check for valid Authorization header
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("Logout failed: Missing or invalid Authorization header");
            return;
        }

        // Extract the token
        token = authHeader.substring(7);

        // Find the token in the repository
        var storedToken = tokenRepository.findByToken(token);

        // Invalidate the token if present
        if (storedToken.isPresent()) {
            tokenRepository.delete(storedToken.get());
            log.info("Logout successful: Token invalidated");
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            log.warn("Logout failed: Token not found");
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
        }
    }
}
