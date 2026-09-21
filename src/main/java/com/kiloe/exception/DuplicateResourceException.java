package com.kiloe.exception;

public class DuplicateResourceException extends RuntimeException {
	public static final long serialVersionUID = 1;
	public DuplicateResourceException(String message) {
		super(message);
	}
}
