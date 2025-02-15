package com.example.QuantumCoding.services;

import java.util.Date;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import com.example.QuantumCoding.model.Users;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {
    
    @Value("${secret.key}")
    private String SECRET_KEY;

    public boolean isValid(String token,UserDetails userDetails){
        String email=extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token){
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token){
        return extractClaim(token,Claims::getExpiration);
    }

    public String extractEmail(String token){
        return extractClaim(token,Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims,T> resolver){
        Claims claims = extractAllClaims(token);
            return resolver.apply(claims);

    }

    private Claims extractAllClaims(String token){

            return Jwts
                    .parser()
                    .verifyWith(getSigninKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        
    }

    public String generateToken(Users user){
        String token = Jwts
            .builder()
            .subject(user.getEmail())
            .issuedAt(new Date(System.currentTimeMillis()))
            .expiration(new Date(System.currentTimeMillis() + 24*60*60*1000))
            .signWith(getSigninKey())
            .compact();
            return token;

        }

        private SecretKey getSigninKey(){
            byte[] keyBytes = Decoders.BASE64URL.decode(SECRET_KEY);
            return Keys.hmacShaKeyFor(keyBytes);
        }
}
