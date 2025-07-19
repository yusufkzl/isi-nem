package com.eminpolat.evantproject.dataAccess;

import com.eminpolat.evantproject.entites.Alarm;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlarmRepository extends JpaRepository<Alarm, Long> {
    List<Alarm> findByStatusOrderByTimestampDesc(String status);
    List<Alarm> findAllByOrderByTimestampDesc();
} 