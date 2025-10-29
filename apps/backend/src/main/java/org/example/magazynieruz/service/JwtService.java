package org.example.magazynieruz.service;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.example.magazynieruz.model.User;
import org.springframework.cglib.core.internal.Function;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private String secretKey ="9fc7ea0afeb9141ee6ba7a7dc71cb711c6d020e5bd38efee65258e1fbf1a2f0be125b5dd70cc02595932dc422beea0562b5e61a04a13137ffceef974b98ddd6d";

    private long jwtExpiration;

    private SecretKey signInKey;

    public JwtService () {
        signInKey = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token).getPayload();
        return claimsResolver.apply(claims);
    }

    public String generateToken(User userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, User userDetails) {
        return buildToken(extraClaims, userDetails, getExpirationTimeInMinutes());
    }

    public long getExpirationTimeInMinutes() {
        return System.currentTimeMillis() + 1000 * 60 * 30;
    }

    public boolean isTokenValid(String token, User userDetails) {
        try {
            final String username = extractUsername(token);

            return username.equals(userDetails.getUsername());

        } catch (JwtException e) {
            return false;
        }
    }

    private String buildToken(
            Map<String, Object> extraClaims,
            User userDetails,
            long expirationInMinutes
    ) {
        return Jwts
                .builder()
                .claims(extraClaims)
                .subject(userDetails.getUsername())
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plus(expirationInMinutes, ChronoUnit.MINUTES)))
                .signWith(signInKey)
                .compact();
    }

    private Jws<Claims> extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signInKey)
                .build()
                .parseSignedClaims(token);
    }

}
