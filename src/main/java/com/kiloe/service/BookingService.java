package com.kiloe.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kiloe.entity.Booking;
import com.kiloe.entity.BookingStatus;
import com.kiloe.entity.Event;
import com.kiloe.entity.User;
import com.kiloe.exception.BusinessRuleException;
import com.kiloe.repository.BookingRepository;
import com.kiloe.repository.EventRepository;


@Service
@Transactional
public class BookingService {
	
	private final BookingRepository bookingRepository;
	private final EventRepository eventRepository;
	private final EventService eventService;
	
	public BookingService(
			BookingRepository bookingRepository,
			EventRepository eventRepository,
			EventService eventService) {
		this.bookingRepository = bookingRepository;
		this.eventRepository = eventRepository;
		this.eventService = eventService;
	}
	
	public Booking book(User user, Long eventId, int ticketQuantity) {
		if (ticketQuantity < 1 || ticketQuantity > 10) {
			throw new IllegalArgumentException("Ticket quantity must be between 1 and 10");
		}
		
		Event event = eventRepository.findById(eventId)
				.orElseThrow(() -> new IllegalArgumentException("Event not found " + eventId));
		
		if (!event.isPublished()) {
			throw new IllegalStateException("Event is not published");
		}
		
		if (eventService.hasStarted(event)) {
			throw new IllegalStateException("This event has already started or ended");
		}
		
		if (event.getAvailableTickets() < ticketQuantity) {
			throw new BusinessRuleException("Not enough ticket available");
		}
		
		event.setAvailableTickets(event.getAvailableTickets() - ticketQuantity);
		BigDecimal totalPrice = event.getTicketPrice().multiply(BigDecimal.valueOf(ticketQuantity));
		
		Booking booking = new Booking();
		booking.setUser(user);
		booking.setEvent(event);
		booking.setTicketQuantity(ticketQuantity);
		booking.setUnitPrice(event.getTicketPrice());
		booking.setTotalPrice(totalPrice);
		booking.setStatus(BookingStatus.CONFIRMED);
		booking.setCreatedAt(LocalDateTime.now());
		
		return bookingRepository.save(booking);	
	}
	
}
