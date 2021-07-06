package com.filmdamoa.backend.movie;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum Position {
	DIRECTOR("감독"),
	STAR("배우");
	
	@JsonValue
	private String duty;
	
	private Position(String duty) {
		this.duty = duty;
	}
}
