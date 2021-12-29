package com.filmdamoa.backend.booking;

import com.filmdamoa.backend.movie.Movie;
import com.filmdamoa.backend.movie.MovieRepository;
import org.springframework.core.env.Environment;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class BookingService {
	private final MovieRepository movieRepository;
	private final WebClient webClient;
	private final Environment env;
	
	public BookingService(MovieRepository movieRepository, WebClient.Builder webClientBuilder, Environment env) {
		this.movieRepository = movieRepository;
		this.webClient = webClientBuilder.baseUrl(env.getProperty("spring.web-client.base-url")).build();
		this.env = env;
	}
	
	public Mono<DateResponse> postMovieDate(DateRequest dateRequest) {
		// dateRequest를 요청 본문으로 하여 상영 영화 및 영화 스케줄을 받아옴
		Mono<DateResponse> dateResponseMono = this.webClient.post()
				.uri(env.getProperty("spring.web-client.date-uri"))
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.bodyValue(dateRequest)
				.retrieve()
				.bodyToMono(DateResponse.class);
		
		// DB에 저장된 전체 영화 조회
		List<Movie> movies = movieRepository.findAll();
		
		// 전체 영화의 고유 번호를 movieNumbers Set에 저장
		Set<String> movieNumbers = new HashSet<>();
		for (Movie movie : movies) {
			movieNumbers.add(movie.getMovieNumber());
		}
		
		// 상영 영화 목록 및 영화 스케줄 목록을 변경 후 반환
		return dateResponseMono.map(dateResponse -> {
			// DB에 저장된 영화만 포함되도록, 상영 영화 목록 변경
			List<Map<String, Object>> movieList = dateResponse.getMovieList();
			List<Map<String, Object>> newMovieList = new ArrayList<>();
			// 영화 고유 번호가 movieNumbers Set에 포함되어 있는 영화만 newMovieList에 저장
			for (Map<String, Object> movie : movieList) {
				String movieNo = (String)movie.get("movieNo");
				
				if (movieNumbers.contains(movieNo)) {
					newMovieList.add(movie);
				}
			}
			dateResponse.setMovieList(newMovieList);
			
			// DB에 저장된 영화만 포함되도록, 영화 스케줄 목록 변경
			List<Map<String, Object>> movieFormList = dateResponse.getMovieFormList();
			if (movieFormList != null) {
				List<Map<String, Object>> newMovieFormList = new ArrayList<>();
				// 영화 고유 번호가 movieNumbers Set에 포함되어 있는 영화만 newMovieFormList에 저장
				for (Map<String, Object> movieForm : movieFormList) {
					String rpstMovieNo = (String)movieForm.get("rpstMovieNo");
					
					if (movieNumbers.contains(rpstMovieNo)) {
						newMovieFormList.add(movieForm);
					}
				}
				dateResponse.setMovieFormList(newMovieFormList);
			}
			
			return dateResponse;
		});
	}
	
	public Mono<SeatResponse> postMovieSeat(SeatRequest seatRequest) {
		// seatRequest를 요청 본문으로 하여 특정 영화 스케줄에 대한 좌석 및 상영 정보를 받아옴
		Mono<SeatResponse> seatResponseMono = this.webClient.post()
				.uri(env.getProperty("spring.web-client.seat-uri"))
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.bodyValue(seatRequest)
				.retrieve()
				.bodyToMono(SeatResponse.class);
		
		return seatResponseMono;
	}
}
