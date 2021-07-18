package com.filmdamoa.backend.movie;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MovieMemberRepository extends JpaRepository<MovieMember, Long> {
	@Query("SELECT DISTINCT mm FROM MovieMember mm " +
		   "LEFT JOIN FETCH mm.member mmm " +
		   "WHERE mm.movieLike = true AND mmm.username = :username AND mm.movie IN :movies")
	List<MovieMember> findAllMovieLikeTrue(@Param("username") String username, @Param("movies") List<Movie> movies);
	
	@EntityGraph(attributePaths = "member")
	Optional<MovieMember> findByMovieAndMemberUsername(Movie movie, String username);
	
	@Modifying
	@Query("UPDATE MovieMember mm SET mm.movieLike = true WHERE mm.id = :id")
	void updateMovieLikeToTrue(@Param("id") Long id);
	
	@Modifying
	@Query("UPDATE MovieMember mm1 " +
		   "SET mm1.movieLike = false " +
		   "WHERE mm1.id = ( " +
		   "	SELECT mm2.id " +
		   "	FROM MovieMember mm2 " +
		   "	LEFT JOIN Member m ON mm2.member.id = m.id " +
		   "	WHERE mm2.movie.id = :movieId AND m.username = :username)")
	void updateMovieLikeToFalse(@Param("movieId") Long movieId, @Param("username") String username);
}
