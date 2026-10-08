package com.portsight;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling; // ◄── Add this import

@SpringBootApplication
@EnableScheduling
public class PortsightApplication {

	public static void main(String[] args) {
		SpringApplication.run(PortsightApplication.class, args);
	}
}
