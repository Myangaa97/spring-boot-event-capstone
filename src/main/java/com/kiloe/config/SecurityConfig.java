package com.kiloe.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import com.kiloe.security.LoginSuccessHandler;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
	@Bean
	PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
	
	@Bean
	SecurityFilterChain securityFilterChain(HttpSecurity http, LoginSuccessHandler successHandler) throws Exception {
		http
			.authorizeHttpRequests(auth -> auth
					.requestMatchers("/", "/login", "/register", "/css/**", "/js/**", "/images/**").permitAll()
					.requestMatchers("/api/admin/**", "/admin/**").hasRole("ADMIN")
					.requestMatchers("/customer/**").hasRole("CUSTOMER")
					.anyRequest().authenticated())
			
			.formLogin(form -> form
					.loginPage("/login")
					.successHandler(successHandler)
					.permitAll())
			
			.logout(logout -> logout
					.logoutUrl("/logout")
					.logoutSuccessUrl("/login?logout=true")
					.permitAll());
		
		return http.build();
	}
}
