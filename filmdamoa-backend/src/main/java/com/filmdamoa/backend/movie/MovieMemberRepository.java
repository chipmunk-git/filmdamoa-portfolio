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
	@Query("SELECT mm FROM MovieMember mm " +
		   "JOIN FETCH mm.member mmm " + // member와 FETCH JOIN
		   "WHERE mm.movieLike = true AND mmm.username = :username AND mm.movie IN :movies") // movieLike = true, member의 아이디 및 movies의 항목들을 기준으로 조회
	List<MovieMember> findAllMovieLikeTrue(@Param("username") String username, @Param("movies") List<Movie> movies);
	
	@EntityGraph(attributePaths = "member")
	Optional<MovieMember> findByMovieAndMemberUsername(Movie movie, String username); // movie 및 member의 아이디를 기준으로 조회
	
	@Modifying
	@Query("UPDATE MovieMember mm SET mm.movieLike = true WHERE mm.id = :id") // 기본 키를 기준으로 하여, movieLike를 true로 수정
	void updateMovieLikeToTrue(@Param("id") Long id);
	
	@Modifying
	@Query("UPDATE MovieMember mm1 " +
		   "SET mm1.movieLike = false " + // movieLike를 false로 수정
		   "WHERE mm1.id = ( " + // WHERE 절 단일 행 서브쿼리
		   "	SELECT mm2.id " +
		   "	FROM MovieMember mm2 " +
		   "	JOIN Member m ON mm2.member.id = m.id " + // member와 JOIN
		   "	WHERE mm2.movie.id = :movieId AND m.username = :username)") // movie를 참조하는 외래 키 및 member의 아이디를 기준으로 조회
	void updateMovieLikeToFalse(@Param("movieId") Long movieId, @Param("username") String username);
}
