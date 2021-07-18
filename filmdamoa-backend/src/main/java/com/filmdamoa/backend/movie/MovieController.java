package com.filmdamoa.backend.movie;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true", maxAge = 3600)
@RestController
@RequestMapping("/movie")
public class MovieController {
	@Autowired
	private MovieService movieService;
	
	@GetMapping
	public ResponseEntity<List<MovieDto>> readMovieAll() {
		return ResponseEntity.ok().body(movieService.readMovieAll());
	}
	
	@PostMapping("/{id}/like")
	public ResponseEntity<String> updateMovieLike(@PathVariable Long id, @RequestBody Map<String, Boolean> requestMap) {
		movieService.updateMovieLike(id, requestMap);
		return ResponseEntity.noContent().build();
	}
}
