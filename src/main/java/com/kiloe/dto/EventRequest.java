package com.kiloe.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record EventRequest(
		@NotBlank @Size(max = 200) String title,
		@Size(max = 5000) String description,
		@NotNull LocalDate eventDate,
		@NotNull LocalTime startTime,
		@NotNull @PositiveOrZero BigDecimal ticketPrice,
		@NotNull @Positive Integer totalTickets,
		@Size(max = 500) String imageUrl,
		boolean published,
		@NotNull Long categoryId,
		@NotNull Long venueId) {
}