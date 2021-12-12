package com.filmdamoa.backend.payment;

import com.filmdamoa.backend.auth.MemberRepository;
import com.filmdamoa.backend.error.BusinessException;
import com.filmdamoa.backend.movie.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class PaymentService {
	@Autowired
	private PaymentRepository paymentRepository;
	
	@Autowired
	private MovieRepository movieRepository;
	
	@Autowired
	private MemberRepository memberRepository;
	
	@Autowired
	private PaymentMapper paymentMapper;
	
	private final WebClient webClient;
	
	@Value("${spring.iamport.key}")
	private String apiKey;
	
	@Value("${spring.iamport.secret}")
	private String apiSecret;
	
	public PaymentService(WebClient.Builder webClientBuilder) {
		this.webClient = webClientBuilder.baseUrl("https://api.iamport.kr").build();
	}
	
	@Transactional
	public Page<PaymentDto> readPaymentAll(Pageable pageable) {
		String username = getUsername();
		Page<Payment> payments = paymentRepository.findAllByPaymentStateAndMemberUsername(PaymentState.COMPLETE_PAYMENT, username, pageable);
		
		return payments.map(payment -> paymentMapper.toDto(payment));
	}
	
	@Transactional
	public PaymentDto readPayment(String merchantUid) {
		String username = getUsername();
		OffsetDateTime paymentDateTimeParam = OffsetDateTime.now().minusHours(1L);
		Payment payment = null;
		
		if (!merchantUid.equals("none")) {
			payment = paymentRepository.findByMerchantUidAndMemberUsername(merchantUid, username)
									   .orElseThrow(() -> new BusinessException("정보가 존재하지 않습니다."));
		} else {
			payment = paymentRepository.findTopByPaymentDateTimeAfterAndMemberUsernameOrderByPaymentDateTimeDesc(paymentDateTimeParam, username)
									   .orElseThrow(() -> new BusinessException("정보가 존재하지 않습니다."));
		}
		
		return paymentMapper.toDto(payment);
	}
	
	@Transactional
	public void developPayment(PaymentDto paymentDto) {
		String username = getUsername();
		
		if (!username.equals(paymentDto.getUsername())) throw new BusinessException("아이디가 일치하지 않습니다.");
		if (paymentDto.getPaymentState() != PaymentState.INCOMPLETE_PAYMENT) throw new BusinessException("상태 값이 올바르지 않습니다.");
		
		Payment payment = paymentRepository.findByPaymentStateAndMemberUsername(PaymentState.INCOMPLETE_PAYMENT, username).orElse(null);
		Long movieId = movieRepository.findByMovieKoreanTitle(paymentDto.getMovieName()).get().getId();
		Payment newPayment = null;
		
		if (payment != null) {
			newPayment = paymentMapper.toEntity(paymentDto, payment.getId(), OffsetDateTime.now(), movieId, payment.getMember().getId());
			payment.change(newPayment);
		} else {
			Long memberId = memberRepository.findByUsername(username).get().getId();
			newPayment = paymentMapper.toEntity(paymentDto, null, null, movieId, memberId);
			paymentRepository.save(newPayment);
		}
	}
	
	@Transactional
	public Map<String, String> verifyPayment(PaymentDto paymentDto) {
		IamportResponse<AccessToken> tokenResponse = this.webClient.post()
				.uri("/users/getToken")
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.bodyValue(AccessToken.AuthData.builder().apiKey(apiKey).apiSecret(apiSecret).build())
				.retrieve()
				.bodyToMono(new ParameterizedTypeReference<IamportResponse<AccessToken>>() {})
				.flux()
				.toStream()
				.findFirst()
				.orElseThrow(() -> new BusinessException("인증 토큰 발급에 실패했습니다."));
		
		IamportResponse<PaymentData> paymentDataResponse = this.webClient.get()
				.uri("/payments/{imp_uid}", paymentDto.getImpUid())
				.accept(MediaType.APPLICATION_JSON)
				.header(HttpHeaders.AUTHORIZATION, tokenResponse.getResponse().getToken())
				.retrieve()
				.bodyToMono(new ParameterizedTypeReference<IamportResponse<PaymentData>>() {})
				.flux()
				.toStream()
				.findFirst()
				.orElseThrow(() -> new BusinessException("결제 정보 조회에 실패했습니다."));
		PaymentData paymentData = paymentDataResponse.getResponse();
		
		Payment payment = paymentRepository.findByMerchantUid(paymentData.getMerchantUid()).get();
		Integer amountToBePaid = payment.getAmount();
		
		Map<String, String> responseMap = new HashMap<>();
		
		if (paymentData.getAmount().equals(BigDecimal.valueOf(amountToBePaid))) {
			String impUid = paymentData.getImpUid();
			OffsetDateTime paymentDateTime = paymentData.getPaidAt().toInstant().atOffset(OffsetDateTime.now().getOffset());
			paymentRepository.updateByMerchantUid(impUid, paymentDateTime, paymentDto.getMerchantUid());
			
			switch (paymentData.getStatus()) {
				case "ready": // 가상계좌 발급
					// DB에 가상계좌 발급 정보 저장
					// 가상계좌 발급 안내 문자메시지 발송
					
					responseMap.put("status", "vbankIssued");
					responseMap.put("message", "가상계좌 발급 성공");
					break;
				case "paid": // 결제 완료
					responseMap.put("status", "success");
					responseMap.put("message", "일반 결제 성공");
					break;
			}
		} else { // 결제금액 불일치. 위/변조 된 결제
			responseMap.put("status", "forgery");
			responseMap.put("message", "위조된 결제시도");
		}
		
		return responseMap;
	}
	
	private String getUsername() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		String username = userDetails.getUsername();
		
		return username;
	}
}
