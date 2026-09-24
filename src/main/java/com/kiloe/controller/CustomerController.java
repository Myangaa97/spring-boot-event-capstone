package com.kiloe.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import com.kiloe.service.EventService;

@Controller
@RequestMapping("/customer")
public class CustomerController {
	
	private final EventService eventService;
	
	public CustomerController(EventService eventService) {
		super();
		this.eventService = eventService;
	}

	@GetMapping("/dashboard")
	public String dashboard(Model model) {
		return "customer/dashboard";
	}
	
	@GetMapping("/events")
	public String event(Model model) {
		model.addAttribute("events", eventService.findByPublished());
		return "customer/events";
	}
	
	@GetMapping("/events/{id}")
	public String eventDetail(@PathVariable Long id, Model model) {
		model.addAttribute("event", eventService.findById(id));
		return "customer/event-detail";
	}
}
