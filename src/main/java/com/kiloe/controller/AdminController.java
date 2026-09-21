package com.kiloe.controller;

import com.kiloe.service.EventCategoryService;
import com.kiloe.service.EventService;
import com.kiloe.service.VenueService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {
	
	private final EventCategoryService eventCategoryService;
	private final VenueService venueService;
	private final EventService eventService;

	public AdminController(
			EventCategoryService eventCategoryService,
			VenueService venueService,
			EventService eventService) {
		this.eventCategoryService = eventCategoryService;
		this.venueService = venueService;
		this.eventService = eventService;
	}

	@GetMapping("/dashboard")
	public String dashboard(Model model) {
		return "admin/dashboard";
	}
	
	@GetMapping("/categories")
	public String categories(Model model) {
		model.addAttribute("categories", eventCategoryService.findAllCategories());
		return "admin/categories";
	}
	
	@GetMapping("/venues")
	public String venues(Model model) {
		model.addAttribute("venues", venueService.findAllVenues());
		return "admin/venues";
	}
	
	@GetMapping("/events")
	public String events(Model model) {
		model.addAttribute("events", eventService.findAllEvents());
		return "admin/events";
	}
}
