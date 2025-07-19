package com.eminpolat.evantproject.dataAccess;

import com.eminpolat.evantproject.entites.Sensor;
import org.springframework.data.jpa.repository.JpaRepository;


public interface SensorRepository extends JpaRepository<Sensor, Integer> {
    Sensor findTopByOrderByMeasurementTimeDesc();
}
