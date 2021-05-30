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
	private boolean exists;
	private String accessToken;
	private String username;
	
	@Builder
	private AuthResponse(String message, boolean exists, String accessToken, String username) {
		this.message = message;
		this.exists = exists;
		this.accessToken = accessToken;
		this.username = username;
	}
}
