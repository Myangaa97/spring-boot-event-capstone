package com.kiloe.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kiloe.entity.Venue;

public interface VenueRepository extends JpaRepository<Venue, Long> {
	
	boolean existsByName(String name);

	boolean existsByNameAndIdNot(String name, Long id);
}
