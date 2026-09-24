package com.kiloe.exception;

public class DuplicateResourceException extends RuntimeException {
	
	public static final long serialVersionUID = 1L;
	
	public DuplicateResourceException(String message) {
		super(message);
	}
}
