package com.filmdamoa.backend.movie;

import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import com.filmdamoa.backend.auth.Member;
import com.filmdamoa.backend.common.TupleState;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie_member")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MovieMember {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private Boolean movieLike;
	
	private Short audienceScore;
	
	private String movieReview;
	
	@Column(nullable = false)
	private TupleState tupleState;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE", updatable = false)
	@CreationTimestamp
	private OffsetDateTime createDateTime;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="movie_id")
	private Movie movie;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="member_id")
	private Member member;
	
	@Builder
	private MovieMember(Long id, Boolean movieLike, Short audienceScore, String movieReview,
						TupleState tupleState, OffsetDateTime createDateTime, Movie movie, Member member) {
		this.id = id;
		this.movieLike = movieLike;
		this.audienceScore = audienceScore;
		this.movieReview = movieReview;
		this.tupleState = tupleState;
		this.createDateTime = createDateTime;
		this.movie = movie;
		this.member = member;
	}
}
