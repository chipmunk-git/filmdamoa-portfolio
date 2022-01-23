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
	
	// 페이징 조건을 포함시켜 결제 목록 조회
	@GetMapping
	public ResponseEntity<Page<PaymentDto>> readPaymentAll(Pageable pageable) {
		return ResponseEntity.ok().body(paymentService.readPaymentAll(pageable));
	}
	
	// 예매 번호를 기준으로 특정 결제 정보 조회
	@GetMapping("/{merchantUid}")
	public ResponseEntity<PaymentDto> readPayment(@PathVariable String merchantUid) {
		return ResponseEntity.ok().body(paymentService.readPayment(merchantUid));
	}
	
	// 미완성 초기 결제 정보를 DB에 저장
	@PostMapping
	public ResponseEntity<String> developPayment(@RequestBody PaymentDto paymentDto) {
		paymentService.developPayment(paymentDto);
		return ResponseEntity.noContent().build();
	}
	
	// 결제 정보의 위변조 여부 검증 및 검증된 정보를 DB에 저장
	@PostMapping("/complete")
	public ResponseEntity<Map<String, String>> verifyPayment(@RequestBody PaymentDto paymentDto) {
		Map<String, String> responseMap = paymentService.verifyPayment(paymentDto);
		
		if (responseMap.get("status").equals("forgery")) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseMap);
		}
		
		return ResponseEntity.ok().body(responseMap);
	}
}
