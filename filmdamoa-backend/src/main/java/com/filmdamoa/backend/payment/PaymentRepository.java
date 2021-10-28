package com.filmdamoa.backend.payment;

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
	@EntityGraph(attributePaths = "member")
	Optional<Payment> findByPaymentStateAndMemberUsername(PaymentState paymentState, String username);
	
	Optional<Payment> findByMerchantUid(String merchantUid);
	
	@EntityGraph(attributePaths = {"audiences", "movie", "member"})
	Optional<Payment> findByMerchantUidAndPaymentDateTimeAfterAndMemberUsername(String merchantUid, OffsetDateTime paymentDateTimeParam, String username);
	
	@EntityGraph(attributePaths = {"audiences", "movie", "member"})
	Optional<Payment> findTopByPaymentDateTimeAfterAndMemberUsernameOrderByPaymentDateTimeDesc(OffsetDateTime paymentDateTimeParam, String username);
	
	@Modifying
	@Query("UPDATE Payment p " +
		   "SET p.impUid = :impUid, p.paymentState = com.filmdamoa.backend.payment.PaymentState.COMPLETE_PAYMENT, p.paymentDateTime = :paymentDateTime " +
		   "WHERE p.merchantUid = :merchantUid")
	Integer updateByMerchantUid(@Param("impUid") String impUid, @Param("paymentDateTime") OffsetDateTime paymentDateTime, @Param("merchantUid") String merchantUid);
}
