package com.filmdamoa.backend.movie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@CrossOrigin(origins = "${spring.cors.origins}", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/movie")
public class MovieController {
	@Autowired
	private MovieService movieService;
	
	// 페이징 조건을 포함시켜 영화 목록 조회
	@GetMapping
	public ResponseEntity<Page<MovieDto>> readMovieAll(Pageable pageable) {
		return ResponseEntity.ok().body(movieService.readMovieAll(pageable));
	}
	
	// 영화 좋아요 토글
	@PostMapping("/{id}/like")
	public ResponseEntity<String> updateMovieLike(@PathVariable Long id, @RequestBody Map<String, Boolean> requestMap) {
		movieService.updateMovieLike(id, requestMap);
		return ResponseEntity.noContent().build();
	}
}
