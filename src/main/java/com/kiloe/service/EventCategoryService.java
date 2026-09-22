package com.kiloe.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kiloe.entity.EventCategory;
import com.kiloe.exception.DuplicateResourceException;
import com.kiloe.exception.ResourceNotFoundException;
import com.kiloe.repository.EventCategoryRepository;

@Service
@Transactional
public class EventCategoryService {

	private final EventCategoryRepository eventCategoryRepository;

	public EventCategoryService(EventCategoryRepository eventCategoryRepository) {
		this.eventCategoryRepository = eventCategoryRepository;
	}
	
	@Transactional
	public List<EventCategory> findAllCategories() {
		return eventCategoryRepository.findAll();
	}
	
	@Transactional
	public EventCategory findCategoryById(Long id) {
		return eventCategoryRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
	}
	
	public EventCategory createCategory(EventCategory category) {
		String name = category.getName().trim();
		
		if(eventCategoryRepository.existsByName(name)) {
			throw new DuplicateResourceException("Category already exists with name: " + category.getName());
		}
		category.setName(name);
		return eventCategoryRepository.save(category);
	}
	
	public EventCategory updateCategory(Long id, EventCategory newCategory) {
		String name = newCategory.getName().trim();
		
		EventCategory foundCategory = eventCategoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
		
		if(eventCategoryRepository.existsByNameAndIdNot(name, id)) {
			throw new DuplicateResourceException("Category already exists with name: " + name);
		}
		
		foundCategory.setName(name);
		return eventCategoryRepository.save(foundCategory);
	}
	
	public void deleteCategory(Long id) {
		EventCategory foundCategory = eventCategoryRepository.findById(id)
				.orElseThrow(() -> new ResourceNotFoundException("Category not found with ID: " + id));
		
		eventCategoryRepository.delete(foundCategory);
	}
}
