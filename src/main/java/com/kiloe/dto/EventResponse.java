package com.kiloe.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record EventResponse(
		Long id,
		String title,
		String description,
		LocalDate eventDate,
		LocalTime startTime,
		BigDecimal ticketPrice,
		Integer totalTickets,
		Integer availableTickets,
		boolean published,
		String imageUrl,
		Long categoryId,
		String categoryName,
		Long venueId,
		String venueName) {
}