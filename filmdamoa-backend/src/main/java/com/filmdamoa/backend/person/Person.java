package com.filmdamoa.backend.person;

import java.time.OffsetDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.CreationTimestamp;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "person")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Person {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false)
	private String koreanName;
	
	private String englishName;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE", updatable = false)
	@CreationTimestamp
	private OffsetDateTime createDateTime;
	
	@Builder
	private Person(Long id, String koreanName, String englishName, OffsetDateTime createDateTime) {
		this.id = id;
		this.koreanName = koreanName;
		this.englishName = englishName;
		this.createDateTime = createDateTime;
	}
}
