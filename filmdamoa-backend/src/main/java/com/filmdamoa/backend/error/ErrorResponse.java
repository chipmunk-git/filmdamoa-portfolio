package com.filmdamoa.backend.error;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.validation.BindingResult;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ErrorResponse {
	private String message;
	private HttpStatus status;
	private String code; // 프로젝트 내 고유 에러 코드
	private List<FieldError> errors;
	
	private ErrorResponse(final ErrorCode code) {
		this.message = code.getMessage();
		this.status = code.getStatus();
		this.code = code.getCode();
		this.errors = new ArrayList<>();
	}
	
	private ErrorResponse(final ErrorCode code, final String message) {
		this.message = message;
		this.status = code.getStatus();
		this.code = code.getCode();
		this.errors = new ArrayList<>();
	}
	
	private ErrorResponse(final ErrorCode code, final List<FieldError> errors) {
		this.message = code.getMessage();
		this.status = code.getStatus();
		this.code = code.getCode();
		this.errors = errors;
	}
	
	public static ErrorResponse of(final ErrorCode code) {
		return new ErrorResponse(code);
	}
	
	public static ErrorResponse of(final ErrorCode code, final String message) {
		return new ErrorResponse(code, message);
	}
	
	public static ErrorResponse of(final ErrorCode code, final List<FieldError> errors) {
		return new ErrorResponse(code, errors);
	}
	
	public static ErrorResponse of(final ErrorCode code, final BindingResult bindingResult) {
		return new ErrorResponse(code, FieldError.of(bindingResult));
	}
	
	public static ErrorResponse of(MethodArgumentTypeMismatchException e) {
		final String value = e.getValue() == null ? "" : e.getValue().toString();
		// MethodArgumentTypeMismatchException 객체를 이용하여 FieldError List 생성
		final List<ErrorResponse.FieldError> errors = ErrorResponse.FieldError.of(e.getName(), value, e.getErrorCode());
		
		return new ErrorResponse(ErrorCode.INVALID_TYPE_VALUE, errors);
	}
	
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	public static class FieldError {
		private String field; // 필드 이름
		private String value; // 에러에 관여된 값
		private String reason; // 에러에 대한 이유
		
		private FieldError(final String field, final String value, final String reason) {
			this.field = field;
			this.value = value;
			this.reason = reason;
		}
		
		public static List<FieldError> of(final String field, final String value, final String reason) {
			List<FieldError> fieldErrors = new ArrayList<>();
			fieldErrors.add(new FieldError(field, value, reason));
			
			return fieldErrors;
		}
		
		private static List<FieldError> of(final BindingResult bindingResult) {
			final List<org.springframework.validation.FieldError> fieldErrors = bindingResult.getFieldErrors();
			
			// bindingResult를 이용하여 FieldError List 생성
			return fieldErrors.stream()
				.map(error -> new FieldError(
					error.getField(),
					error.getRejectedValue() == null ? "" : error.getRejectedValue().toString(),
					error.getDefaultMessage()))
				.collect(Collectors.toList());
		}
	}
}
