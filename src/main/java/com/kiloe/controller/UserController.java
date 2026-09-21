package com.kiloe.controller;

import com.kiloe.dto.RegisterRequest;
import com.kiloe.service.UserService;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class UserController {

	private final UserService userService;

	public UserController(UserService userService) {
		this.userService = userService;
	}

	@GetMapping("/login")
	public String loginPage() {
		return "auth/login";
	}

	@GetMapping("/register")
	public String registerPage(Model model) {
		model.addAttribute("registerRequest", new RegisterRequest("", "", "", ""));
		return "auth/register";
	}

	@PostMapping("/register")
	public String register(@ModelAttribute RegisterRequest request, Model model) {
		try {
			userService.register(request);
			return "redirect:/login?registered=true";
			
		} catch (IllegalStateException | IllegalArgumentException exception) {
			model.addAttribute("error", exception.getMessage());
			model.addAttribute("registerRequest", request);
			return "auth/register";
		}
	}
}
