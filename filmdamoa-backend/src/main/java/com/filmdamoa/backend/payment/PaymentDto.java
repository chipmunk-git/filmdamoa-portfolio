package com.filmdamoa.backend.payment;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PaymentDto {
	private Long id;
	private String impUid;
	private String merchantUid;
	private String scheduleNumber;
	private String branchNumber;
	private String playKindName;
	private String branchName;
	private String theabExpoName;
	private String playDeAndDow;
	private String playTime;
	private List<AudienceDto> audiences = new ArrayList<>();
	private List<SelectionDto> selections = new ArrayList<>();
	private Integer amount;
	private PaymentState paymentState;
	private OffsetDateTime paymentDateTime;
	private OffsetDateTime refundDateTime;
	private Long movieId;
	private String movieName;
	private Long memberId;
	private String username;
	
	@Builder
	private PaymentDto(Long id, String impUid, String merchantUid, String scheduleNumber, String branchNumber, String playKindName,
					   String branchName, String theabExpoName, String playDeAndDow, String playTime, List<AudienceDto> audiences,
					   List<SelectionDto> selections, Integer amount, PaymentState paymentState, OffsetDateTime paymentDateTime,
					   OffsetDateTime refundDateTime, Long movieId, String movieName, Long memberId, String username) {
		this.id = id;
		this.impUid = impUid;
		this.merchantUid = merchantUid;
		this.scheduleNumber = scheduleNumber;
		this.branchNumber = branchNumber;
		this.playKindName = playKindName;
		this.branchName = branchName;
		this.theabExpoName = theabExpoName;
		this.playDeAndDow = playDeAndDow;
		this.playTime = playTime;
		this.audiences = audiences;
		this.selections = selections;
		this.amount = amount;
		this.paymentState = paymentState;
		this.paymentDateTime = paymentDateTime;
		this.refundDateTime = refundDateTime;
		this.movieId = movieId;
		this.movieName = movieName;
		this.memberId = memberId;
		this.username = username;
	}
	
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	public static class AudienceDto {
		private String category;
		private Short count;
		
		@Builder
		private AudienceDto(String category, Short count) {
			this.category = category;
			this.count = count;
		}
	}
	
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	public static class SelectionDto {
		private String seatName;
		private String seatUniqueNumber;
		
		@Builder
		private SelectionDto(String seatName, String seatUniqueNumber) {
			this.seatName = seatName;
			this.seatUniqueNumber = seatUniqueNumber;
		}
	}
}
