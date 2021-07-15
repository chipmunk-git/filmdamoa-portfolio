package com.filmdamoa.backend.movie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {
	List<Movie> findDistinctTop4ByOrderByDailyBoxOfficeAsc();
}
