package com.filmdamoa.backend.error;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {
	private static final long serialVersionUID = -2788236789842297685L;
	
	// ErrorCode.INTERNAL_SERVER_ERROR를 기본값으로 할당
	private ErrorCode errorCode = ErrorCode.INTERNAL_SERVER_ERROR;
	
	// 특정 errorCode 및 그것의 message를 할당하는 생성자
	public BusinessException(ErrorCode errorCode) {
		super(errorCode.getMessage());
		this.errorCode = errorCode;
	}
	
	// 특정 message 및 errorCode를 할당하는 생성자
	public BusinessException(String message, ErrorCode errorCode) {
		super(message);
		this.errorCode = errorCode;
	}
	
	public BusinessException(String message) {
		super(message);
	}
	
	public BusinessException(String message, Throwable cause) {
		super(message, cause);
	}
}
