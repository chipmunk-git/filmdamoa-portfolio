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
		final String requestTokenHeader = request.getHeader("Authorization");
		
		logger.info("tokenHeader: " + requestTokenHeader);
		String username = null;
		String jwtToken = null;
		
		if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
			jwtToken = requestTokenHeader.substring(7);
			logger.info("token in requestfilter: " + jwtToken);
			
			try {
				username = jwtTokenUtil.getUsernameFromToken(jwtToken);
			} catch (IllegalArgumentException e) {
				logger.warn("Unable to get JWT Token");
			} catch (ExpiredJwtException e) {
				logger.warn("JWT Token has expired");
			}
		} else {
			logger.warn("JWT Token does not begin with Bearer String");
		}
		
		if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
			UserDetails userDetails = getUserDetails(jwtToken);
			
			if (jwtTokenUtil.validateToken(jwtToken, userDetails)) {
				UsernamePasswordAuthenticationToken usernamePasswordAuthenticationToken =
					new UsernamePasswordAuthenticationToken(
						userDetails,
						null,
						userDetails.getAuthorities());
				
				usernamePasswordAuthenticationToken.setDetails(
					new WebAuthenticationDetailsSource().buildDetails(request));
				
				SecurityContextHolder.getContext().setAuthentication(usernamePasswordAuthenticationToken);
			}
		}
		
		chain.doFilter(request, response);
	}
	
	// 코드 출처: https://github.com/tlatldms/boot-security-jwt/blob/master/src/main/java/com/example/auth/jwt/JwtRequestFilter.java 기반
	private UserDetails getUserDetails(String token) {
		Map<String, Object> parseInfo = jwtTokenUtil.getUserParseInfo(token);
		logger.info("parseInfo: " + parseInfo);
		List<?> roles = (List<?>)parseInfo.get("role");
		Collection<GrantedAuthority> grantedAuthorities = new ArrayList<>();
		
		for (Object role : roles) {
			grantedAuthorities.add(new SimpleGrantedAuthority((String)role));
		}
		
		UserDetails userDetails = User.builder().username(String.valueOf(parseInfo.get("username")))
			.authorities(grantedAuthorities).password("asd").build();
		
		return userDetails;
	}
}
