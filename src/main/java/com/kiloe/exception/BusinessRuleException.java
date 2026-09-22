package com.kiloe.exception;

public class BusinessRuleException extends RuntimeException {
	
	public static final long serialVersionUID = 1;
	
	public BusinessRuleException(String message) {
		super(message);
	}
}
