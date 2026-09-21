package com.kiloe.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kiloe.dto.EventRequest;
import com.kiloe.dto.EventResponse;
import com.kiloe.entity.Event;
import com.kiloe.entity.EventCategory;
import com.kiloe.entity.Venue;
import com.kiloe.repository.EventCategoryRepository;
import com.kiloe.repository.EventRepository;
import com.kiloe.repository.VenueRepository;

@Service
@Transactional
public class EventService {

	private final EventRepository eventRepository;
	private final EventCategoryRepository eventCategoryRepository;
	private final VenueRepository venueRepository;

	public EventService(EventRepository eventRepository,
			EventCategoryRepository eventCategoryRepository,
			VenueRepository venueRepository) {
		this.eventRepository = eventRepository;
		this.eventCategoryRepository = eventCategoryRepository;
		this.venueRepository = venueRepository;
	}

	@Transactional
	public List<EventResponse> findByPublished() {
		return eventRepository
				.findByPublishedTrueAndEventDateGreaterThanEqualOrderByEventDateAsc(java.time.LocalDate.now())
				.stream()
				.filter(e -> !hasStarted(e))
				.map(this::toResponse)
				.toList();
	}

	public boolean hasStarted(Event event) {
		if (event.getStartTime() == null) {
			return event.getEventDate().isBefore(java.time.LocalDate.now());
		}
		return java.time.LocalDateTime.of(event.getEventDate(), event.getStartTime())
				.isBefore(java.time.LocalDateTime.now());
	}

	@Transactional
	public List<EventResponse> findAllEvents() {
		return eventRepository.findAllByOrderByEventDateDesc()
				.stream()
				.map(this::toResponse)
				.toList();
	}

	@Transactional
	public EventResponse findById(Long id) {
		Event event = eventRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));
		return toResponse(event);
	}

	public EventResponse create(EventRequest request) {
		EventCategory category = eventCategoryRepository.findById(request.categoryId())
				.orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.categoryId()));
		Venue venue = venueRepository.findById(request.venueId())
				.orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + request.venueId()));

		Event event = new Event();
		apply(event, request, category, venue);
		event.setAvailableTickets(event.getTotalTickets());
		return toResponse(eventRepository.save(event));
	}

	public EventResponse update(Long id, EventRequest request) {
		Event event = eventRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Event not found with ID: " + id));
		EventCategory category = eventCategoryRepository.findById(request.categoryId())
				.orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.categoryId()));
		Venue venue = venueRepository.findById(request.venueId())
				.orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + request.venueId()));

		apply(event, request, category, venue);

		int available = event.getAvailableTickets() == null ? event.getTotalTickets() : event.getAvailableTickets();
		int sold = Math.max(0, event.getTotalTickets() - available);
		event.setAvailableTickets(Math.max(0, event.getTotalTickets() - sold));
		return toResponse(eventRepository.save(event));
	}

	public void delete(Long id) {
		eventRepository.deleteById(id);
	}

	private void apply(Event event, EventRequest request, EventCategory category, Venue venue) {
		event.setTitle(request.title().trim());
		event.setDescription(request.description());
		event.setEventDate(request.eventDate());
		event.setStartTime(request.startTime());
		event.setTicketPrice(request.ticketPrice());
		event.setTotalTickets(request.totalTickets());
		event.setPublished(request.published());
		event.setImageUrl(request.imageUrl());
		event.setCategory(category);
		event.setVenue(venue);
	}

	private EventResponse toResponse(Event event) {
		return new EventResponse(
				event.getId(),
				event.getTitle(),
				event.getDescription(),
				event.getEventDate(),
				event.getStartTime(),
				event.getTicketPrice(),
				event.getTotalTickets(),
				event.getAvailableTickets(),
				event.isPublished(),
				event.getImageUrl(),
				event.getCategory() != null ? event.getCategory().getId() : null,
				event.getCategory() != null ? event.getCategory().getName() : null,
				event.getVenue() != null ? event.getVenue().getId() : null,
				event.getVenue() != null ? event.getVenue().getName() : null);
	}
}