package com.filmdamoa.backend.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
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
}
