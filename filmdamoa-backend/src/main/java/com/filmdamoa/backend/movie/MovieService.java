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
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof UsernamePasswordAuthenticationToken) {
			UserDetails userDetails = (UserDetails)authentication.getPrincipal();
			String username = userDetails.getUsername();
			List<MovieMember> movieMembers = movieMemberRepository.findAllMovieLikeTrue(username, movies.getContent());
			
			Set<Long> movieIds = new HashSet<>();
			for (MovieMember mm : movieMembers) {
				movieIds.add(mm.getMovie().getId());
			}
			
			return movies.map(movie ->
					   movieMapper.toDto(movie, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE, movieIds.contains(movie.getId()))
				   );
		} else {
			return movies.map(movie ->
					   movieMapper.toDto(movie, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE, false)
				   );
		}
	}
	
	@Transactional
	public void updateMovieLike(Long movieId, Map<String, Boolean> requestMap) {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		String username = userDetails.getUsername();
		Boolean movieLike = requestMap.get("movieLike");
		
		if (movieLike) {
			movieMemberRepository.updateMovieLikeToFalse(movieId, username);
		} else {
			Movie movie = Movie.builder().id(movieId).build();
			MovieMember movieMember = movieMemberRepository.findByMovieAndMemberUsername(movie, username).orElse(null);
			
			if (movieMember != null) {
				movieMemberRepository.updateMovieLikeToTrue(movieMember.getId());
			} else {
				Member member = memberRepository.findByUsername(username).get();
				movieMember = MovieMember.builder()
										 .movieLike(true)
										 .tupleState(TupleState.PUBLIC_TUPLE)
										 .movie(movie)
										 .member(member)
										 .build();
				
				movieMemberRepository.save(movieMember);
			}
		}
	}
}
