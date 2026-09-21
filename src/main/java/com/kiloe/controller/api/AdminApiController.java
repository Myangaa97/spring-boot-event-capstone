package com.kiloe.controller.api;

import com.kiloe.dto.EventRequest;
import com.kiloe.dto.EventResponse;
import com.kiloe.service.EventService;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.kiloe.entity.EventCategory;
import com.kiloe.entity.Venue;
import com.kiloe.service.EventCategoryService;
import com.kiloe.service.VenueService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {

	private final EventService eventService;
	private final EventCategoryService eventCategoryService;
	private final VenueService venueService;

	public AdminApiController(
			EventCategoryService eventCategoryService,
			VenueService venueService,
			EventService eventService) {
		this.eventCategoryService = eventCategoryService;
		this.venueService = venueService;
		this.eventService = eventService;
	}

	// ------------ CATEGORIES ------------
	@GetMapping("/categories")
	public List<EventCategory> findAll() {
		return eventCategoryService.findAllCategories();
	}

	@PostMapping("/categories")
	@ResponseStatus(HttpStatus.CREATED)
	public EventCategory create(@RequestBody EventCategory category) {
		return eventCategoryService.createCategory(category);
	}

	@GetMapping("/categories/{id}")
	public EventCategory findById(@PathVariable Long id) {
		return eventCategoryService.findCategoryById(id);
	}

	@PutMapping("/categories/{id}")
	public EventCategory update(@PathVariable Long id, @RequestBody EventCategory category) {
		return eventCategoryService.updateCategory(id, category);
	}

	@DeleteMapping("/categories/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void delete(@PathVariable Long id) {
		eventCategoryService.deleteCategory(id);
	}

	// ------------ VENUES ------------
	@GetMapping("/venues")
	public List<Venue> allVenues() {
		return venueService.findAllVenues();
	}

	@PostMapping("/venues")
	@ResponseStatus(HttpStatus.CREATED)
	public Venue create(@RequestBody Venue venue) throws IllegalAccessException {
		return venueService.createVenue(venue);
	}

	@GetMapping("/venues/{id}")
	public Venue findVenueById(@PathVariable Long id) {
		return venueService.findVenueById(id);
	}

	@PutMapping("/venues/{id}")
	public Venue updateVenue(@PathVariable Long id, @RequestBody Venue venue) {
		return venueService.updateVenue(id, venue);
	}

	@DeleteMapping("/venues/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteVenue(@PathVariable Long id) {
		venueService.deleteVenue(id);
	}

	// ------------ EVENTS ------------
	@GetMapping("/events")
	public List<EventResponse> allEvents() {
		return eventService.findAllEvents();
	}

	@PostMapping("/events")
	@ResponseStatus(HttpStatus.CREATED)
	public EventResponse create(@Valid @RequestBody EventRequest request) {
		return eventService.create(request);
	}

	@GetMapping("/events/{id}")
	public EventResponse findEventById(@PathVariable Long id) {
		return eventService.findById(id);
	}

	@PutMapping("/events/{id}")
	public EventResponse update(@PathVariable Long id, @Valid @RequestBody EventRequest request) {
		return eventService.update(id, request);
	}

	@DeleteMapping("/events/{id}")
	@ResponseStatus(HttpStatus.NO_CONTENT)
	public void deleteById(@PathVariable Long id) {
		eventService.delete(id);
	}
}