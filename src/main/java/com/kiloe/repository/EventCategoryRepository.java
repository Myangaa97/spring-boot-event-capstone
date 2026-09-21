package com.kiloe.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kiloe.entity.EventCategory;

public interface EventCategoryRepository extends JpaRepository<EventCategory, Long> {
	
	boolean existsByName(String name);
	
	boolean existsByNameAndIdNot(String name, Long id);
}
