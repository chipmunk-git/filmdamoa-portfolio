package com.filmdamoa.backend.payment;

import com.fasterxml.jackson.annotation.JsonValue;
import lombok.Getter;

@Getter
public enum PaymentState {
	// 결제의 상태를 설정하는 Enum
	COMPLETE_PAYMENT("결제 완료"),
	INCOMPLETE_PAYMENT("결제 미완료"),
	REFUNDED_PAYMENT("환불됨"),
	DELETED_PAYMENT("삭제됨");
	
	@JsonValue
	private String state;
	
	private PaymentState(String state) {
		this.state = state;
	}
}
