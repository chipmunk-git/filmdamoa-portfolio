package com.filmdamoa.backend.movie;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.OneToMany;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;

import com.filmdamoa.backend.common.TupleState;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Movie {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(unique = true, nullable = false)
	private String movieKoreanTitle;
	
	@Column(unique = true)
	private String movieEnglishTitle;
	
	@Column(nullable = false)
	private Boolean screeningState; // 상영 여부
	
	@Column(unique = true, nullable = false)
	private String posterThumbnail; // 포스터 이미지 경로
	
	@Column(nullable = false)
	private String synopsis;
	
	@Column(nullable = false)
	private Short movieRunningTime;
	
	@Column(nullable = false)
	private MovieRating movieRating;
	
	@Column(nullable = false)
	private String manufactureCountry;
	
	@Column(nullable = false)
	private LocalDate movieReleaseDate;
	
	@Column(nullable = false)
	private TupleState tupleState;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE", updatable = false)
	@CreationTimestamp
	private OffsetDateTime createDateTime;
	
	@Column(unique = true)
	private Short dailyBoxOffice; // 박스오피스 순위
	
	@Column(unique = true, nullable = false)
	private String movieNumber; // 영화 고유 번호
	
	@Formula("(select count(mm.movie_like) from movie_member mm where mm.movie_like = true and mm.movie_id = id)")
	private Integer countOfMovieLikes; // 좋아요 개수
	
	@Formula("(select avg(mm.audience_score) from movie_member mm where mm.movie_id = id)")
	private Float avgOfAudienceScore; // 평점의 평균
	
	@OneToMany(mappedBy = "movie")
	private List<MoviePerson> moviePersons = new ArrayList<>();
	
	@OneToMany(mappedBy = "movie")
	private List<MovieGenre> movieGenres = new ArrayList<>();
	
	@Builder
	private Movie(Long id, String movieKoreanTitle, String movieEnglishTitle, Boolean screeningState,
				  String posterThumbnail, String synopsis, Short movieRunningTime, MovieRating movieRating,
				  String manufactureCountry, LocalDate movieReleaseDate, TupleState tupleState, OffsetDateTime createDateTime,
				  Short dailyBoxOffice, String movieNumber, Integer countOfMovieLikes,
				  Float avgOfAudienceScore, List<MoviePerson> moviePersons, List<MovieGenre> movieGenres) {
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
		this.createDateTime = createDateTime;
		this.dailyBoxOffice = dailyBoxOffice;
		this.movieNumber = movieNumber;
		this.countOfMovieLikes = countOfMovieLikes;
		this.avgOfAudienceScore = avgOfAudienceScore;
		this.moviePersons = moviePersons;
		this.movieGenres = movieGenres;
	}
}
