package com.filmdamoa.backend.auth;

import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class JwtUserDetailsService implements UserDetailsService {
	@Autowired
	private MemberRepository memberRepository;
	
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		// 아이디를 조건으로 하여 member 테이블 조회. 일치하는 튜플이 없으면 Exception 반환
		Member member = memberRepository.findByUsername(username)
				.orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + username));
		
		Set<GrantedAuthority> grantedAuthorities = new HashSet<>();
		
		// member 객체의 권한에 알맞은 SimpleGrantedAuthority 객체를 생성한 후 grantedAuthorities Set에 저장
		if ((member.getRole()).equals("ROLE_ADMIN")) {
			grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));
		} else {
			grantedAuthorities.add(new SimpleGrantedAuthority("ROLE_MEMBER"));
		}
		
		// 아이디, 비밀번호, grantedAuthorities를 가진 UserDetails 객체 반환
		return new User(member.getUsername(), member.getPassword(), grantedAuthorities);
	}
}
