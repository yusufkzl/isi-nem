import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

// apiService importu artık kullanılmayacağı için kaldırılabilir veya yorum satırı yapılabilir.
// import { apiService } from '../services/api';

interface Alarm {
  id: string;
  sensorId: string;
  timestamp: string;
  type: 'Yüksek Sıcaklık' | 'Yüksek Nem' | 'Sistem Hatası';
  description: string;
  value: number;
  threshold: number;
  status: 'active' | 'resolved';
}

// Örnek alarmlar
const mockAlarms: Alarm[] = [
  {
    id: '1',
    sensorId: '1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    type: 'Yüksek Sıcaklık',
    description: 'Sensör 1 kritik sıcaklık eşiğini aştı.',
    value: 35.2,
    threshold: 30.0,
    status: 'active',
  },
  {
    id: '2',
    sensorId: '2',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    type: 'Yüksek Nem',
    description: 'Sensör 2 için nem seviyesi çok yüksek.',
    value: 85.5,
    threshold: 80.0,
    status: 'active',
  },
  {
    id: '3',
    sensorId: '1',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    type: 'Sistem Hatası',
    description: 'Soğutma sistemi yanıt vermiyor.',
    value: 34.0,
    threshold: 30.0,
    status: 'active',
  },
  {
    id: '4',
    sensorId: '2',
    timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
    type: 'Yüksek Sıcaklık',
    description: 'Sensör 2 yüksek sıcaklık uyarısı.',
    value: 31.5,
    threshold: 30.0,
    status: 'resolved',
  },
];


const Alarms: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAlarms = () => {
    try {
      setLoading(true);
      // API çağrısı yerine örnek verileri kullan
      setAlarms(mockAlarms);
      setError(null);
    } catch (error) {
      console.error('Alarmlar yüklenirken hata:', error);
      setError('Alarmlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
  }, []);

  const handleResolve = (alarmId: string) => {
    try {
      // Gerçek API çağrısı burada olur: await apiService.resolveAlarm(alarmId);
      setAlarms(alarms.map(alarm => 
        alarm.id === alarmId 
          ? { ...alarm, status: 'resolved' } 
          : alarm
      ));
    } catch (error) {
      console.error('Alarm çözülürken hata:', error);
      setError('Alarm çözülürken bir hata oluştu.');
    }
  };

  const getStatusBadge = (status: Alarm['status']) => {
    return status === 'active' ? (
      <Badge bg="danger" className="d-flex align-items-center">
        <FaExclamationTriangle className="me-1" />
        Aktif
      </Badge>
    ) : (
      <Badge bg="success" className="d-flex align-items-center">
        <FaCheckCircle className="me-1" />
        Çözüldü
      </Badge>
    );
  };

  const getTypeText = (type: Alarm['type']) => {
    switch (type) {
      case 'Yüksek Sıcaklık':
        return <Badge bg="warning" text="dark">{type}</Badge>;
      case 'Yüksek Nem':
        return <Badge bg="info">{type}</Badge>;
      case 'Sistem Hatası':
        return <Badge bg="secondary">{type}</Badge>;
      default:
        return <Badge bg="light" text="dark">{type}</Badge>;
    }
  };

  if (loading) {
    return (
      <Container fluid className="py-4">
        <Card className="border-0 shadow-sm">
          <Card.Body className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <Container fluid className="py-4">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="mb-0">
              <FaBell className="me-2" />
              Alarmlar
            </h5>
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={loadAlarms}
            >
              Yenile
            </Button>
          </div>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          {alarms.length === 0 ? (
            <div className="text-center text-muted py-5">
              <FaCheckCircle size={48} className="mb-3 text-success" />
              <p className="mb-0">Aktif alarm bulunmuyor.</p>
            </div>
          ) : (
            <Table responsive hover className="align-middle">
              <thead>
                <tr>
                  <th>Sensör</th>
                  <th>Tip</th>
                  <th>Açıklama</th>
                  <th>Detay</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map(alarm => (
                  <tr key={alarm.id} className={alarm.status === 'active' ? 'table-danger' : ''}>
                    <td>Sensör {alarm.sensorId}</td>
                    <td>{getTypeText(alarm.type)}</td>
                    <td>{alarm.description}</td>
                    <td>
                      <span className="fw-bold">
                        {alarm.value}
                        {alarm.type === 'Yüksek Sıcaklık' || alarm.type === 'Sistem Hatası' ? '°C' : '%'}
                      </span>
                      <small className="text-muted"> (Eşik: {alarm.threshold})</small>
                    </td>
                    <td>
                      {new Date(alarm.timestamp).toLocaleString('tr-TR')}
                    </td>
                    <td>{getStatusBadge(alarm.status)}</td>
                    <td>
                      {alarm.status === 'active' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleResolve(alarm.id)}
                        >
                          Çözüldü Olarak İşaretle
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Alarms; 