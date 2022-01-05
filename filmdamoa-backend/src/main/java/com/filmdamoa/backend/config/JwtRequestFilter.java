package com.filmdamoa.backend.config;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.filmdamoa.backend.util.JwtTokenUtil;

import io.jsonwebtoken.ExpiredJwtException;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {
	private static final Logger logger = LoggerFactory.getLogger(JwtRequestFilter.class);
	
	@Autowired
	private JwtTokenUtil jwtTokenUtil;
	
	@Override
	protected void doFilterInternal(HttpServletRequest request,
									HttpServletResponse response,
									FilterChain chain) throws ServletException, IOException {
		logger.info("REQUEST : " + request.getHeader("Authorization"));
		// 요청 헤더에서 Authorization 값 확보
		final String requestTokenHeader = request.getHeader("Authorization");
		
		logger.info("tokenHeader: " + requestTokenHeader);
		String username = null;
		String jwtToken = null;
		
		// Authorization 값이 존재하고, 그 값이 'Bearer '로 시작하는지 판단
		if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
			// Authorization 값의 앞에서부터 7글자('Bearer ')를 제거하여 액세스 토큰 확보
			jwtToken = requestTokenHeader.substring(7);
			logger.info("token in requestfilter: " + jwtToken);
			
			try {
				// 액세스 토큰에서 아이디 확보
				username = jwtTokenUtil.getUsernameFromToken(jwtToken);
			} catch (IllegalArgumentException e) {
				logger.warn("Unable to get JWT Token");
				// 액세스 토큰이 적합하지 않은 경우, 해당되는 Exception 반환
				throw e;
			} catch (ExpiredJwtException e) {
				logger.warn("JWT Token has expired");
				// 액세스 토큰이 만료되었을 경우, 해당되는 Exception 반환
				throw e;
			}
		} else {
			logger.warn("JWT Token does not begin with Bearer String");
		}
		
		// 아이디가 존재하고, 현재 SecurityContext에 Authentication 객체가 없는지 판단
		if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = getUserDetails(jwtToken);
			
			if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
				// 유효한 액세스 토큰이라면, userDetails를 이용하여 usernamePasswordAuthenticationToken 객체 생성
				UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
					new UsernamePasswordAuthenticationToken(
						userDetails,
						null,
						userDetails.getAuthorities());
				
				// usernamePasswordAuthenticationToken에 details 설정
				usernamePasswordAuthenticationToken.setDetails(
					new WebAuthenticationDetailsSource().buildDetails(request));
				
				// SecurityContext에 authentication 설정
				SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
			}
		}
		
		// chain의 doFilter 메소드를 통해 request 및 response 전달
		chain.doFilter(request, response);
	}
	
	// 코드 출처: https://github.com/tlatldms/boot-security-jwt/blob/master/src/main/java/com/example/auth/jwt/JwtRequestFilter.java 기반
	// 매 요청마다 DB에 접근하지 않기 위해, 액세스 토큰의 Claims 객체 파싱 정보만 이용하여 UserDetails 객체 생성
	private UserDetails getUserDetails(String token) {
		Map<String, Object> parseInfo = jwtTokenUtil.getUserParseInfo(token); // 액세스 토큰에서 아이디 및 권한이 담긴 parseInfo Map 확보
		logger.info("parseInfo: " + parseInfo);
		List<?> roles = (List<?>)parseInfo.get("role"); // parseInfo Map에서 권한이 담긴 roles List 확보
		Collection<GrantedAuthority> grantedAuthorities = new ArrayList<>();
		
		// roles List의 항목에 알맞은 SimpleGrantedAuthority 객체를 생성한 후 grantedAuthorities Collection에 저장
		for (Object role : roles) {
			grantedAuthorities.add(new SimpleGrantedAuthority((String)role));
		}
		
		// 아이디, grantedAuthorities, 임의의 비밀번호를 가진 userDetails 객체 생성
		UserDetails userDetails = User.builder().username(String.valueOf(parseInfo.get("username")))
			.authorities(grantedAuthorities).password("asd").build();
		
		return userDetails;
	}
}
