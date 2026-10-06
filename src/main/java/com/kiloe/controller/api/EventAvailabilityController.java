package com.kiloe.controller.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.kiloe.dto.AvailabilityResponse;
import com.kiloe.exception.ResourceNotFoundException;
import com.kiloe.service.EventService;

@RestController
@RequestMapping("/api/events")
public class EventAvailabilityController {

	private final EventService eventService;

	public EventAvailabilityController(EventService eventService) {
		this.eventService = eventService;
	}

	@GetMapping("/{id}/availability")
	public ResponseEntity<AvailabilityResponse> getAvailability(@PathVariable Long id) {
		try {
			return ResponseEntity.ok(eventService.findAvailability(id));
		} catch (ResourceNotFoundException ex) {
			return ResponseEntity.notFound().build();
		}
	}
}
