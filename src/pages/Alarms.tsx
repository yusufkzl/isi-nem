import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { FaBell, FaCheckCircle } from 'react-icons/fa';

interface Alarm {
  id: string;
  sensorId: string;
  timestamp: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  status: 'active' | 'resolved';
}

const Alarms: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage'tan alarm listesini yükle
  const loadAlarms = async () => {
  try {
    setLoading(true);
    const storedAlarms = localStorage.getItem('alarmLog');
    if (storedAlarms) {
      setAlarms(JSON.parse(storedAlarms));
    } else {
      setAlarms([]);
    }
    setError(null);
  } catch (error) {
    console.error('Alarmlar yüklenirken hata:', error);
    setError('Alarmlar yüklenirken bir hata oluştu.');
  } finally {
    setLoading(false);
  }
  <Button
  variant="outline-danger"
  size="sm"
  onClick={() => {
    localStorage.removeItem('alarmLog');
    setAlarms([]);
  }}
>
  Geçmişi Temizle
</Button>

};


  useEffect(() => {
    loadAlarms();
  }, []);

  // Alarmı çözülmüşe işaretle ve localStorage'a kaydet
 const handleResolve = (alarmId: string) => {
  try {
    const updatedAlarms: Alarm[] = alarms.map(alarm =>
      alarm.id === alarmId
        ? { ...alarm, status: 'resolved' }
        : alarm
    );

    setAlarms(updatedAlarms);
    localStorage.setItem('alarmLog', JSON.stringify(updatedAlarms));
  } catch (error) {
    console.error('Alarm çözülürken hata:', error);
    setError('Alarm çözülürken bir hata oluştu.');
  }
};

  const getStatusBadge = (status: Alarm['status']) => {
    return status === 'active' ? (
      <Badge bg="danger">Aktif</Badge>
    ) : (
      <Badge bg="success">Çözüldü</Badge>
    );
  };

  const getTypeText = (type: Alarm['type']) => {
    return type === 'temperature' ? 'Sıcaklık' : 'Nem';
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
                  <th>Değer</th>
                  <th>Eşik</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {alarms.map(alarm => (
                  <tr key={alarm.id}>
                    <td>Sensör {alarm.sensorId}</td>
                    <td>{getTypeText(alarm.type)}</td>
                    <td>
                      <span className="text-danger fw-bold">
                        {alarm.value}
                        {alarm.type === 'temperature' ? '°C' : '%'}
                      </span>
                    </td>
                    <td>
                      {alarm.threshold}
                      {alarm.type === 'temperature' ? '°C' : '%'}
                    </td>
                    <td>{new Date(alarm.timestamp).toLocaleString('tr-TR')}</td>
                    <td>{getStatusBadge(alarm.status)}</td>
                    <td>
                      {alarm.status === 'active' && (
                        <Button
                          variant="outline-success"
                          size="sm"
                          onClick={() => handleResolve(alarm.id)}
                        >
                          Çözüldü
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
