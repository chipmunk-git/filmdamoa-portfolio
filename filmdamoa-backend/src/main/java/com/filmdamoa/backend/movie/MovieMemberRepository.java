package com.filmdamoa.backend.movie;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieMemberRepository extends JpaRepository<MovieMember, Long> {
	@Query("SELECT DISTINCT mm FROM MovieMember mm "
		   + "LEFT JOIN FETCH mm.member mmm "
		   + "WHERE mm.movieLike = true and mmm.username = :username and mm.movie IN :movies")
	List<MovieMember> findAllMovieLikeTrue(@Param("username") String username, @Param("movies") List<Movie> movies);
}
