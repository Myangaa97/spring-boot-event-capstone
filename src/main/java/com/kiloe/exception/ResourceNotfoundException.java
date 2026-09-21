package com.kiloe.exception;

public class ResourceNotfoundException extends RuntimeException{
	public static final long serialVersionUID = 1;
	public ResourceNotfoundException(String message) {
		super(message);
	}
}
