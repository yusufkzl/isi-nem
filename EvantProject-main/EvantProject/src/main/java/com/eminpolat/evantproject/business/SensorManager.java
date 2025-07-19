package com.eminpolat.evantproject.business;

import com.eminpolat.evantproject.dataAccess.AlarmRepository;
import com.eminpolat.evantproject.dataAccess.SensorRepository;
import com.eminpolat.evantproject.entites.Alarm;
import com.eminpolat.evantproject.entites.Sensor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;


import java.util.List;

@Service
public class SensorManager implements SensorService {
    private SensorRepository sensorRepository;
    private AlarmRepository alarmRepository;
    private RestTemplate restTemplate;
    private static final double TEMPERATURE_LIMIT = 30.0;
    private static final double HUMIDITY_LIMIT = 60.0;

    public SensorManager(SensorRepository sensorRepository, AlarmRepository alarmRepository, RestTemplate restTemplate) {
        this.sensorRepository = sensorRepository;
        this.alarmRepository = alarmRepository;
        this.restTemplate = restTemplate;
    }

    @Override
    public void fetchAndSave() {
        String url = "http://localhost:8080/api/sensor/getAll";
        Sensor sensor = restTemplate.getForObject(url, Sensor.class);
        if (sensor != null) {
            sensorRepository.save(sensor);
            checkAndCreateAlarms(sensor);
        }
    }

    private void checkAndCreateAlarms(Sensor sensor) {
        if (sensor.getTemperature() > TEMPERATURE_LIMIT) {
            Alarm alarm = new Alarm(
                sensor.getId(),
                "TEMPERATURE",
                sensor.getTemperature(),
                TEMPERATURE_LIMIT
            );
            alarmRepository.save(alarm);
        }
        
        if (sensor.getHumidity() > HUMIDITY_LIMIT) {
            Alarm alarm = new Alarm(
                sensor.getId(),
                "HUMIDITY",
                sensor.getHumidity(),
                HUMIDITY_LIMIT
            );
            alarmRepository.save(alarm);
        }
    }

    @Override
    public List<Sensor> getAllData() {
        return sensorRepository.findAll();
    }

    @Override
    public Sensor getLatestSensor() {
        return sensorRepository.findTopByOrderByMeasurementTimeDesc();
    }

    @Override
    public List<Alarm> getAllAlarms() {
        return alarmRepository.findAllByOrderByTimestampDesc();
    }

    @Override
    public List<Alarm> getActiveAlarms() {
        return alarmRepository.findByStatusOrderByTimestampDesc("ACTIVE");
    }

    @Override
    public void clearAlarm(Long alarmId) {
        alarmRepository.findById(alarmId).ifPresent(alarm -> {
            alarm.setStatus("CLEARED");
            alarmRepository.save(alarm);
        });
    }
}



