package com.kiloe.controller;

import com.kiloe.service.EventCategoryService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/admin")
public class AdminController {
	
	private final EventCategoryService eventCategoryService;

	public AdminController(EventCategoryService eventCategoryService) {
		this.eventCategoryService = eventCategoryService;
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
}
