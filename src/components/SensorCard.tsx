import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, OverlayTrigger, Tooltip, Modal } from 'react-bootstrap';
import { FaThermometerHalf, FaTint, FaHistory, FaCog } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';



interface Alert {
  id: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'high' | 'low';
}

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

interface SensorCardProps {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  alerts: Alert[];
  thresholds: Thresholds;
}

const SensorCard: React.FC<SensorCardProps> = ({
  id,
  name,
  temperature,
  humidity,
  timestamp,
  alerts,
  thresholds,
}) => {
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const getStatusColor = (value: number, type: 'temperature' | 'humidity'): string => {
    const limits = thresholds[type];
    if (value > limits.max) return 'danger';
    if (value < limits.min) return 'info';
    return 'success';
  };

  const formatTime = (timestamp: string): string => {
    return new Date(timestamp).toLocaleTimeString('tr-TR');
  };

  // Örnek grafik verisi
  const chartData = {
    labels: ['12:00', '13:00', '14:00', '15:00', '16:00'],
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: [temperature - 2, temperature - 1, temperature, temperature + 1, temperature - 0.5],
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  return (
    <>
      <Card className="border-0 shadow-sm h-100 sensor-card">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">{name}</h5>
            <div className="d-flex align-items-center">
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Geçmiş Veriler</Tooltip>}
              >
                <Button 
                  variant="link" 
                  className="p-0 me-2" 
                  onClick={() => setShowHistory(true)}
                >
                  <FaHistory className="text-muted" />
                </Button>
              </OverlayTrigger>
              <OverlayTrigger
                placement="top"
                overlay={<Tooltip>Sensör Ayarları</Tooltip>}
              >
                <Button 
                  variant="link" 
                  className="p-0 me-2" 
                  onClick={() => setShowSettings(true)}
                >
                  <FaCog className="text-muted" />
                </Button>
              </OverlayTrigger>
              <small className="text-muted">
                {formatTime(timestamp)}
              </small>
            </div>
          </div>
<div className="gauge-grid">
  <div className="gauge">
    <CircularProgressbar
      value={temperature}
      maxValue={40}
      text={`${temperature.toFixed(1)}°C`}
      strokeWidth={6}
      styles={buildStyles({
        pathColor: '#e67e22',
        textColor: '#333',
        trailColor: '#eee',
        textSize: '10px',
      })}
    />
    <div className="timestamp mt-2 text-muted" style={{ fontSize: '0.9rem' }}>
  Ölçüm zamanı: {new Date(timestamp).toLocaleString()}
</div>

    <div className="gauge-label">Sıcaklık</div>
  </div>
  <div className="gauge">
    <CircularProgressbar
      value={humidity}
      maxValue={100}
      text={`${humidity.toFixed(1)}%`}
       strokeWidth={6}
      styles={buildStyles({
        pathColor: '#3498db',
        textColor: '#333',
        trailColor: '#eee',
        textSize: '10px',
      })}
    />
    <div className="gauge-label">Nem</div>
  </div>
</div>


          {alerts.length > 0 && (
            <div className="mt-3">
              {alerts.map(alert => (
                <Badge
                  key={alert.id}
                  bg={alert.status === 'high' ? 'danger' : 'info'}
                  className="me-2 p-2"
                >
                  <span className="d-inline-block">
                    {alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'}{' '}
                    {alert.status === 'high' ? 'Yüksek' : 'Düşük'}
                    <small className="ms-1">({alert.value})</small>
                  </span>
                </Badge>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Geçmiş Modal */}
      <Modal show={showHistory} onHide={() => setShowHistory(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{name} - Geçmiş Veriler</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Line data={chartData} options={{ responsive: true }} />
        </Modal.Body>
      </Modal>

      {/* Ayarlar Modal */}
      <Modal show={showSettings} onHide={() => setShowSettings(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{name} - Sensör Ayarları</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <h6>Sıcaklık Limitleri</h6>
          <div className="mb-3">
            <label>Minimum (°C)</label>
            <input type="number" className="form-control" defaultValue={thresholds.temperature.min} />
          </div>
          <div className="mb-3">
            <label>Maximum (°C)</label>
            <input type="number" className="form-control" defaultValue={thresholds.temperature.max} />
          </div>

          <h6 className="mt-4">Nem Limitleri</h6>
          <div className="mb-3">
            <label>Minimum (%)</label>
            <input type="number" className="form-control" defaultValue={thresholds.humidity.min} />
          </div>
          <div className="mb-3">
            <label>Maximum (%)</label>
            <input type="number" className="form-control" defaultValue={thresholds.humidity.max} />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowSettings(false)}>
            İptal
          </Button>
          <Button variant="primary">
            Kaydet
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SensorCard; 