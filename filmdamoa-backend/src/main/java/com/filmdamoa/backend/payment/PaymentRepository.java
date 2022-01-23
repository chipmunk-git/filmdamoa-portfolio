package com.filmdamoa.backend.payment;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
	// paymentState, member의 아이디 및 페이징 조건을 기준으로 조회
	@EntityGraph(attributePaths = {"movie", "member"})
	Page<Payment> findAllByPaymentStateAndMemberUsername(PaymentState paymentState, String username, Pageable pageable);
	
	@EntityGraph(attributePaths = {"audiences", "movie", "member"})
	Optional<Payment> findByMerchantUidAndMemberUsername(String merchantUid, String username); // 예매 번호 및 member의 아이디를 기준으로 조회
	
	// 주어진 paymentDateTime보다 이후인 조건 및 member의 아이디를 기준으로, paymentDateTime 내림차순의 첫 번째 튜플을 조회
	@EntityGraph(attributePaths = {"movie", "member"})
	Optional<Payment> findTopByPaymentDateTimeAfterAndMemberUsernameOrderByPaymentDateTimeDesc(OffsetDateTime paymentDateTimeParam, String username);
	
	@EntityGraph(attributePaths = "member")
	Optional<Payment> findByPaymentStateAndMemberUsername(PaymentState paymentState, String username); // paymentState 및 member의 아이디를 기준으로 조회
	
	Optional<Payment> findByMerchantUid(String merchantUid); // 예매 번호를 기준으로 조회
	
	@Modifying
	@Query("UPDATE Payment p " +
		   // impUid 및 paymentDateTime을 주어진 값으로 수정하고 paymentState를 PaymentState.COMPLETE_PAYMENT로 수정
		   "SET p.impUid = :impUid, p.paymentState = com.filmdamoa.backend.payment.PaymentState.COMPLETE_PAYMENT, p.paymentDateTime = :paymentDateTime " +
		   "WHERE p.merchantUid = :merchantUid") // 예매 번호를 기준으로 함
	Integer updateByMerchantUid(@Param("impUid") String impUid, @Param("paymentDateTime") OffsetDateTime paymentDateTime, @Param("merchantUid") String merchantUid);
}
