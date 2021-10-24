package com.filmdamoa.backend.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.NoArgsConstructor;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AccessToken {
	@JsonProperty("access_token")
	private String token;
	
	@JsonProperty("expired_at")
	private int expiredAt;
	
	private int now;
	
	@Builder
	private AccessToken(String token, int expiredAt, int now) {
		this.token = token;
		this.expiredAt = expiredAt;
		this.now = now;
	}
	
	public String getToken() {
		return this.token;
	}
	
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	public static class AuthData {
		@JsonProperty("imp_key")
		private String apiKey;
		
		@JsonProperty("imp_secret")
		private String apiSecret;
		
		@Builder
		private AuthData(String apiKey, String apiSecret) {
			this.apiKey = apiKey;
			this.apiSecret = apiSecret;
		}
	}
}
