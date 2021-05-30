package com.filmdamoa.backend.util;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Service;

@Service
public class CookieUtil {
	public Cookie createCookie(String cookieName, String value, long duration) {
		Cookie cookie = new Cookie(cookieName, value);
		cookie.setHttpOnly(true);
		cookie.setMaxAge((int)duration);
		cookie.setPath("/");
		
		return cookie;
	}
	
	public Cookie getCookie(HttpServletRequest req, String cookieName) {
		final Cookie[] cookies = req.getCookies();
		if (cookies == null) return null;
		
		for (Cookie cookie : cookies) {
			if (cookie.getName().equals(cookieName))
				return cookie;
		}
		
		return null;
	}
}
