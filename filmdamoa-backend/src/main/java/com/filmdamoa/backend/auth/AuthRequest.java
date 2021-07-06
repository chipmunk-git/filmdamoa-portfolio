package com.filmdamoa.backend.auth;

import java.io.Serializable;

import javax.validation.constraints.Email;
import javax.validation.constraints.Pattern;
import javax.validation.groups.Default;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuthRequest implements Serializable {
	private static final long serialVersionUID = 8553434066927825097L;
	
	@Pattern(regexp = "^([a-z0-9]){4,30}$",
			 message = "아이디는 4~30자의 영문 소문자 및 숫자로 이뤄져야 합니다.",
			 groups = {Default.class, Login.class})
	private String username;
	
	@Pattern(regexp = "^(?=.*[a-z])(?=.*[0-9])(?=.*[\\!#-%\\(-\\.:;\\=\\?@\\[-`\\{-~])[a-z0-9\\!#-%\\(-\\.:;\\=\\?@\\[-`\\{-~]{8,}$",
			 message = "비밀번호는 8자 이상의 영문 소문자, 숫자, 특수문자로 이뤄져야 합니다.",
			 groups = {Default.class, Login.class})
	private String password;
	
	@Email(message = "잘못된 이메일 형식입니다.")
	private String email;
	
	@Builder
	private AuthRequest(String username, String password, String email) {
		this.username = username;
		this.password = password;
		this.email = email;
	}
	
	public static interface Login {}
}
