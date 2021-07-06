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

import com.filmdamoa.backend.person.Person;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "movie_person")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class MoviePerson {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private Position position;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE", updatable = false)
	@CreationTimestamp
	private OffsetDateTime createDateTime;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="movie_id")
	private Movie movie;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="person_id")
	private Person person;
	
	@Builder
	private MoviePerson(Long id, Position position, OffsetDateTime createDateTime, Movie movie, Person person) {
		this.id = id;
		this.position = position;
		this.createDateTime = createDateTime;
		this.movie = movie;
		this.person = person;
	}
}
