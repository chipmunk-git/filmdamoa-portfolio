package com.filmdamoa.backend.error;

import java.nio.file.AccessDeniedException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BindException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class GlobalExceptionHandler {
	private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);
	
	/**
	 * 코드 출처: https://cheese10yun.github.io/spring-guide-exception/ 기반
	 * javax.validation.Valid 또는 @Validated를 사용한 파라미터에서 Binding Error가 일어날 시 발생
	 * HttpMessageConverters에 등록된 Converter로 Binding을 못 할 경우에 발생
	 * 주로 @RequestBody, @RequestPart를 사용한 파라미터에서 발생
	 */
	@ExceptionHandler(MethodArgumentNotValidException.class)
	protected ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(MethodArgumentNotValidException e) {
		logger.error("handleMethodArgumentNotValidException", e);
		final ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT_VALUE, e.getBindingResult());
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	/**
	 * @ModelAttribute를 사용한 곳에서 Binding Error가 일어날 시 발생
	 * ref https://docs.spring.io/spring/docs/current/spring-framework-reference/web.html#mvc-ann-modelattrib-method-args
	 */
	@ExceptionHandler(BindException.class)
	protected ResponseEntity<ErrorResponse> handleBindException(BindException e) {
		logger.error("handleBindException", e);
		final ErrorResponse response = ErrorResponse.of(ErrorCode.INVALID_INPUT_VALUE, e.getBindingResult());
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	/**
	 * Enum Type이 일치하지 않아 Binding을 못 할 경우에 발생
	 * 주로 @RequestParam을 사용한 파라미터에서 Enum으로 Binding을 못 했을 경우에 발생
	 */
	@ExceptionHandler(MethodArgumentTypeMismatchException.class)
	protected ResponseEntity<ErrorResponse> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e) {
		logger.error("handleMethodArgumentTypeMismatchException", e);
		final ErrorResponse response = ErrorResponse.of(e);
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	/**
	 * 지원하지 않는 HTTP Method를 호출할 경우에 발생
	 */
	@ExceptionHandler(HttpRequestMethodNotSupportedException.class)
	protected ResponseEntity<ErrorResponse> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException e) {
		logger.error("handleHttpRequestMethodNotSupportedException", e);
		final ErrorResponse response = ErrorResponse.of(ErrorCode.METHOD_NOT_ALLOWED);
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	/**
	 * Authentication 객체가 필요한 권한을 보유하지 않은 경우에 발생
	 */
	@ExceptionHandler(AccessDeniedException.class)
	protected ResponseEntity<ErrorResponse> handleAccessDeniedException(AccessDeniedException e) {
		logger.error("handleAccessDeniedException", e);
		final ErrorResponse response = ErrorResponse.of(ErrorCode.HANDLE_ACCESS_DENIED);
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	// 아이디 또는 비밀번호가 맞지 않을 때 발생하는 예외를 처리
	@ExceptionHandler(BadCredentialsException.class)
	protected ResponseEntity<ErrorResponse> handleBadCredentialsException(BadCredentialsException e) {
		logger.error("handleBadCredentialsException", e);
		final ErrorResponse response = ErrorResponse.of(ErrorCode.HANDLE_ACCESS_DENIED, e.getMessage());
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	// 비즈니스 로직에서 오류가 일어났을 때 발생하는 예외를 처리
	@ExceptionHandler(BusinessException.class)
	protected ResponseEntity<ErrorResponse> handleBusinessException(BusinessException e) {
		logger.error("handleBusinessException", e);
		final ErrorResponse response = ErrorResponse.of(e.getErrorCode(), e.getMessage());
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
	
	// 위에서 다루지 않은 모든 예외를 처리
	@ExceptionHandler(Exception.class)
	protected ResponseEntity<ErrorResponse> handleException(Exception e) {
		logger.error("handleException", e);
		final ErrorResponse response = ErrorResponse.of(ErrorCode.INTERNAL_SERVER_ERROR);
		
		return ResponseEntity.status(response.getStatus()).body(response);
	}
}
