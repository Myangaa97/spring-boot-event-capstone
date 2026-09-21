package com.kiloe.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.kiloe.entity.Venue;
import com.kiloe.exception.DuplicateResourceException;
import com.kiloe.exception.ResourceNotfoundException;
import com.kiloe.repository.VenueRepository;

@Service
@Transactional
public class VenueService {
	
	private final VenueRepository venueRepository;

	public VenueService(VenueRepository venueRepository) {
		this.venueRepository = venueRepository;
	}
	
	@Transactional
	public List<Venue> findAllVenues() {
		return venueRepository.findAll();
	}
	
	@Transactional
	public Venue findVenueById(Long id) {
		return venueRepository.findById(id)
				.orElseThrow(() -> new IllegalArgumentException("Venue not found with ID: " + id));
	}
	
	public Venue createVenue(Venue venue) throws IllegalAccessException {
		if(venue.getCapacity() == null || venue.getCapacity() <= 0) {
			throw new IllegalAccessException("Capacity must be greater than 0");
		}
		
		String name = venue.getName().trim();
		if(venueRepository.existsByName(name)) {
			throw new DuplicateResourceException("Venue already exists with name: " + venue.getName());
		}
		
		venue.setName(name);
		return venueRepository.save(venue);
	}
	
	public Venue updateVenue(Long id, Venue newVanue) {
		Venue venue = findVenueById(id);
		
		String name = newVanue.getName().trim();
		if(venueRepository.existsByNameAndIdNot(name, id)) {
			throw new DuplicateResourceException("Venue already exists with name: " + venue.getName());
		}
		
		venue.setName(name);
		venue.setAddress(newVanue.getAddress());
		venue.setCapacity(newVanue.getCapacity());
		return venueRepository.save(venue);
	}
	
	public void deleteVenue(Long id) {
		Venue foundVenue = venueRepository.findById(id)
				.orElseThrow(() -> new ResourceNotfoundException("Venue not found with ID: " + id));
		venueRepository.delete(foundVenue);
	}
	
}