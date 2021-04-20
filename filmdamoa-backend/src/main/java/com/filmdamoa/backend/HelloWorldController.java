package com.filmdamoa.backend;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloWorldController {
	@GetMapping("/helloWorld")
	public String helloWorld() {
		return "Hello, world!";
	}
}
