package com.kiloe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kiloe.entity.Event;
import com.kiloe.entity.EventCategory;
import com.kiloe.entity.Venue;

public interface EventRepository extends JpaRepository<Event, Long> {
	
	List<Event> findByCategoryAndPublishedTrueOrderByEventDateAsc(EventCategory category);
	
	List<Event> findByVenue(Venue venue);
	
	boolean existsByCategoryId(Long categoryId);
	
	boolean existsByVenueId(Long venueId);
}
