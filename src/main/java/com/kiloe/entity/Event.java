package com.kiloe.entity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "events")
public class Event {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 200)
	private String title;
	
	@Column(columnDefinition = "TEXT")
	private String description;
	
	@Column(nullable = false)
	private LocalDate eventDate;
	
	@Column(nullable = false)
	private LocalTime startTime;
	
	@Column(nullable = false, precision = 10, scale = 2)
	private BigDecimal ticketPrice;
	
	@Column(nullable = false)
	private Integer totalTickets;
	
	@Column(nullable = false)
	private Integer availableTickets;
	
	@Column(nullable = false)
	private boolean published;
	
	@Column(length = 500)
	private String imageUrl;
	
	@ManyToOne
	@JoinColumn(name = "category_id", nullable = false)
	private EventCategory category;
	
	@ManyToOne
	@JoinColumn(name = "venue_id", nullable = false)
	private Venue venue;
	
	public Event() {
		
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDate getEventDate() {
		return eventDate;
	}

	public void setEventDate(LocalDate eventDate) {
		this.eventDate = eventDate;
	}

	public LocalTime getStartTime() {
		return startTime;
	}

	public void setStartTime(LocalTime startTime) {
		this.startTime = startTime;
	}

	public BigDecimal getTicketPrice() {
		return ticketPrice;
	}

	public void setTicketPrice(BigDecimal ticketPrice) {
		this.ticketPrice = ticketPrice;
	}

	public Integer getTotalTickets() {
		return totalTickets;
	}

	public void setTotalTickets(Integer totalTickets) {
		this.totalTickets = totalTickets;
	}

	public Integer getAvailableTickets() {
		return availableTickets;
	}

	public void setAvailableTickets(Integer availableTickets) {
		this.availableTickets = availableTickets;
	}

	public boolean isPublished() {
		return published;
	}

	public void setPublished(boolean published) {
		this.published = published;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public EventCategory getCategory() {
		return category;
	}

	public void setCategory(EventCategory category) {
		this.category = category;
	}

	public Venue getVenue() {
		return venue;
	}

	public void setVenue(Venue venue) {
		this.venue = venue;
	}
}
