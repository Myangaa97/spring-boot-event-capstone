package com.kiloe.specification;

import java.time.LocalDate;

import org.springframework.data.jpa.domain.Specification;

import com.kiloe.entity.Event;

public class EventSpecification {

	private EventSpecification() {
	}

	public static Specification<Event> isPublished() {
		return (root, query, criteriaBuilder) -> criteriaBuilder.isTrue(root.get("published"));
	}

	public static Specification<Event> titleContains(String title) {
		return (root, query, criteriaBuilder) ->
				criteriaBuilder.like(
						criteriaBuilder.lower(root.get("title")),
						"%" + title.toLowerCase() + "%");
	}

	public static Specification<Event> eventDateEquals(LocalDate date) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("eventDate"), date);
	}

	public static Specification<Event> eventDateOnOrAfter(LocalDate date) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.greaterThanOrEqualTo(root.get("eventDate"), date);
	}

	public static Specification<Event> venueIdEquals(Long venueId) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("venue").get("id"), venueId);
	}

	public static Specification<Event> categoryIdEquals(Long categoryId) {
		return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("category").get("id"), categoryId);
	}
}
