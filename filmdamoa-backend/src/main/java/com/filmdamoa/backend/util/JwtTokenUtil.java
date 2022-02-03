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
	
	public static final long TOKEN_VALIDATION_SECOND = 3600L; // 1시간
	public static final long REFRESH_TOKEN_VALIDATION_SECOND = 3600L * 24 * 14; // 2주
	
	public static final String ACCESS_TOKEN_NAME = "accessToken";
	public static final String REFRESH_TOKEN_NAME = "refreshToken";
	
	@Value("${spring.jwt.secret}")
	private String secret;
	
	private SecretKey key;
	
	// 의존성 주입(Dependency Injection)이 이루어진 후 디코딩된 secret을 이용하여 SecretKey 객체 생성
	@PostConstruct
	private void init() {
		key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(secret));
	}
	
	// token의 Claims 객체에서 아이디(subject) 확보
	public String getUsernameFromToken(String token) {
		return getClaimFromToken(token, Claims::getSubject);
	}
	
	// token의 Claims 객체에서 만료 일시 확보
	public Date getExpirationDateFromToken(String token) {
		return getClaimFromToken(token, Claims::getExpiration);
	}
	
	// token에서 Claims 객체 확보 후 적절한 메소드 실행
	private <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
		Claims claims = getAllClaimsFromToken(token);
		return claimsResolver.apply(claims);
	}
	
	// 생성된 JwtParser 객체를 이용하여 token에서 Claims 객체 확보
	private Claims getAllClaimsFromToken(String token) {
		return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
	}
	
	// Claims 객체에 담긴 아이디(subject) 및 계정 권한 List를 parseInfo Map에 저장
	public Map<String, Object> getUserParseInfo(String token) {
		Claims claims = getAllClaimsFromToken(token);
		Map<String, Object> parseInfo = new HashMap<>();
		parseInfo.put("username", claims.getSubject());
		parseInfo.put("role", claims.get("role", List.class));
		
		return parseInfo;
	}
	
	// token의 만료 일시가 현재보다 이전이라면(즉, token이 만료되었다면) true를 반환
	private Boolean isTokenExpired(String token) {
		Date expiration = getExpirationDateFromToken(token);
		return expiration.before(new Date());
	}
	
	// claims Map, 아이디, TOKEN_VALIDATION_SECOND를 이용하여 doGenerateToken 메소드 실행
	public String generateToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		List<String> roles = new ArrayList<>();
		
		for (GrantedAuthority auth : userDetails.getAuthorities()) {
			roles.add(auth.getAuthority());
		}
		claims.put("role", roles); // 계정 권한이 담긴 roles List를 claims Map에 저장
		
		return doGenerateToken(claims, userDetails.getUsername(), TOKEN_VALIDATION_SECOND * 1000);
	}
	
	// claims Map, 아이디, REFRESH_TOKEN_VALIDATION_SECOND를 이용하여 doGenerateToken 메소드 실행
	public String generateRefreshToken(UserDetails userDetails) {
		Map<String, Object> claims = new HashMap<>();
		return doGenerateToken(claims, userDetails.getUsername(), REFRESH_TOKEN_VALIDATION_SECOND * 1000);
	}
	
	// sub, iat, exp 및 기타 클레임을 가졌고 SecretKey 객체로 서명된 JWT 생성
	private String doGenerateToken(Map<String, Object> claims, String subject, long expireTime) {
		return Jwts.builder()
			.setClaims(claims)
			.setSubject(subject)
			.setIssuedAt(new Date(System.currentTimeMillis()))
			.setExpiration(new Date(System.currentTimeMillis() + expireTime))
			.signWith(key)
			.compact();
	}
	
	// token의 아이디와 userDetails 객체의 아이디가 일치하고, token이 만료되지 않았다면 true를 반환
	public Boolean validateToken(String token, UserDetails userDetails) {
		String username = getUsernameFromToken(token);
		return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
	}
}
