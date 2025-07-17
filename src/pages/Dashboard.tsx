import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import SensorCard from '../components/SensorCard';
import { apiService, SensorData } from '../services/api';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Thresholds {
  temperature: { min: number; max: number };
  humidity: { min: number; max: number };
}

interface Alert {
  id: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'high' | 'low';
  sensorId: string;
}

const Dashboard: React.FC = () => {
  const [sensors, setSensors] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getThresholds = (): Thresholds => {
    const saved = localStorage.getItem('thresholds');
    return saved
      ? JSON.parse(saved)
      : {
          temperature: { min: 20, max: 26 },
          humidity: { min: 40, max: 60 },
        };
  };

  const [thresholds, setThresholds] = useState<Thresholds>(getThresholds());

  const checkAlerts = (data: SensorData[]) => {
    const newAlerts: Alert[] = [];

    data.forEach(sensor => {
      if (sensor.temperature > thresholds.temperature.max) {
        newAlerts.push({
          id: `temp-high-${sensor.id}-${sensor.timestamp}`,
          type: 'temperature',
          value: sensor.temperature,
          threshold: thresholds.temperature.max,
          timestamp: sensor.timestamp,
          status: 'high',
          sensorId: sensor.id,
        });
      }

      if (sensor.temperature < thresholds.temperature.min) {
        newAlerts.push({
          id: `temp-low-${sensor.id}-${sensor.timestamp}`,
          type: 'temperature',
          value: sensor.temperature,
          threshold: thresholds.temperature.min,
          timestamp: sensor.timestamp,
          status: 'low',
          sensorId: sensor.id,
        });
      }

      if (sensor.humidity > thresholds.humidity.max) {
        newAlerts.push({
          id: `hum-high-${sensor.id}-${sensor.timestamp}`,
          type: 'humidity',
          value: sensor.humidity,
          threshold: thresholds.humidity.max,
          timestamp: sensor.timestamp,
          status: 'high',
          sensorId: sensor.id,
        });
      }

      if (sensor.humidity < thresholds.humidity.min) {
        newAlerts.push({
          id: `hum-low-${sensor.id}-${sensor.timestamp}`,
          type: 'humidity',
          value: sensor.humidity,
          threshold: thresholds.humidity.min,
          timestamp: sensor.timestamp,
          status: 'low',
          sensorId: sensor.id,
        });
      }
    });

    const existing: Alert[] = JSON.parse(localStorage.getItem('alarmLog') || '[]');

    const uniqueNewAlerts = newAlerts.filter(newAlert =>
      !existing.some(existingAlert =>
        existingAlert.id === newAlert.id &&
        existingAlert.timestamp === newAlert.timestamp
      )
    );

    if (uniqueNewAlerts.length > 0) {
      const updatedLog = [...existing, ...uniqueNewAlerts];
      localStorage.setItem('alarmLog', JSON.stringify(updatedLog));
      setAlerts(uniqueNewAlerts);

      uniqueNewAlerts.forEach(alert => {
        toast.error(`🚨 ${alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'} Alarmı!
Değer: ${alert.value}
Limit: ${alert.threshold}`, {
          position: 'top-right',
          autoClose: 5000,
        });

        console.log('Simülasyon: Mail gönderildi =>', alert);
      });
    }
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
    const interval = setInterval(fetchData, 30000);
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
    <Container fluid className={`py-4 dashboard-container`}>
      <Row className="g-4">
        {sensors.map(sensor => (
          <Col
            key={sensor.id}
            xs={10}
            sm={5}
            md={4}
            lg={3}
            className="d-flex justify-content-center"
          >
            <SensorCard
              id={sensor.id}
              name={`Sensör ${sensor.id}`}
              temperature={sensor.temperature}
              humidity={sensor.humidity}
              timestamp={sensor.timestamp}
              alerts={alerts.filter(alert => alert.sensorId === sensor.id.toString())}
              thresholds={thresholds}
            />
          </Col>
        ))}
      </Row>
      <ToastContainer />
    </Container>
  );
};

export default Dashboard;
