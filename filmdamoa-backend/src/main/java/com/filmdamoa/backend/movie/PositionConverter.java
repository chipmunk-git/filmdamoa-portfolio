package com.filmdamoa.backend.movie;

import java.util.stream.Stream;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class PositionConverter implements AttributeConverter<Position, String> {
	// 코드 출처: https://www.baeldung.com/jpa-persisting-enums-in-jpa 기반
	// position의 duty 값을 DB Column에 적용
	@Override
	public String convertToDatabaseColumn(Position position) {
		if (position == null) {
			return null;
		}
		
		return position.getDuty();
	}
	
	// duty 값에 알맞은 position을 Entity Attribute에 적용
	@Override
	public Position convertToEntityAttribute(String duty) {
		if (duty == null) {
			return null;
		}
		
		return Stream.of(Position.values())
				.filter(p -> p.getDuty().equals(duty))
				.findFirst()
				.orElseThrow(IllegalArgumentException::new);
	}
}
