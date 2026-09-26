package com.kiloe.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.kiloe.entity.Booking;
import com.kiloe.entity.User;

public interface BookingRepository extends JpaRepository<Booking, Long> {
	
	List<Booking> findByUserOrOrderByCreatedAtDesc(User user);
	
	List<Booking> findAllByOrderByCreatedAtDesc();
	
	boolean existsByEventId(Long eventId);
}
