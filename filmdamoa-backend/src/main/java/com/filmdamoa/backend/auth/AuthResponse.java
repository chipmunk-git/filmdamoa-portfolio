package com.filmdamoa.backend.auth;

import java.io.Serializable;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthResponse implements Serializable {
	private static final long serialVersionUID = -9058131724650013604L;
	
	private String message;
	private boolean exists; // 아이디 또는 이메일이 중복된다면 true가 할당됨
	private String accessToken; // 쿠키와 별개로 DTO에도 액세스 토큰 할당
	private String username;
	
	@Builder
	private AuthResponse(String message, boolean exists, String accessToken, String username) {
		this.message = message;
		this.exists = exists;
		this.accessToken = accessToken;
		this.username = username;
	}
}
