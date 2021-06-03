package com.filmdamoa.backend.auth;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
	@Autowired
	private MemberRepository memberRepository;
	
	@Autowired
	private PasswordEncoder bcryptPasswordEncoder;
	
	public AuthResponse existsUsername(String username) {
		return exists("username", username);
	}
	
	public AuthResponse existsEmail(String email) {
		return exists("email", email);
	}
	
	private AuthResponse exists(String key, String value) {
		Member member = null;
		
		if (key.equals("email")) {
			member = memberRepository.findByEmail(value).orElse(null);
		} else {
			member = memberRepository.findByUsername(value).orElse(null);
		}
		
		return AuthResponse.builder().exists(member != null).build();
	}
	
	public AuthResponse join(AuthRequest authRequest) {
		String username = authRequest.getUsername();
		String email = authRequest.getEmail();
		List<Member> savedMembers = memberRepository.findByUsernameOrEmail(username, email);
		
		if (savedMembers.size() == 2) {
			return AuthResponse.builder().message("이미 존재하는 아이디와 이메일입니다.").exists(true).build();
		} else if (savedMembers.size() == 1) {
			Member savedMember = savedMembers.get(0);
			String savedUsername = savedMember.getUsername();
			String savedEmail = savedMember.getEmail();
			
			if (username.equals(savedUsername) && email.equals(savedEmail)) {
				return AuthResponse.builder().message("이미 존재하는 아이디와 이메일입니다.").exists(true).build();
			} else if (username.equals(savedUsername)) {
				return AuthResponse.builder().message("이미 존재하는 아이디입니다.").exists(true).build();
			} else {
				return AuthResponse.builder().message("이미 존재하는 이메일입니다.").exists(true).build();
			}
		}
		
		Member member = Member.builder()
				.username(username)
				.password(bcryptPasswordEncoder.encode(authRequest.getPassword()))
				.nickname(username)
				.email(email)
				.role("ROLE_MEMBER")
				.build();
		
		memberRepository.save(member);
		
		return AuthResponse.builder().username(member.getUsername()).build();
	}
}
