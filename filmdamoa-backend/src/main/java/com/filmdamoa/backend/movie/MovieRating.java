package com.filmdamoa.backend.movie;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum MovieRating {
	ALL_AUDIENCE("전체관람가"),
	TWELVE_AUDIENCE("12세 이상 관람가"),
	FIFTEEN_AUDIENCE("15세 이상 관람가"),
	EIGHTEEN_AUDIENCE("청소년 관람불가"),
	LIMITED_AUDIENCE("제한상영가");
	
	@JsonValue
	private String sorting;
	
	private MovieRating(String sorting) {
		this.sorting = sorting;
	}
}
