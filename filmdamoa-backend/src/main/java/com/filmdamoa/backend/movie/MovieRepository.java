package com.filmdamoa.backend.movie;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
	Page<Movie> findAll(Pageable pageable);
	Optional<Movie> findByMovieKoreanTitle(String movieKoreanTitle);
}
