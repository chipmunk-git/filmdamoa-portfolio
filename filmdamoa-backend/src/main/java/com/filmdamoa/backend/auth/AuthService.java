package com.filmdamoa.backend.auth;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.Cookie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.filmdamoa.backend.util.CookieUtil;
import com.filmdamoa.backend.util.JwtTokenUtil;
import com.filmdamoa.backend.util.RedisUtil;

@Service
public class AuthService {
	@Autowired
	private MemberRepository memberRepository;
	
	@Autowired
	private PasswordEncoder bcryptPasswordEncoder;
	
	@Autowired
	private AuthenticationManager authenticationManager;
	
	@Autowired
	private JwtTokenUtil jwtTokenUtil;
	
	@Autowired
	private CookieUtil cookieUtil;
	
	@Autowired
	private RedisUtil redisUtil;
	
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
	
	public Map<String, Object> login(AuthRequest authRequest) {
		Authentication authentication = authenticate(authRequest.getUsername(), authRequest.getPassword());
		final UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		
		final String accessToken = jwtTokenUtil.generateToken(userDetails);
		final String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
		
		Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, accessToken, -1);
		Cookie refreshCookie = cookieUtil.createCookie(JwtTokenUtil.REFRESH_TOKEN_NAME, refreshToken, -1);
		
		redisUtil.setDataExpire(authRequest.getUsername(), refreshToken,
								JwtTokenUtil.REFRESH_TOKEN_VALIDATION_SECOND);
		
		Map<String, Object> map = new HashMap<>();
		map.put("accessToken", accessToken);
		map.put("accessCookie", accessCookie);
		map.put("refreshCookie", refreshCookie);
		
		return map;
	}
	
	private Authentication authenticate(String username, String password) {
		try {
			return authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
		} catch (DisabledException e) {
			throw new DisabledException("계정이 비활성화 상태입니다.", e);
		} catch (BadCredentialsException e) {
			throw new BadCredentialsException("아이디 또는 비밀번호가 맞지 않습니다.", e);
		}
	}
}
