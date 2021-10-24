package com.filmdamoa.backend.payment;

import com.filmdamoa.backend.auth.Member;
import com.filmdamoa.backend.movie.Movie;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import javax.persistence.CollectionTable;
import javax.persistence.Column;
import javax.persistence.ElementCollection;
import javax.persistence.Embeddable;
import javax.persistence.Entity;
import javax.persistence.FetchType;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.JoinColumn;
import javax.persistence.ManyToOne;
import javax.persistence.OrderColumn;
import javax.persistence.Table;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "payment")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Payment {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	private String impUid;
	
	@Column(nullable = false)
	private String merchantUid;
	
	@Column(nullable = false)
	private String scheduleNumber;
	
	@Column(nullable = false)
	private String branchNumber;
	
	@Column(nullable = false)
	private String playKindName;
	
	@Column(nullable = false)
	private String branchName;
	
	@Column(nullable = false)
	private String theabExpoName;
	
	@Column(nullable = false)
	private String playDeAndDow;
	
	@Column(nullable = false)
	private String playTime;
	
	@ElementCollection(fetch = FetchType.LAZY)
	@CollectionTable(name = "audience", joinColumns = @JoinColumn(name = "payment_id"))
	@OrderColumn
	private List<Audience> audiences = new ArrayList<>();
	
	@ElementCollection(fetch = FetchType.LAZY)
	@CollectionTable(name = "selection", joinColumns = @JoinColumn(name = "payment_id"))
	@OrderColumn
	private List<Selection> selections = new ArrayList<>();
	
	@Column(nullable = false)
	private Integer amount;
	
	@Column(nullable = false)
	private PaymentState paymentState;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
	@CreationTimestamp
	private OffsetDateTime paymentDateTime;
	
	@Column(columnDefinition = "TIMESTAMP WITH TIME ZONE")
	private OffsetDateTime refundDateTime;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="movie_id")
	private Movie movie;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name="member_id")
	private Member member;
	
	@Builder
	private Payment(Long id, String impUid, String merchantUid, String scheduleNumber, String branchNumber,
					String playKindName, String branchName, String theabExpoName, String playDeAndDow, String playTime,
					List<Audience> audiences, List<Selection> selections, Integer amount, PaymentState paymentState,
					OffsetDateTime paymentDateTime, OffsetDateTime refundDateTime, Movie movie, Member member) {
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
		this.movie = movie;
		this.member = member;
	}
	
	public void change(Payment newPayment) {
		this.id = newPayment.getId();
		this.impUid = newPayment.getImpUid();
		this.merchantUid = newPayment.getMerchantUid();
		this.scheduleNumber = newPayment.getScheduleNumber();
		this.branchNumber = newPayment.getBranchNumber();
		this.playKindName = newPayment.getPlayKindName();
		this.branchName = newPayment.getBranchName();
		this.theabExpoName = newPayment.getTheabExpoName();
		this.playDeAndDow = newPayment.getPlayDeAndDow();
		this.playTime = newPayment.getPlayTime();
		this.audiences = newPayment.getAudiences();
		this.selections = newPayment.getSelections();
		this.amount = newPayment.getAmount();
		this.paymentState = newPayment.getPaymentState();
		this.paymentDateTime = newPayment.getPaymentDateTime();
		this.refundDateTime = newPayment.getRefundDateTime();
		this.movie = newPayment.getMovie();
		this.member = newPayment.getMember();
	}
	
	@Embeddable
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	public static class Audience {
		@Column(nullable = false)
		private String category;
		
		@Column(nullable = false)
		private Short count;
		
		@Builder
		private Audience(String category, Short count) {
			this.category = category;
			this.count = count;
		}
	}
	
	@Embeddable
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	public static class Selection {
		@Column(nullable = false)
		private String seatName;
		
		@Column(nullable = false)
		private String seatUniqueNumber;
		
		@Builder
		private Selection(String seatName, String seatUniqueNumber) {
			this.seatName = seatName;
			this.seatUniqueNumber = seatUniqueNumber;
		}
	}
}
