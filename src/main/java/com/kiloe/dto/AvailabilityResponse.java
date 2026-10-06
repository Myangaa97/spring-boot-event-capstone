package com.kiloe.dto;

public record AvailabilityResponse(
		Long eventId,
		Integer availableTickets,
		Integer totalTickets) {
}
