package com.kiloe.controller.api;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kiloe.dto.EventResponse;
import com.kiloe.entity.Venue;
import com.kiloe.service.EventService;
import com.kiloe.service.VenueService;

@RestController
@RequestMapping("/api/public")
public class PublicApiController {
	
	private final EventService eventService;
	private final VenueService venueService;
	
	public PublicApiController(
			EventService eventService,
			VenueService venueService) {
		this.eventService = eventService;
		this.venueService = venueService;
	}
	
	@GetMapping("/events")
	public List<EventResponse> getPublishedEvents() {
		return eventService.findByPublished()
				.stream()
				.filter(event -> !hasStarted(event))
				.toList();
	}
	
	@GetMapping("/events/{id}")
	public ResponseEntity<EventResponse> getEvent(@PathVariable Long id) {
		EventResponse event;
		try {
			event = eventService.findById(id);
		} catch (IllegalArgumentException ex) {
			return ResponseEntity.notFound().build();
		}
		
		if(!event.published() || hasStarted(event)) {
			return ResponseEntity.notFound().build();
		}
		
		return ResponseEntity.ok(event);
	}
	
	@GetMapping("/venues")
	public List<Venue> getVenues() {
		return venueService.findAllVenues();
	}
	
	private boolean hasStarted(EventResponse event) {
		if(event.startTime() == null) {
			return event.eventDate().isBefore(LocalDate.now());
		}
		return LocalDateTime.of(event.eventDate(), event.startTime()).isBefore(LocalDateTime.now());
	}
}
