package com.filmdamoa.backend.movie;

import java.util.stream.Stream;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class MovieRatingConverter implements AttributeConverter<MovieRating, String> {
	// 코드 출처: https://www.baeldung.com/jpa-persisting-enums-in-jpa 기반
	@Override
	public String convertToDatabaseColumn(MovieRating movieRating) {
		if (movieRating == null) {
			return null;
		}
		
		return movieRating.getSorting();
	}
	
	@Override
	public MovieRating convertToEntityAttribute(String sorting) {
		if (sorting == null) {
			return null;
		}
		
		return Stream.of(MovieRating.values())
				.filter(m -> m.getSorting().equals(sorting))
				.findFirst()
				.orElseThrow(IllegalArgumentException::new);
	}
}
