package com.kiloe.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
		http
			.authorizeHttpRequests(auth -> auth
					.requestMatchers("/", "/login", "/register", "/css/**", "/js/**", "/images/**").permitAll()
					.requestMatchers("/admin/**").hasRole("ADMIN")
					.requestMatchers("/customer/**").hasRole("CUSTOMER")
					.anyRequest().authenticated())
			
			.formLogin(form -> form
					.loginPage("/login")
					.permitAll())
			
			.logout(logout -> logout
					.logoutUrl("/logout")
					.logoutSuccessUrl("/login?logout=true")
					.permitAll());
		
		return http.build();
	}
}
