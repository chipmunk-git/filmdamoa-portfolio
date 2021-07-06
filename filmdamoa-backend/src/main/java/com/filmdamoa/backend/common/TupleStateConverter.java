package com.filmdamoa.backend.common;

import java.util.stream.Stream;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class TupleStateConverter implements AttributeConverter<TupleState, String> {
	// 코드 출처: https://www.baeldung.com/jpa-persisting-enums-in-jpa 기반
	@Override
	public String convertToDatabaseColumn(TupleState tupleState) {
		if (tupleState == null) {
			return null;
		}
		
		return tupleState.getState();
	}
	
	@Override
	public TupleState convertToEntityAttribute(String state) {
		if (state == null) {
			return null;
		}
		
		return Stream.of(TupleState.values())
				.filter(t -> t.getState().equals(state))
				.findFirst()
				.orElseThrow(IllegalArgumentException::new);
	}
}
