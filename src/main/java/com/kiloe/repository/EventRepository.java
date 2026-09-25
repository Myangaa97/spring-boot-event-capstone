package com.kiloe.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import com.kiloe.entity.Event;
import com.kiloe.entity.EventCategory;
import com.kiloe.entity.Venue;

public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {
	
	List<Event> findByCategoryAndPublishedTrueOrderByEventDateAsc(EventCategory category);
	
	List<Event> findByPublishedTrueAndEventDateGreaterThanEqualOrderByEventDateAsc(LocalDate date);
	
	List<Event> findAllByOrderByEventDateDesc();
	
	List<Event> findByVenue(Venue venue);
	
	boolean existsByCategoryId(Long categoryId);
	
	boolean existsByVenueId(Long venueId);
}
