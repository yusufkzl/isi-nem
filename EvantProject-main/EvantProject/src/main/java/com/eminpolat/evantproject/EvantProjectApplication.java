package com.eminpolat.evantproject;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EvantProjectApplication {

    public static void main(String[] args) {
        SpringApplication.run(EvantProjectApplication.class, args);
    }

}
