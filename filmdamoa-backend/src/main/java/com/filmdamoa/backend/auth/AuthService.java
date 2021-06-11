package com.filmdamoa.backend.auth;

import java.util.List;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
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
	
	@Autowired
	private JwtUserDetailsService jwtUserDetailsService;
	
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
	
	public AuthResponse login(AuthRequest authRequest, HttpServletResponse response) {
		Authentication authentication = authenticate(authRequest.getUsername(), authRequest.getPassword());
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		
		String accessToken = jwtTokenUtil.generateToken(userDetails);
		String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
		
		Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, accessToken, -1);
		Cookie refreshCookie = cookieUtil.createCookie(JwtTokenUtil.REFRESH_TOKEN_NAME, refreshToken, -1);
		
		redisUtil.setDataExpire(authRequest.getUsername(), refreshToken,
								JwtTokenUtil.REFRESH_TOKEN_VALIDATION_SECOND);
		
		response.addCookie(accessCookie);
		response.addCookie(refreshCookie);
		
		return AuthResponse.builder().accessToken(accessToken).username(authRequest.getUsername()).build();
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
	
	public void logout(HttpServletResponse response) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		String username = userDetails.getUsername();
		
		try {
			if (redisUtil.getData(username) != null) redisUtil.deleteData(username);
		} catch (IllegalArgumentException e) {}
		
		Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, null, 0);
		Cookie refreshCookie = cookieUtil.createCookie(JwtTokenUtil.REFRESH_TOKEN_NAME, null, 0);
		
		response.addCookie(accessCookie);
		response.addCookie(refreshCookie);
	}
	
	public AuthResponse me() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		
		return AuthResponse.builder().username(userDetails.getUsername()).build();
	}
	
	public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
		Cookie refreshCookie = cookieUtil.getCookie(request, JwtTokenUtil.REFRESH_TOKEN_NAME);
		String refreshToken = refreshCookie.getValue();
		String username = jwtTokenUtil.getUsernameFromToken(refreshToken);
		String refreshTokenFromRedis = redisUtil.getData(username);
		
		if (refreshToken.equals(refreshTokenFromRedis)) {
			UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(username);
			String accessToken = jwtTokenUtil.generateToken(userDetails);
			Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, accessToken, -1);
			response.addCookie(accessCookie);
			
			return AuthResponse.builder().accessToken(accessToken).build();
		} else {
			throw new RuntimeException();
		}
	}
}
