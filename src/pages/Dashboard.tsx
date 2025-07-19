import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SensorCard from '../components/SensorCard';
import { apiService, SensorData } from '../services/api';

interface Thresholds {
  temperature: {
    min: number;
    max: number;
  };
  humidity: {
    min: number;
    max: number;
  };
}

interface Alert {
  id: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'high' | 'low';
}

const Dashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const thresholds: Thresholds = {
    temperature: {
      min: 20,
      max: 26,
    },
    humidity: {
      min: 40,
      max: 60,
    },
  };

  const checkAlerts = (data: SensorData[]) => {
    const newAlerts: Alert[] = [];

    data.forEach(sensor => {
      // Sıcaklık üst limit kontrolü
      if (sensor.temperature > thresholds.temperature.max) {
        newAlerts.push({
          id: `temp-high-${sensor.id}`,
          type: 'temperature',
          value: sensor.temperature,
          threshold: thresholds.temperature.max,
          timestamp: sensor.timestamp,
          status: 'high' as const,
        });
      }

      // Sıcaklık alt limit kontrolü
      if (sensor.temperature < thresholds.temperature.min) {
        newAlerts.push({
          id: `temp-low-${sensor.id}`,
          type: 'temperature',
          value: sensor.temperature,
          threshold: thresholds.temperature.min,
          timestamp: sensor.timestamp,
          status: 'low' as const,
        });
      }

      // Nem üst limit kontrolü
      if (sensor.humidity > thresholds.humidity.max) {
        newAlerts.push({
          id: `hum-high-${sensor.id}`,
          type: 'humidity',
          value: sensor.humidity,
          threshold: thresholds.humidity.max,
          timestamp: sensor.timestamp,
          status: 'high' as const,
        });
      }

      // Nem alt limit kontrolü
      if (sensor.humidity < thresholds.humidity.min) {
        newAlerts.push({
          id: `hum-low-${sensor.id}`,
          type: 'humidity',
          value: sensor.humidity,
          threshold: thresholds.humidity.min,
          timestamp: sensor.timestamp,
          status: 'low' as const,
        });
      }
    });

    setAlerts(newAlerts);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getCurrentData();
        setSensors(data);
        checkAlerts(data);
        setError(null);
      } catch (err) {
        console.error('Veri yüklenirken hata:', err);
        setError('Veriler yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Her 30 saniyede bir güncelle

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Row className="g-4">
        {sensors.map(sensor => (
          <Col key={sensor.id} lg={6}>
            <SensorCard
              id={sensor.id}
              name={`Sensör ${sensor.id}`}
              temperature={sensor.temperature}
              humidity={sensor.humidity}
              timestamp={sensor.timestamp}
              alerts={alerts.filter(alert => alert.id.includes(sensor.id))}
              thresholds={thresholds}
            />
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard; 