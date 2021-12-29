package com.filmdamoa.backend.booking;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@CrossOrigin(origins = "${spring.cors.origins}", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/booking")
public class BookingController {
	@Autowired
	private BookingService bookingService;
	
	// 상영 영화 및 영화 스케줄 조회
	@PostMapping
	public ResponseEntity<Mono<DateResponse>> postMovieDate(@RequestBody DateRequest dateRequest) {
		return ResponseEntity.ok().body(bookingService.postMovieDate(dateRequest));
	}
	
	// 특정 영화 스케줄에 대한 좌석 및 상영 정보 조회
	@PostMapping("/seat")
	public ResponseEntity<Mono<SeatResponse>> postMovieSeat(@RequestBody SeatRequest seatRequest) {
		return ResponseEntity.ok().body(bookingService.postMovieSeat(seatRequest));
	}
}
