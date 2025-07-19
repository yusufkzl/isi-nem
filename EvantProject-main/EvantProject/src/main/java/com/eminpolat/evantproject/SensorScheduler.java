package com.eminpolat.evantproject;

import com.eminpolat.evantproject.business.SensorService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SensorScheduler {
    private SensorService sensorService;

    public SensorScheduler(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @Scheduled(fixedRate = 120000) // her 2 dakikada bir
    public void fetchSensorDataPeriodically() {
        sensorService.fetchAndSave();
    }
}