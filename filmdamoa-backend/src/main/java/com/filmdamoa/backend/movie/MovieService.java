package com.filmdamoa.backend.movie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MovieService {
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private MovieMapper movieMapper;
	
	public List<MovieDto> readMovieAll() {
		List<Movie> movies = movieRepository.findDistinctTop4ByOrderByDailyBoxOfficeAsc();
		return movieMapper.toDtos(movies, MovieDto.MappingCondition.EXCEPT_MOVIE_GENRE);
	}
}
