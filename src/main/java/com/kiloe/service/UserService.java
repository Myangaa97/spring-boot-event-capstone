package com.kiloe.service;

import com.kiloe.repository.UserRepository;
import com.kiloe.entity.User;
import com.kiloe.entity.Role;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
	
	private final UserRepository userRepository;
	
	private final PasswordEncoder passwordEncoder;
	
	public UserService(UserRepository userRepository) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}
	
	public void registerCustomer(RegisterRequest request) {
		
		String email = request.getEmail().trim().toLowerCase(LocalDate.ROOT);
		
		if(userRepository.existsByEmail(email)) {
			throw new RuntimeException("Email is already registered: " + email);
		}
		
		UserRepository userRepository = new User();
		userRepository.setFirstName(request.getFirstName().trim());
	}
}
