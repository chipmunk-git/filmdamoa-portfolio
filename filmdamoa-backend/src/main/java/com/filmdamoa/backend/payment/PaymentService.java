package com.filmdamoa.backend.payment;

import com.filmdamoa.backend.auth.Member;
import com.filmdamoa.backend.auth.MemberRepository;
import com.filmdamoa.backend.error.BusinessException;
import com.filmdamoa.backend.movie.Movie;
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
	
	// 로그인한 유저의 완료된 결제 목록을 반환
	@Transactional
	public Page<PaymentDto> readPaymentAll(Pageable pageable) {
		String username = getUsername();
		Page<Payment> payments = paymentRepository.findAllByPaymentStateAndMemberUsername(PaymentState.COMPLETE_PAYMENT, username, pageable);
		
		return payments.map(payment -> paymentMapper.toDto(payment));
	}
	
	@Transactional
	public PaymentDto readPayment(String merchantUid) {
		String username = getUsername();
		OffsetDateTime paymentDateTimeParam = OffsetDateTime.now().minusHours(1L); // 현재 시간에서 1시간을 뺀 값을 할당
		Payment payment = null;
		
		if (!merchantUid.equals("none")) {
			// 예매 번호가 있다면 예매 번호 및 아이디를 기준으로 조회
			payment = paymentRepository.findByMerchantUidAndMemberUsername(merchantUid, username)
									   .orElseThrow(() -> new BusinessException("정보가 존재하지 않습니다."));
		} else {
			// 예매 번호가 없다면 현재 시간에서 1시간을 뺀 값 및 아이디를 기준으로 조회. 예매한 지 1시간이 지나면 해당 메소드로 조회할 수 없음
			payment = paymentRepository.findTopByPaymentDateTimeAfterAndMemberUsernameOrderByPaymentDateTimeDesc(paymentDateTimeParam, username)
									   .orElseThrow(() -> new BusinessException("정보가 존재하지 않습니다."));
		}
		
		return paymentMapper.toDto(payment);
	}
	
	@Transactional
	public void developPayment(PaymentDto paymentDto) {
		String username = getUsername();
		
		if (!username.equals(paymentDto.getUsername())) throw new BusinessException("아이디가 일치하지 않습니다."); // paymentDto의 아이디 값을 검증
		if (paymentDto.getPaymentState() != PaymentState.INCOMPLETE_PAYMENT) throw new BusinessException("상태 값이 올바르지 않습니다."); // paymentDto의 paymentState 값을 검증
		
		// PaymentState.INCOMPLETE_PAYMENT 및 아이디를 기준으로 조회
		Payment payment = paymentRepository.findByPaymentStateAndMemberUsername(PaymentState.INCOMPLETE_PAYMENT, username).orElse(null);
		// 영화의 한글 제목을 기준으로 조회
		Movie movie = movieRepository.findByMovieKoreanTitle(paymentDto.getMovieName()).get();
		Payment newPayment = null;
		
		if (payment != null) {
			newPayment = paymentMapper.toEntity(paymentDto, payment.getId(), OffsetDateTime.now(), movie, payment.getMember());
			payment.change(newPayment); // 튜플이 이미 존재한다면 newPayment 객체를 변경 감지(Dirty Checking)에 이용
		} else {
			Member member = memberRepository.findByUsername(username).get(); // 아이디를 기준으로 조회
			newPayment = paymentMapper.toEntity(paymentDto, null, null, movie, member);
			paymentRepository.save(newPayment); // 튜플이 없다면 newPayment 객체를 테이블에 삽입
		}
	}
	
	@Transactional
	public Map<String, String> verifyPayment(PaymentDto paymentDto) {
		// AuthData 객체를 요청 본문으로 하여 아임포트 액세스 토큰 발급
		IamportResponse<AccessToken> tokenResponse = this.webClient.post()
				.uri("/users/getToken")
				.contentType(MediaType.APPLICATION_JSON)
				.accept(MediaType.APPLICATION_JSON)
				.bodyValue(AccessToken.AuthData.builder().apiKey(apiKey).apiSecret(apiSecret).build()) // REST API Key & Secret 할당
				.retrieve()
				.bodyToMono(new ParameterizedTypeReference<IamportResponse<AccessToken>>() {})
				.flux()
				.toStream()
				.findFirst()
				.orElseThrow(() -> new BusinessException("인증 토큰 발급에 실패했습니다."));
		
		// 아임포트 결제 번호를 URI에 추가하여 결제 정보 조회
		IamportResponse<PaymentData> paymentDataResponse = this.webClient.get()
				.uri("/payments/{imp_uid}", paymentDto.getImpUid())
				.accept(MediaType.APPLICATION_JSON)
				.header(HttpHeaders.AUTHORIZATION, tokenResponse.getResponse().getToken()) // 액세스 토큰을 Authorization Header에 추가
				.retrieve()
				.bodyToMono(new ParameterizedTypeReference<IamportResponse<PaymentData>>() {})
				.flux()
				.toStream()
				.findFirst()
				.orElseThrow(() -> new BusinessException("결제 정보 조회에 실패했습니다."));
		PaymentData paymentData = paymentDataResponse.getResponse(); // 결제 정보 확보
		
		Payment payment = paymentRepository.findByMerchantUid(paymentData.getMerchantUid()).get(); // 예매 번호를 기준으로 조회
		Integer amountToBePaid = payment.getAmount(); // 결제되어야 하는 금액 확보
		
		Map<String, String> responseMap = new HashMap<>();
		
		if (paymentData.getAmount().equals(BigDecimal.valueOf(amountToBePaid))) { // 결제금액 일치. '결제된 금액'과 '결제되어야 하는 금액'이 동일
			String impUid = paymentData.getImpUid(); // 결제 정보의 아임포트 결제 번호 이용
			OffsetDateTime paymentDateTime = paymentData.getPaidAt().toInstant().atOffset(OffsetDateTime.now().getOffset()); // Date 객체를 OffsetDateTime 객체로 변환
			// 예매 번호를 기준으로 하여 impUid, paymentState 및 paymentDateTime를 수정
			paymentRepository.updateByMerchantUid(impUid, paymentDateTime, paymentDto.getMerchantUid());
			
			switch (paymentData.getStatus()) {
				case "ready": // 가상계좌 발급
					// DB에 가상계좌 발급 정보 저장
					// 가상계좌 발급 안내 문자메시지 발송
					/* 차후 구현 필요 */
					
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
		
		// 각 조건에 적합한 status 및 message가 담긴 responseMap을 반환
		return responseMap;
	}
	
	// authentication 객체에서 아이디를 확보하여 반환
	private String getUsername() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		UserDetails userDetails = (UserDetails)authentication.getPrincipal();
		String username = userDetails.getUsername();
		
		return username;
	}
}
