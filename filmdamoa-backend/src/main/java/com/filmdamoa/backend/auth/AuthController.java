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
	
	@GetMapping("/exists/username/{username}")
	public ResponseEntity<AuthResponse> existsUsername(@PathVariable("username") String username) {
		return ResponseEntity.ok().body(authService.existsUsername(username));
	}
	
	@GetMapping("/exists/email/{email}")
	public ResponseEntity<AuthResponse> existsEmail(@PathVariable("email") String email) {
		return ResponseEntity.ok().body(authService.existsEmail(email));
	}
	
	@PostMapping("/join")
	public ResponseEntity<AuthResponse> join(@RequestBody @Valid AuthRequest authRequest) {
		AuthResponse authResponse = authService.join(authRequest);
		
		if (authResponse.isExists()) {
			return ResponseEntity.status(HttpStatus.CONFLICT).body(authResponse);
		}
		
		return ResponseEntity.ok().body(authResponse);
	}
	
	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@RequestBody @Validated(AuthRequest.Login.class) AuthRequest authRequest,
											  HttpServletResponse response) {
		return ResponseEntity.ok().body(authService.login(authRequest, response));
	}
	
	@GetMapping("/logout")
	public ResponseEntity<String> logout(HttpServletResponse response) {
		authService.logout(response);
		return ResponseEntity.noContent().build();
	}
	
	@GetMapping("/me")
	public ResponseEntity<AuthResponse> me() {
		return ResponseEntity.ok().body(authService.me());
	}
	
	@GetMapping("/refresh")
	public ResponseEntity<AuthResponse> refresh(HttpServletRequest request, HttpServletResponse response) {
		return ResponseEntity.ok().body(authService.refresh(request, response));
	}
}
