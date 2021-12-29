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

import com.filmdamoa.backend.common.TupleState;
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
	
	// 아이디 중복 확인을 위한 exists 메소드 실행
	public AuthResponse existsUsername(String username) {
		return exists("username", username);
	}
	
	// 이메일 중복 확인을 위한 exists 메소드 실행
	public AuthResponse existsEmail(String email) {
		return exists("email", email);
	}
	
	private AuthResponse exists(String key, String value) {
		Member member = null;
		
		// key의 값에 따라서 실행되는 메소드가 달라짐. 일치하는 튜플이 없으면 member에 null을 할당
		if (key.equals("email")) {
			member = memberRepository.findByEmail(value).orElse(null);
		} else {
			member = memberRepository.findByUsername(value).orElse(null);
		}
		
		// 아이디 또는 이메일이 중복이라면 exists에 true를 할당
		return AuthResponse.builder().exists(member != null).build();
	}
	
	public AuthResponse join(AuthRequest authRequest) {
		String username = authRequest.getUsername();
		String email = authRequest.getEmail();
		// 아이디 또는 이메일을 조건으로 하여 member 테이블 조회
		List<Member> savedMembers = memberRepository.findByUsernameOrEmail(username, email);
		
		// 'savedMembers.size() == 2'가 참이라면, member 테이블에 아이디와 이메일 둘 다 존재한다는 의미
		if (savedMembers.size() == 2) {
			return AuthResponse.builder().message("이미 존재하는 아이디와 이메일입니다.").exists(true).build();
		} else if (savedMembers.size() == 1) {
			Member savedMember = savedMembers.get(0);
			String savedUsername = savedMember.getUsername();
			String savedEmail = savedMember.getEmail();
			
			// 'savedMembers.size() == 1'이 참이라면, 하위 조건에 따라 할당되는 메시지가 달라짐
			if (username.equals(savedUsername) && email.equals(savedEmail)) {
				return AuthResponse.builder().message("이미 존재하는 아이디와 이메일입니다.").exists(true).build();
			} else if (username.equals(savedUsername)) {
				return AuthResponse.builder().message("이미 존재하는 아이디입니다.").exists(true).build();
			} else {
				return AuthResponse.builder().message("이미 존재하는 이메일입니다.").exists(true).build();
			}
		}
		
		// INSERT 쿼리용 member 객체 생성
		Member member = Member.builder()
				.username(username)
				.password(bcryptPasswordEncoder.encode(authRequest.getPassword())) // bcrypt로 암호화하여 DB에 저장
				.nickname(username)
				.email(email)
				.role("ROLE_MEMBER") // 일반 권한으로 할당
				.tupleState(TupleState.PRIVATE_TUPLE) // 계정의 상태 설정
				.build();
		
		memberRepository.save(member);
		
		// 가입 완료된 아이디를 할당하여 반환
		return AuthResponse.builder().username(member.getUsername()).build();
	}
	
	public AuthResponse login(AuthRequest authRequest, HttpServletResponse response) {
		// authentication 객체 생성 후, userDetails 객체 확보
		Authentication authentication = authenticate(authRequest.getUsername(), authRequest.getPassword());
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		
		// 액세스 토큰 및 리프레시 토큰 생성
		String accessToken = jwtTokenUtil.generateToken(userDetails);
		String refreshToken = jwtTokenUtil.generateRefreshToken(userDetails);
		
		// 액세스 토큰 쿠키 및 리프레시 토큰 쿠키 생성
		Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, accessToken, -1);
		Cookie refreshCookie = cookieUtil.createCookie(JwtTokenUtil.REFRESH_TOKEN_NAME, refreshToken, -1);
		
		// 아이디를 key, 리프레시 토큰을 value, 리프레시 토큰 수명을 duration으로 할당하여 레디스에 저장
		redisUtil.setDataExpire(authRequest.getUsername(), refreshToken,
								JwtTokenUtil.REFRESH_TOKEN_VALIDATION_SECOND);
		
		// 응답 헤더에 두 가지 쿠키를 할당
		response.addCookie(accessCookie);
		response.addCookie(refreshCookie);
		
		// 액세스 토큰과 아이디를 할당하여 반환
		return AuthResponse.builder().accessToken(accessToken).username(authRequest.getUsername()).build();
	}
	
	// 아이디 및 비밀번호가 올바르다면, Authentication 객체 반환. 그렇지 않다면, 상황에 맞는 Exception 반환
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
		// authentication 객체에서 아이디 확보
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		String username = userDetails.getUsername();
		
		try {
			// 레디스에 아이디가 key인 value가 존재한다면, 해당되는 value를 삭제
			if (redisUtil.getData(username) != null) redisUtil.deleteData(username);
		} catch (IllegalArgumentException e) {}
		
		// 기존에 있던 두 가지 쿠키와 이름은 동일하지만 value는 null, duration은 0인 쿠키들을 생성
		// 새로 생성된 쿠키들은 브라우저에 있는 기존의 쿠키들을 덮어쓴 후 사라짐
		Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, null, 0);
		Cookie refreshCookie = cookieUtil.createCookie(JwtTokenUtil.REFRESH_TOKEN_NAME, null, 0);
		
		// 응답 헤더에 두 가지 쿠키를 할당
		response.addCookie(accessCookie);
		response.addCookie(refreshCookie);
	}
	
	// 브라우저에서 새로고침을 했을 때, 로그인한 유저의 정보를 다시 불러오기 위해 사용됨
	public AuthResponse me() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		
		// authentication 객체에서 확보한 아이디를 할당하여 반환
		return AuthResponse.builder().username(userDetails.getUsername()).build();
	}
	
	public AuthResponse refresh(HttpServletRequest request, HttpServletResponse response) {
		Cookie refreshCookie = cookieUtil.getCookie(request, JwtTokenUtil.REFRESH_TOKEN_NAME); // 요청 헤더에서 리프레시 토큰 쿠키 확보
		String refreshToken = refreshCookie.getValue(); // 쿠키에서 리프레시 토큰 확보
		String username = jwtTokenUtil.getUsernameFromToken(refreshToken); // 리프레시 토큰에서 아이디 확보
		String refreshTokenFromRedis = redisUtil.getData(username); // 레디스에 저장되어 있는 리프레시 토큰 확보
		
		// 쿠키의 리프레시 토큰과 레디스의 리프레시 토큰이 동일하다면, 새 액세스 토큰을 할당하여 반환. 그렇지 않다면, Exception 반환
		if (refreshToken.equals(refreshTokenFromRedis)) {
			UserDetails userDetails = jwtUserDetailsService.loadUserByUsername(username);
			String accessToken = jwtTokenUtil.generateToken(userDetails);
			Cookie accessCookie = cookieUtil.createCookie(JwtTokenUtil.ACCESS_TOKEN_NAME, accessToken, -1);
			response.addCookie(accessCookie); // 응답 헤더에 새 액세스 토큰 쿠키를 할당
			
			return AuthResponse.builder().accessToken(accessToken).build();
		} else {
			throw new RuntimeException();
		}
	}
}
