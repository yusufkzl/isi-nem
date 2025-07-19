package com.eminpolat.evantproject.controller;

import com.eminpolat.evantproject.business.SensorService;
import com.eminpolat.evantproject.entites.Sensor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import com.eminpolat.evantproject.entites.Alarm;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/evant")
@CrossOrigin
public class SensorController {
    private SensorService sensorService;

    public SensorController(SensorService sensorService) {
        this.sensorService = sensorService;
    }

    @GetMapping("/getAll")
    public List<Sensor> getAll() {
        return sensorService.getAllData();
    }

    @GetMapping("/latest")
    public Sensor getLatest() {
        return sensorService.getLatestSensor();
    }

    @GetMapping("/alarms")
    public List<Alarm> getAllAlarms() {
        return sensorService.getAllAlarms();
    }

    @GetMapping("/alarms/active")
    public List<Alarm> getActiveAlarms() {
        return sensorService.getActiveAlarms();
    }

    @PostMapping("/alarms/{alarmId}/clear")
    public ResponseEntity<Void> clearAlarm(@PathVariable Long alarmId) {
        sensorService.clearAlarm(alarmId);
        return ResponseEntity.ok().build();
    }
}
