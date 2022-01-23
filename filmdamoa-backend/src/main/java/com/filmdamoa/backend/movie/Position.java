package com.filmdamoa.backend.movie;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum Position {
	// 영화인의 직위를 설정하는 Enum
	DIRECTOR("감독"),
	STAR("배우");
	
	@JsonValue
	private String duty;
	
	private Position(String duty) {
		this.duty = duty;
	}
}
