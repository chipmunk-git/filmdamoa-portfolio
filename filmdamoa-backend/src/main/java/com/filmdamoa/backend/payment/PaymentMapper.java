package com.filmdamoa.backend.payment;

import com.filmdamoa.backend.auth.Member;
import com.filmdamoa.backend.movie.Movie;
import com.filmdamoa.backend.payment.Payment.PaymentBuilder;
import com.filmdamoa.backend.payment.PaymentDto.PaymentDtoBuilder;

import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

@Component
public class PaymentMapper {
	public Payment toEntity(PaymentDto dto) {
		return toEntityEssence(dto, null, null, null, null);
	}
	
	public Payment toEntity(PaymentDto dto, Long id, OffsetDateTime paymentDateTime, Long movieId, Long memberId) {
		return toEntityEssence(dto, id, paymentDateTime, movieId, memberId);
	}
	
	private Payment toEntityEssence(PaymentDto dto, Long id, OffsetDateTime paymentDateTime, Long movieId, Long memberId) {
		if (dto == null) {
			return null;
		}
		
		PaymentBuilder payment = Payment.builder();
		
		payment.id(id == null ? dto.getId() : id);
		payment.impUid(dto.getImpUid());
		payment.merchantUid(dto.getMerchantUid());
		payment.scheduleNumber(dto.getScheduleNumber());
		payment.branchNumber(dto.getBranchNumber());
		payment.playKindName(dto.getPlayKindName());
		payment.branchName(dto.getBranchName());
		payment.theabExpoName(dto.getTheabExpoName());
		payment.playDeAndDow(dto.getPlayDeAndDow());
		payment.playTime(dto.getPlayTime());
		payment.audiences(dtoAudiencesToEntity(dto.getAudiences()));
		payment.selections(dtoSelectionsToEntity(dto.getSelections()));
		payment.amount(dto.getAmount());
		payment.paymentState(dto.getPaymentState());
		payment.paymentDateTime(paymentDateTime == null ? dto.getPaymentDateTime() : paymentDateTime);
		payment.refundDateTime(dto.getRefundDateTime());
		payment.movie(Movie.builder().id(movieId == null ? dto.getMovieId() : movieId).build());
		payment.member(Member.builder().id(memberId == null ? dto.getMemberId() : memberId).build());
		
		return payment.build();
	}
	
	private List<Payment.Audience> dtoAudiencesToEntity(List<PaymentDto.AudienceDto> audiences) {
		if (audiences == null) {
			return null;
		}
		
		List<Payment.Audience> list = new ArrayList<Payment.Audience>(audiences.size());
		for (PaymentDto.AudienceDto audience : audiences) {
			list.add(Payment.Audience.builder()
					.category(audience.getCategory())
					.count(audience.getCount())
					.build());
		}
		
		return list;
	}
	
	private List<Payment.Selection> dtoSelectionsToEntity(List<PaymentDto.SelectionDto> selections) {
		if (selections == null) {
			return null;
		}
		
		List<Payment.Selection> list = new ArrayList<Payment.Selection>(selections.size());
		for (PaymentDto.SelectionDto selection : selections) {
			list.add(Payment.Selection.builder()
					.seatName(selection.getSeatName())
					.seatUniqueNumber(selection.getSeatUniqueNumber())
					.build());
		}
		
		return list;
	}
	
	public PaymentDto toDto(Payment entity) {
		if (entity == null) {
			return null;
		}
		
		PaymentDtoBuilder paymentDto = PaymentDto.builder();
		
		paymentDto.id(entity.getId());
		paymentDto.impUid(entity.getImpUid());
		paymentDto.merchantUid(entity.getMerchantUid());
		paymentDto.scheduleNumber(entity.getScheduleNumber());
		paymentDto.branchNumber(entity.getBranchNumber());
		paymentDto.playKindName(entity.getPlayKindName());
		paymentDto.branchName(entity.getBranchName());
		paymentDto.theabExpoName(entity.getTheabExpoName());
		paymentDto.playDeAndDow(entity.getPlayDeAndDow());
		paymentDto.playTime(entity.getPlayTime());
		paymentDto.audiences(entityAudiencesToDto(entity.getAudiences()));
		paymentDto.selections(entitySelectionsToDto(entity.getSelections()));
		paymentDto.amount(entity.getAmount());
		paymentDto.paymentState(entity.getPaymentState());
		paymentDto.paymentDateTime(entity.getPaymentDateTime());
		paymentDto.refundDateTime(entity.getRefundDateTime());
		paymentDto.movieId(entityMovieId(entity));
		paymentDto.movieName(entityMovieMovieKoreanTitle(entity));
		paymentDto.memberId(entityMemberId(entity));
		paymentDto.username(entityMemberUsername(entity));
		
		return paymentDto.build();
	}
	
	public List<PaymentDto> toDtos(List<Payment> entities) {
		if (entities == null) {
			return null;
		}
		
		List<PaymentDto> list = new ArrayList<PaymentDto>(entities.size());
		for (Payment payment : entities) {
			list.add(toDto(payment));
		}
		
		return list;
	}
	
	private List<PaymentDto.AudienceDto> entityAudiencesToDto(List<Payment.Audience> audiences) {
		if (audiences == null) {
			return null;
		}
		
		List<PaymentDto.AudienceDto> list = new ArrayList<PaymentDto.AudienceDto>(audiences.size());
		for (Payment.Audience audience : audiences) {
			list.add(PaymentDto.AudienceDto.builder()
					.category(audience.getCategory())
					.count(audience.getCount())
					.build());
		}
		
		return list;
	}
	
	private List<PaymentDto.SelectionDto> entitySelectionsToDto(List<Payment.Selection> selections) {
		if (selections == null) {
			return null;
		}
		
		List<PaymentDto.SelectionDto> list = new ArrayList<PaymentDto.SelectionDto>(selections.size());
		for (Payment.Selection selection : selections) {
			list.add(PaymentDto.SelectionDto.builder()
					.seatName(selection.getSeatName())
					.seatUniqueNumber(selection.getSeatUniqueNumber())
					.build());
		}
		
		return list;
	}
	
	private Long entityMovieId(Payment payment) {
		if (payment == null) {
			return null;
		}
		
		Movie movie = payment.getMovie();
		if (movie == null) {
			return null;
		}
		
		Long id = movie.getId();
		if (id == null) {
			return null;
		}
		
		return id;
	}
	
	private String entityMovieMovieKoreanTitle(Payment payment) {
		if (payment == null) {
			return null;
		}
		
		Movie movie = payment.getMovie();
		if (movie == null) {
			return null;
		}
		
		String movieName = movie.getMovieKoreanTitle();
		if (movieName == null) {
			return null;
		}
		
		return movieName;
	}
	
	private Long entityMemberId(Payment payment) {
		if (payment == null) {
			return null;
		}
		
		Member member = payment.getMember();
		if (member == null) {
			return null;
		}
		
		Long id = member.getId();
		if (id == null) {
			return null;
		}
		
		return id;
	}
	
	private String entityMemberUsername(Payment payment) {
		if (payment == null) {
			return null;
		}
		
		Member member = payment.getMember();
		if (member == null) {
			return null;
		}
		
		String username = member.getUsername();
		if (username == null) {
			return null;
		}
		
		return username;
	}
}
