package com.filmdamoa.backend.payment;

import com.fasterxml.jackson.databind.PropertyNamingStrategy;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Date;

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@JsonNaming(value = PropertyNamingStrategy.SnakeCaseStrategy.class)
public class PaymentData {
	private String impUid;
	private String merchantUid;
	private String payMethod;
	private String channel;
	private String pgProvider;
	private String pgTid;
	private boolean escrow;
	private String applyNum;
	private String bankCode;
	private String bankName;
	private String cardCode;
	private String cardName;
	private String cardNumber;
	private int cardQuota;
	private int cardType;
	private String vbankCode;
	private String vbankName;
	private String vbankNum;
	private String vbankHolder;
	private long vbankDate;
	private long vbankIssuedAt;
	private String name;
	private BigDecimal amount;
	private BigDecimal cancelAmount;
	private String currency;
	private String buyerName;
	private String buyerEmail;
	private String buyerTel;
	private String buyerAddr;
	private String buyerPostcode;
	private String customData;
	private String status;
	private long startedAt;
	private long paidAt;
	private long failedAt;
	private long cancelledAt;
	private String failReason;
	private String cancelReason;
	private String receiptUrl;
	private PaymentCancelDetail[] cancelHistory;
	private boolean cashReceiptIssued;
	private String customerUid;
	private String customerUidUsage;
	
	@Builder
	private PaymentData(String impUid, String merchantUid, String payMethod, String channel, String pgProvider, String pgTid, boolean escrow, String applyNum,
						String bankCode, String bankName, String cardCode, String cardName, String cardNumber, int cardQuota, int cardType, String vbankCode,
						String vbankName, String vbankNum, String vbankHolder, long vbankDate, long vbankIssuedAt, String name, BigDecimal amount,
						BigDecimal cancelAmount, String currency, String buyerName, String buyerEmail, String buyerTel, String buyerAddr, String buyerPostcode,
						String customData, String status, long startedAt, long paidAt, long failedAt, long cancelledAt, String failReason, String cancelReason,
						String receiptUrl, PaymentCancelDetail[] cancelHistory, boolean cashReceiptIssued, String customerUid, String customerUidUsage) {
		this.impUid = impUid;
		this.merchantUid = merchantUid;
		this.payMethod = payMethod;
		this.channel = channel;
		this.pgProvider = pgProvider;
		this.pgTid = pgTid;
		this.escrow = escrow;
		this.applyNum = applyNum;
		this.bankCode = bankCode;
		this.bankName = bankName;
		this.cardCode = cardCode;
		this.cardName = cardName;
		this.cardNumber = cardNumber;
		this.cardQuota = cardQuota;
		this.cardType = cardType;
		this.vbankCode = vbankCode;
		this.vbankName = vbankName;
		this.vbankNum = vbankNum;
		this.vbankHolder = vbankHolder;
		this.vbankDate = vbankDate;
		this.vbankIssuedAt = vbankIssuedAt;
		this.name = name;
		this.amount = amount;
		this.cancelAmount = cancelAmount;
		this.currency = currency;
		this.buyerName = buyerName;
		this.buyerEmail = buyerEmail;
		this.buyerTel = buyerTel;
		this.buyerAddr = buyerAddr;
		this.buyerPostcode = buyerPostcode;
		this.customData = customData;
		this.status = status;
		this.startedAt = startedAt;
		this.paidAt = paidAt;
		this.failedAt = failedAt;
		this.cancelledAt = cancelledAt;
		this.failReason = failReason;
		this.cancelReason = cancelReason;
		this.receiptUrl = receiptUrl;
		this.cancelHistory = cancelHistory;
		this.cashReceiptIssued = cashReceiptIssued;
		this.customerUid = customerUid;
		this.customerUidUsage = customerUidUsage;
	}
	
	public Date getVbankDate() {
		return new Date(vbankDate * 1000L);
	}
	
	public Date getPaidAt() {
		return new Date(paidAt * 1000L);
	}
	
	public Date getFailedAt() {
		return new Date(failedAt * 1000L);
	}
	
	public Date getCancelledAt() {
		return new Date(cancelledAt * 1000L);
	}
	
	@Getter
	@NoArgsConstructor(access = AccessLevel.PROTECTED)
	@JsonNaming(value = PropertyNamingStrategy.SnakeCaseStrategy.class)
	public static class PaymentCancelDetail {
		private String pgTid;
		private BigDecimal amount;
		private long cancelledAt;
		private String reason;
		private String receiptUrl;
		
		@Builder
		private PaymentCancelDetail(String pgTid, BigDecimal amount, long cancelledAt, String reason, String receiptUrl) {
			this.pgTid = pgTid;
			this.amount = amount;
			this.cancelledAt = cancelledAt;
			this.reason = reason;
			this.receiptUrl = receiptUrl;
		}
	}
}
