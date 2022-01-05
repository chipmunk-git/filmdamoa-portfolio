package com.filmdamoa.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.filmdamoa.backend.auth.JwtUserDetailsService;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {
	@Autowired
	private JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
	
	@Autowired
	private JwtAccessDeniedHandler jwtAccessDeniedHandler;
	
	@Autowired
	private JwtUserDetailsService jwtUserDetailsService;
	
	@Autowired
	private JwtRequestFilter jwtRequestFilter;
	
	// AuthenticationManager에서 JwtUserDetailsService와 BCryptPasswordEncoder를 사용하도록 설정
	@Autowired
	public void configureGlobal(AuthenticationManagerBuilder auth) throws Exception {
		auth.userDetailsService(jwtUserDetailsService).passwordEncoder(passwordEncoder());
	}
	
	// PasswordEncoder의 구현체로 BCryptPasswordEncoder를 지정해준 후, Bean으로 등록
	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	// AuthenticationManager를 외부에서 사용하기 위해, 해당 메소드를 Override 및 Bean으로 등록
	@Bean
	@Override
	public AuthenticationManager authenticationManagerBean() throws Exception {
		return super.authenticationManagerBean();
	}
	
	@Override
	protected void configure(HttpSecurity httpSecurity) throws Exception {
		httpSecurity.cors().and().csrf().disable() // CORS 활성화 및 기본적인 CSRF 보호 기능 비활성화
			.authorizeRequests()
			.antMatchers("/auth/exists/**", "/auth/join", "/auth/login", "/auth/refresh").anonymous() // 해당 경로는 인증되지 않은 사용자만 접근을 허용
			.antMatchers("/**/admin/**").hasRole("ADMIN") // 해당 경로는 ADMIN 역할을 가진 사용자만 접근을 허용
			.antMatchers(HttpMethod.GET, "/movie/**").permitAll() // 해당 경로의 GET 요청은 무조건 접근을 허용
			.antMatchers("/booking/**").permitAll() // 해당 경로는 무조건 접근을 허용
			.anyRequest().authenticated() // 위에서 구성된 패턴을 제외한 나머지 경로는 검증을 수행
			.and()
			.exceptionHandling()
			.authenticationEntryPoint(jwtAuthenticationEntryPoint) // 인증 예외가 발생했을 때, 커스텀 AuthenticationEntryPoint가 동작됨
			.accessDeniedHandler(jwtAccessDeniedHandler) // 인가 예외가 발생했을 때, 커스텀 AccessDeniedHandler가 동작됨
			.and()
			.sessionManagement()
			.sessionCreationPolicy(SessionCreationPolicy.STATELESS) // HttpSession을 생성하지 않고, SecurityContext를 얻기 위해 HttpSession을 사용하지도 않음
			.and()
			.addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class); // JWT 인증을 위해 구현한 필터를 UsernamePasswordAuthenticationFilter 전에 적용
	}
}
