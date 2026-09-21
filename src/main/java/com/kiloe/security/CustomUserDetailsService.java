package com.kiloe.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.kiloe.entity.User;
import com.kiloe.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

	private final UserRepository userRepository;

	public CustomUserDetailsService(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		User user = userRepository.findByEmail(email.toLowerCase().trim())
				.orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

		return org.springframework.security.core.userdetails.User.builder()
				.username(user.getEmail())
				.password(user.getPassword())
				.authorities(user.getRole().name())
				.disabled(!user.isEnabled())
				.build();
	}
}