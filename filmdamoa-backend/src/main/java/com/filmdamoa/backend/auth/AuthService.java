package com.filmdamoa.backend.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
	@Autowired
	private MemberRepository memberRepository;
	
	public AuthResponse existsUsername(String username) {
		return exists("username", username);
	}
	
	public AuthResponse existsEmail(String email) {
		return exists("email", email);
	}
	
	private AuthResponse exists(String key, String value) {
		Member member = null;
		
		try {
			if (key.equals("email")) {
				member = memberRepository.findByEmail(value).orElse(null);
			} else {
				member = memberRepository.findByUsername(value).orElse(null);
			}
		} catch (Exception e) {
			throw e;
		}
		
		return AuthResponse.builder().exists(member != null).build();
	}
}
