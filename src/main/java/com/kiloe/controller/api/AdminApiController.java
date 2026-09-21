package com.kiloe.controller.api;

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
import com.kiloe.service.EventCategoryService;

@RestController
@RequestMapping("/api/admin")
public class AdminApiController {
	
	private final EventCategoryService eventCategoryService;

	public AdminApiController(EventCategoryService eventCategoryService) {
		this.eventCategoryService = eventCategoryService;
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
	
}
