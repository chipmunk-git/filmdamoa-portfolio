package com.filmdamoa.backend.util;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;

import javax.annotation.PostConstruct;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Component
public class JwtTokenUtil implements Serializable {
	private static final long serialVersionUID = 3709614684261587445L;
	
	public static final long TOKEN_VALIDATION_SECOND = 3600L;
	public static final long REFRESH_TOKEN_VALIDATION_SECOND = 3600L * 24 * 14;
	
	public static final String ACCESS_TOKEN_NAME = "accessToken";
	public static final String REFRESH_TOKEN_NAME = "refreshToken";
	
	@Value("${spring.jwt.secret}")
	private String secret;
	
	private SecretKey key;
	
	@PostConstruct
	public void init() {
		key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
	}
	
	public String getUsernameFromToken(String token) {
		return getClaimFromToken(token, Claims::getSubject);
	}
	
	public Date getExpirationDateFromToken(String token) {
		return getClaimFromToken(token, Claims::getExpiration);
	}
	
	public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
		final Claims claims = getAllClaimsFromToken(token);
		return claimsResolver.apply(claims);
	}
	
	private Claims getAllClaimsFromToken(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
	}
	
	public Map<String, Object> getUserParseInfo(String token) {
		Claims parseInfo = Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
		Map<String, Object> result = new HashMap<>();
		result.put("username", parseInfo.getSubject());
		result.put("role", parseInfo.get("role", List.class));
		
		return result;
	}
	
	public Boolean isTokenExpired(String token) {
		final Date expiration = getExpirationDateFromToken(token);
		return expiration.before(new Date());
	}
	
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		List<String> list = new ArrayList<>();
		
		for (GrantedAuthority auth : userDetails.getAuthorities()) {
			list.add(auth.getAuthority());
		}
		claims.put("role", list);
		
		return doGenerateToken(claims, userDetails.getUsername(), TOKEN_VALIDATION_SECOND * 1000);
	}
	
	public String generateRefreshToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		return doGenerateToken(claims, userDetails.getUsername(), REFRESH_TOKEN_VALIDATION_SECOND * 1000);
	}
	
	private String doGenerateToken(Map<String, Object> claims, String subject, long expireTime) {
		return Jwts.builder()
			.setClaims(claims)
			.setSubject(subject)
			.setIssuedAt(new Date(System.currentTimeMillis()))
			.setExpiration(new Date(System.currentTimeMillis() + expireTime))
			.signWith(key)
			.compact();
	}
	
	public Boolean validateToken(String token, UserDetails userDetails) {
		final String username = getUsernameFromToken(token);
		return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}
}
