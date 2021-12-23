package com.filmdamoa.backend.payment;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/payment")
public class PaymentController {
	@Autowired
	private PaymentService paymentService;
	
	@GetMapping
	public ResponseEntity<Page<PaymentDto>> readPaymentAll(Pageable pageable) {
		return ResponseEntity.ok().body(paymentService.readPaymentAll(pageable));
	}
	
	@GetMapping("/{merchantUid}")
	public ResponseEntity<PaymentDto> readPayment(@PathVariable String merchantUid) {
		return ResponseEntity.ok().body(paymentService.readPayment(merchantUid));
	}
	
	@PostMapping
	public ResponseEntity<String> developPayment(@RequestBody PaymentDto paymentDto) {
		paymentService.developPayment(paymentDto);
		return ResponseEntity.noContent().build();
	}
	
	@PostMapping("/complete")
	public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody PaymentDto paymentDto) {
		Map<String, String> responseMap = paymentService.verifyPayment(paymentDto);
		
		if (responseMap.get("status").equals("forgery")) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
		}
		
		return ResponseEntity.ok().body(responseMap);
	}
}
