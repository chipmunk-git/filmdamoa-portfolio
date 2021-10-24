package com.filmdamoa.backend.payment;

import java.util.stream.Stream;

import javax.persistence.AttributeConverter;
import javax.persistence.Converter;

@Converter(autoApply = true)
public class PaymentStateConverter implements AttributeConverter<PaymentState, String> {
	// 코드 출처: https://www.baeldung.com/jpa-persisting-enums-in-jpa 기반
	@Override
	public String convertToDatabaseColumn(PaymentState paymentState) {
		if (paymentState == null) {
			return null;
		}
		
		return paymentState.getState();
	}
	
	@Override
	public PaymentState convertToEntityAttribute(String state) {
		if (state == null) {
			return null;
		}
		
		return Stream.of(PaymentState.values())
				.filter(p -> p.getState().equals(state))
				.findFirst()
				.orElseThrow(IllegalArgumentException::new);
	}
}
