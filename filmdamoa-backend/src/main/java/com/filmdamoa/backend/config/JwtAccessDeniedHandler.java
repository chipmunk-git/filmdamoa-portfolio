package com.filmdamoa.backend.config;

import java.io.IOException;
import java.io.Serializable;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

@Component
public class JwtAccessDeniedHandler implements AccessDeniedHandler, Serializable {
	private static final long serialVersionUID = 1807679318988305740L;
	
	// 인가 예외가 발생했을 때, 해당 클래스의 handle 메소드가 실행됨
	@Override
	public void handle(HttpServletRequest request,
					   HttpServletResponse response,
					   AccessDeniedException e) throws ServletException, IOException {
		response.sendError(HttpServletResponse.SC_FORBIDDEN, "Forbidden");
	}
}
