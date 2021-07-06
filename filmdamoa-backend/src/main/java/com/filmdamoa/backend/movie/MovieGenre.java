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

import com.filmdamoa.backend.genre.Genre;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie_genre")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MovieGenre {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE", updatable = false)
	@CreationTimestamp
	private OffsetDateTime createDateTime;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="movie_id")
	private Movie movie;
	
	@ManyToOne
	@JoinColumn(name="genre_id")
	private Genre genre;
	
	@Builder
	private MovieGenre(Long id, OffsetDateTime createDateTime, Movie movie, Genre genre) {
		this.id = id;
		this.createDateTime = createDateTime;
		this.movie = movie;
		this.genre = genre;
	}
}
