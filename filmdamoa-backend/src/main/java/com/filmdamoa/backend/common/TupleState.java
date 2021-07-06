package com.filmdamoa.backend.common;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum TupleState {
	PUBLIC_TUPLE("공개"),
	PRIVATE_TUPLE("비공개"),
	DELETED_TUPLE("삭제됨"),
	BANNED_TUPLE("금지됨");
	
	@JsonValue
	private String state;
	
	private TupleState(String state) {
		this.state = state;
	}
}
