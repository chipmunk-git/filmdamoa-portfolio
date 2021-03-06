package com.filmdamoa.backend.movie;

import com.filmdamoa.backend.genre.Genre;
import com.filmdamoa.backend.movie.Movie.MovieBuilder;
import com.filmdamoa.backend.movie.MovieDto.MovieDtoBuilder;
import com.filmdamoa.backend.movie.MovieDto.MappingCondition;
import com.filmdamoa.backend.person.Person;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MovieMapper {
	public Movie toEntity(MovieDto dto) {
		if (dto == null) {
			return null;
		}
		
		MovieBuilder movie = Movie.builder();
		
		movie.id(dto.getId());
		movie.movieKoreanTitle(dto.getMovieKoreanTitle());
		movie.movieEnglishTitle(dto.getMovieEnglishTitle());
		movie.screeningState(dto.getScreeningState());
		movie.posterThumbnail(dto.getPosterThumbnail());
		movie.synopsis(dto.getSynopsis());
		movie.movieRunningTime(dto.getMovieRunningTime());
		movie.movieRating(dto.getMovieRating());
		movie.manufactureCountry(dto.getManufactureCountry());
		movie.movieReleaseDate(dto.getMovieReleaseDate());
		movie.tupleState(dto.getTupleState());
		movie.movieNumber(dto.getMovieNumber());
		
		return movie.build();
	}
	
	public MovieDto toDto(Movie entity, MappingCondition mappingCondition, boolean movieLike) {
		if (entity == null) {
			return null;
		}
		
		MovieDtoBuilder movieDto = MovieDto.builder();
		
		movieDto.id(entity.getId());
		movieDto.movieKoreanTitle(entity.getMovieKoreanTitle());
		movieDto.movieEnglishTitle(entity.getMovieEnglishTitle());
		movieDto.screeningState(entity.getScreeningState());
		movieDto.posterThumbnail(entity.getPosterThumbnail());
		movieDto.synopsis(entity.getSynopsis());
		movieDto.movieRunningTime(entity.getMovieRunningTime());
		movieDto.movieRating(entity.getMovieRating());
		movieDto.manufactureCountry(entity.getManufactureCountry());
		movieDto.movieReleaseDate(entity.getMovieReleaseDate());
		movieDto.tupleState(entity.getTupleState());
		movieDto.dailyBoxOffice(entity.getDailyBoxOffice());
		movieDto.movieNumber(entity.getMovieNumber());
		movieDto.movieLikes(entity.getCountOfMovieLikes());
		movieDto.audienceScore(entity.getAvgOfAudienceScore() == null ? 0 : entity.getAvgOfAudienceScore());
		movieDto.movieLike(movieLike);
		
		movieDto.movieDirector(entityMoviePersonsToMovieDirector(entity)); // MoviePerson List?????? ????????? ????????? ????????? ??? ??????
		movieDto.movieStar(entityMoviePersonsToMovieStar(entity)); // MoviePerson List?????? ???????????? ????????? ????????? ??? ??????
		if (mappingCondition == MappingCondition.ALL) {
			movieDto.movieGenre(entityMovieGenresToMovieGenre(entity));
		}
		
		return movieDto.build();
	}
	
	public List<MovieDto> toDtos(List<Movie> entities, MappingCondition mappingCondition, boolean movieLike) {
		if (entities == null) {
			return null;
		}
		
		List<MovieDto> list = new ArrayList<MovieDto>(entities.size());
		for (Movie movie : entities) {
			list.add(toDto(movie, mappingCondition, movieLike));
		}
		
		return list;
	}
	
	private String entityMoviePersonsToMovieDirector(Movie movie) {
		List<MoviePerson> moviePersons = getMoviePersons(movie);
		if (moviePersons == null) {
			return null;
		}
		
		String movieDirector = null;
		for (MoviePerson moviePerson : moviePersons) {
			Position position = moviePerson.getPosition();
			if (position == null) {
				return null;
			}
			
			// ????????? '??????'??? ????????? ????????? ????????? ??? ????????? ??????
			if (position.getDuty().equals("??????")) {
				Person person = moviePerson.getPerson();
				if (person == null) {
					return null;
				}
				
				movieDirector = person.getKoreanName();
				break;
			}
		}
		
		return movieDirector;
	}
	
	private String entityMoviePersonsToMovieStar(Movie movie) {
		List<MoviePerson> moviePersons = getMoviePersons(movie);
		if (moviePersons == null) {
			return null;
		}
		
		List<String> list = new ArrayList<String>(moviePersons.size() - 1);
		for (MoviePerson moviePerson : moviePersons) {
			Position position = moviePerson.getPosition();
			if (position == null) {
				return null;
			}
			
			// ????????? '??????'??? ???????????? ????????? list??? ??????
			if (position.getDuty().equals("??????")) {
				Person person = moviePerson.getPerson();
				if (person == null) {
					return null;
				}
				
				list.add(person.getKoreanName());
			}
		}
		String movieStar = String.join(", ", list); // list??? ???????????? ', '??? ??????
		
		return movieStar;
	}
	
	private List<MoviePerson> getMoviePersons(Movie movie) {
		if (movie == null) {
			return null;
		}
		
		return movie.getMoviePersons();
	}
	
	private String entityMovieGenresToMovieGenre(Movie movie) {
		if (movie == null) {
			return null;
		}
		
		List<MovieGenre> movieGenres = movie.getMovieGenres();
		if (movieGenres == null) {
			return null;
		}
		
		List<String> list = new ArrayList<String>(movieGenres.size());
		for (MovieGenre movieGenre : movieGenres) {
			Genre genre = movieGenre.getGenre();
			if (genre == null) {
				return null;
			}
			
			list.add(genre.getType()); // ????????? ???????????? list??? ??????
		}
		String movieGenre = String.join(", ", list); // list??? ???????????? ', '??? ??????
		
		return movieGenre;
	}
}
