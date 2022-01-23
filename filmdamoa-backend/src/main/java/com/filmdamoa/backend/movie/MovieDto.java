package com.filmdamoa.backend.movie;

import com.filmdamoa.backend.common.TupleState;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MovieDto {
	private Long id;
	private String movieKoreanTitle;
	private String movieEnglishTitle;
	private Boolean screeningState;
	private String posterThumbnail;
	private String synopsis;
	private Short movieRunningTime;
	private MovieRating movieRating;
	private String manufactureCountry;
	private LocalDate movieReleaseDate;
	private TupleState tupleState;
	private Short dailyBoxOffice;
	private String movieNumber;
	private Integer movieLikes; // 좋아요 개수
	private Float audienceScore; // 평점의 평균
	private Boolean movieLike; // 로그인한 유저의 좋아요 여부
	private String movieDirector; // 감독
	private String movieStar; // 배우
	private String movieGenre; // 장르의 유형
	
	@Builder
	private MovieDto(Long id, String movieKoreanTitle, String movieEnglishTitle, Boolean screeningState,
					 String posterThumbnail, String synopsis, Short movieRunningTime, MovieRating movieRating,
					 String manufactureCountry, LocalDate movieReleaseDate, TupleState tupleState, Short dailyBoxOffice,
					 String movieNumber, Integer movieLikes, Float audienceScore, Boolean movieLike,
					 String movieDirector, String movieStar, String movieGenre) {
		this.id = id;
		this.movieKoreanTitle = movieKoreanTitle;
		this.movieEnglishTitle = movieEnglishTitle;
		this.screeningState = screeningState;
		this.posterThumbnail = posterThumbnail;
		this.synopsis = synopsis;
		this.movieRunningTime = movieRunningTime;
		this.movieRating = movieRating;
		this.manufactureCountry = manufactureCountry;
		this.movieReleaseDate = movieReleaseDate;
		this.tupleState = tupleState;
		this.dailyBoxOffice = dailyBoxOffice;
		this.movieNumber = movieNumber;
		this.movieLikes = movieLikes;
		this.audienceScore = audienceScore;
		this.movieLike = movieLike;
		this.movieDirector = movieDirector;
		this.movieStar = movieStar;
		this.movieGenre = movieGenre;
	}
	
	public static enum MappingCondition {
		ALL, EXCEPT_MOVIE_GENRE // Mapping Condition을 구별하는 Enum
	}
}
