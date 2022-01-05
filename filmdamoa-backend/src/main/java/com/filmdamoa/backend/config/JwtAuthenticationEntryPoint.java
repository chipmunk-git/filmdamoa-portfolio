package com.filmdamoa.backend.config;

import java.io.IOException;
import java.io.Serializable;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint, Serializable {
	private static final long serialVersionUID = -4054553992840948785L;
	
	// 인증 예외가 발생했을 때, 해당 클래스의 commence 메소드가 실행됨
	@Override
	public void commence(HttpServletRequest request,
						 HttpServletResponse response,
						 AuthenticationException e) throws ServletException, IOException {
		response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
	}
}
