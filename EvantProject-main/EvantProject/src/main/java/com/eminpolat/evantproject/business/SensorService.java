package com.eminpolat.evantproject.business;

import com.eminpolat.evantproject.entites.Alarm;
import com.eminpolat.evantproject.entites.Sensor;

import java.util.List;

public interface SensorService {
    void fetchAndSave();
    List<Sensor> getAllData();
    Sensor getLatestSensor();
    List<Alarm> getAllAlarms();
    List<Alarm> getActiveAlarms();
    void clearAlarm(Long alarmId);
}
