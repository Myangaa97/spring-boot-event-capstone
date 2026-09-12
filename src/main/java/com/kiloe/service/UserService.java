package com.kiloe.service;

import com.kiloe.entity.User;
import com.kiloe.entity.Role;
import com.kiloe.repository.UserRepository;
import com.kiloe.dto.RegisterRequest;


import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
	
	private final UserRepository userRepository;
	
	private final PasswordEncoder passwordEncoder;
	
	public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}
	
	public User register(RegisterRequest request) {
		
		String email = request.email().toLowerCase().trim();
		
		if(userRepository.existsByEmail(email)) {
			throw new IllegalStateException("Email is already registered");
		}
		
		User user = new User();
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setEmail(email);
		user.setPassword(passwordEncoder.encode(request.password()));
		user.setRole(Role.CUSTOMER);
		user.setEnabled(true);
		return userRepository.save(user);
	}
}
