package com.filmdamoa.backend.movie;

import com.filmdamoa.backend.auth.Member;
import com.filmdamoa.backend.auth.MemberRepository;
import com.filmdamoa.backend.common.TupleState;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class MovieService {
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private MovieMemberRepository movieMemberRepository;
	
	@Autowired
	private MemberRepository memberRepository;
	
	@Autowired
	private MovieMapper movieMapper;
	
	@Transactional
	public Page<MovieDto> readMovieAll(Pageable pageable) {
		Page<Movie> movies = movieRepository.findAll(pageable);
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication(); // authentication 객체 확보
		
		if (authentication instanceof UsernamePasswordAuthenticationToken) { // authentication의 타입이 UsernamePasswordAuthenticationToken인지 확인
			UserDetails userDetails = (UserDetails)authentication.getPrincipal();
			String username = userDetails.getUsername();
			// 로그인한 유저가 '좋아요'를 누른 영화들을 갖고 있는 movieMembers List 확보
			List<MovieMember> movieMembers = movieMemberRepository.findAllMovieLikeTrue(username, movies.getContent());
			
			Set<Long> movieIds = new HashSet<>();
			for (MovieMember mm : movieMembers) {
				movieIds.add(mm.getMovie().getId()); // movieMembers List에 포함된 movie의 기본 키를 movieIds Set에 추가
			}
			
			return movies.map(movie ->
					   // movieIds Set에 movie의 기본 키가 있다면 movieLike에 true를 할당. 없다면 false를 할당
					   movieMapper.toDto(movie, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE, movieIds.contains(movie.getId()))
				   );
		} else {
			return movies.map(movie ->
					   // 로그인을 하지 않았다면 모든 movieLike에 false를 할당
					   movieMapper.toDto(movie, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE, false)
				   );
		}
	}
	
	@Transactional
	public void updateMovieLike(Long movieId, Map<String, Boolean> requestMap) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		String username = userDetails.getUsername(); // authentication 객체에서 아이디 확보
		Boolean movieLike = requestMap.get("movieLike"); // requestMap에서 movieLike 값 확보
		
		if (movieLike) {
			// movieLike가 참이라면 해당되는 튜플이 이미 존재한다는 뜻이므로 곧장 false로 수정 가능
			movieMemberRepository.updateMovieLikeToFalse(movieId, username);
		} else {
			Movie movie = Movie.builder().id(movieId).build();
			// movieLike가 거짓이라면 튜플의 존재 여부를 먼저 확인해 보아야 함
			MovieMember movieMember = movieMemberRepository.findByMovieAndMemberUsername(movie, username).orElse(null);
			
			if (movieMember != null) {
				// 튜플이 이미 존재한다면 기본 키를 기준으로 하여 true로 수정
				movieMemberRepository.updateMovieLikeToTrue(movieMember.getId());
			} else {
				Member member = memberRepository.findByUsername(username).get();
				movieMember = MovieMember.builder()
										 .movieLike(true)
										 .tupleState(TupleState.PUBLIC_TUPLE)
										 .movie(movie)
										 .member(member)
										 .build();
				
				// 튜플이 없다면 movieLike가 true인 movieMember 객체를 테이블에 삽입
				movieMemberRepository.save(movieMember);
			}
		}
	}
}
