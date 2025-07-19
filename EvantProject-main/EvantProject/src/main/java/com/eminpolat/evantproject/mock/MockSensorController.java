package com.eminpolat.evantproject.mock;

import com.eminpolat.evantproject.entites.Sensor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Random;

@RestController
@RequestMapping("/api/sensor")
public class MockSensorController {

    private Random random = new Random();

    @GetMapping("/getAll")
    public Sensor getMockSensor() {
        double temperature = 20 + random.nextDouble() * 10; // 20 - 30 arası sıcaklık
        double humidity = 40 + random.nextDouble() * 20;    // 40 - 60 arası nem
        LocalDateTime now = LocalDateTime.now();

        System.out.println("🚀 Yeni mock veri üretildi -> Sıcaklık: " + String.format("%.2f", temperature) +
                "°C, Nem: " + String.format("%.2f", humidity) +
                "%, Zaman: " + now);

        return new Sensor(0, temperature, humidity, now);
    }
}