package com.filmdamoa.backend.payment;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class IamportResponse<T> {
	private int code;
	private String message;
	private T response; // 응답에 알맞은 객체 할당
	
	@Builder
	private IamportResponse(int code, String message, T response) {
		this.code = code;
		this.message = message;
		this.response = response;
	}
}
