package com.filmdamoa.backend.auth;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "${spring.cors.origins}", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/auth")
public class AuthController {
	@Autowired
	private AuthService authService;
	
	// 아이디 중복 확인
	@GetMapping("/exists/username/{username}")
	public ResponseEntity<AuthResponse> existsUsername(@PathVariable("username") String username) {
		return ResponseEntity.ok().body(authService.existsUsername(username));
	}
	
	// 이메일 중복 확인
	@GetMapping("/exists/email/{email}")
	public ResponseEntity<AuthResponse> existsEmail(@PathVariable("email") String email) {
		return ResponseEntity.ok().body(authService.existsEmail(email));
	}
	
	// 회원가입. @Valid를 통해 아이디, 비밀번호, 이메일 입력 값 유효성 검증
	@PostMapping("/join")
	public ResponseEntity<AuthResponse> join(@RequestBody @Valid AuthRequest authRequest) {
		AuthResponse authResponse = authService.join(authRequest);
		
		// DB에 아이디 혹은 이메일이 이미 존재하면, 409 Conflict 상태 코드와 함께 authResponse 응답 본문 반환
		if (authResponse.isExists()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(authResponse);
		}
		
		return ResponseEntity.ok().body(authResponse);
	}
	
	// 로그인. @Validated를 통해 아이디, 비밀번호 입력 값 유효성 검증
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody @Validated(AuthRequest.Login.class) AuthRequest authRequest,
											  HttpServletResponse response) {
		return ResponseEntity.ok().body(authService.login(authRequest, response));
	}
	
	// 로그아웃
	@GetMapping("/logout")
	public ResponseEntity<String> logout(HttpServletResponse response) {
		authService.logout(response);
		return ResponseEntity.noContent().build();
	}
	
	// 로그인 상태 유지
	@GetMapping("/me")
	public ResponseEntity<AuthResponse> me() {
		return ResponseEntity.ok().body(authService.me());
	}
	
	// 액세스 토큰 재발급
	@GetMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
		return ResponseEntity.ok().body(authService.refresh(request, response));
	}
}
