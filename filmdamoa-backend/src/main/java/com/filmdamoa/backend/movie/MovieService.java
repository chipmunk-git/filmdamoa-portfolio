package com.filmdamoa.backend.movie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MovieService {
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private MovieMemberRepository movieMemberRepository;
	
	@Autowired
	private MovieMapper movieMapper;
	
	@Transactional
	public List<MovieDto> readMovieAll() {
		List<Movie> movies = movieRepository.findDistinctTop4ByOrderByDailyBoxOfficeAsc();
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		if (authentication instanceof UsernamePasswordAuthenticationToken) {
			UserDetails userDetails = (UserDetails)authentication.getPrincipal();
			String username = userDetails.getUsername();
			List<MovieMember> movieMembers = movieMemberRepository.findAllMovieLikeTrue(username, movies);
			
			Set<Long> movieIds = new HashSet<>();
			for (MovieMember mm : movieMembers) {
				movieIds.add(mm.getMovie().getId());
			}
			
			return movies.stream().map(movie ->
					   movieMapper.toDto(movie, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE, movieIds.contains(movie.getId()))
				   ).collect(Collectors.toList());
		} else {
			return movieMapper.toDtos(movies, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE, false);
		}
	}
}
