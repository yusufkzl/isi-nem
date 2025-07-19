package com.eminpolat.evantproject.entites;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "sensor")
public class Sensor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private int id;
    @Column(name = "temperature")
    private double temperature;
    @Column(name = "humidity")
    private double humidity;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "measurement_time")
    private LocalDateTime measurementTime;

    public Sensor() {
    }

    public Sensor(int id, double temperature, double humidity, LocalDateTime measurement_time) {
        this.id = id;
        this.temperature = temperature;
        this.humidity = humidity;
        this.measurementTime = measurement_time;
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public double getTemperature() {
        return temperature;
    }

    public void setTemperature(double temperature) {
        this.temperature = temperature;
    }

    public double getHumidity() {
        return humidity;
    }

    public void setHumidity(double humidity) {
        this.humidity = humidity;
    }

    public LocalDateTime getMeasurement_time() {
        return measurementTime;
    }

    public void setMeasurement_time(LocalDateTime measurement_time) {
        this.measurementTime = measurement_time;
    }
}

