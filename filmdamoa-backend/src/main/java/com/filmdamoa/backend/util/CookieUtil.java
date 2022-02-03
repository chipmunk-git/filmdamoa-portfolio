package com.filmdamoa.backend.util;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
public class CookieUtil {
	// 코드 출처: https://github.com/ehdrms2034/SpringBootWithJava/blob/master/Spring_React_Login/backend/src/src/main/java/com/donggeun/springSecurity/service/CookieUtil.java 기반
	// 특정 name, value, isHttpOnly, expiry 및 uri를 가진 쿠키 생성
	public Cookie createCookie(String cookieName, String value, long duration) {
		Cookie cookie = new Cookie(cookieName, value);
		cookie.setHttpOnly(true);
		cookie.setMaxAge((int)duration);
		cookie.setPath("/");
		
		return cookie;
	}
	
	// 요청 헤더에서 특정 name을 가진 쿠키 확보
	public Cookie getCookie(HttpServletRequest req, String cookieName) {
		Cookie[] cookies = req.getCookies();
		if (cookies == null) return null;
		
		for (Cookie cookie : cookies) {
			if (cookie.getName().equals(cookieName)) return cookie;
		}
		
		return null;
	}
}
