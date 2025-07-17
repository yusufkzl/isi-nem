import React, { useState, useEffect } from 'react';
import { Card, Table, Form, InputGroup, Badge, Spinner, Button } from 'react-bootstrap';
import { FaSearch, FaThermometerHalf, FaTint, FaExclamationTriangle } from 'react-icons/fa';

interface Alarm {
  id: string;
  timestamp: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  status: 'high' | 'low' | 'resolved';
  sensorId: string;
}

const AlarmHistory: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAlarms = async () => {
      setIsLoading(true);
      try {
        const stored = localStorage.getItem('alarmLog');
        if (stored) {
          const parsed = JSON.parse(stored);
          setAlarms(parsed);
        } else {
          setAlarms([]);
        }
      } catch (error) {
        console.error('Alarm verisi çekme hatası:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlarms();
  }, []);

const handleResolveAlarm = (alarmId: string) => {
  const updated: Alarm[] = alarms.map(alarm =>
    alarm.id === alarmId ? { ...alarm, status: 'resolved' } : alarm
  );

  setAlarms(updated);
  localStorage.setItem('alarmLog', JSON.stringify(updated));
};


  const getStatusBadge = (status: string, type: string) => {
    const color = status === 'high' ? 'danger' : status === 'low' ? 'info' : 'success';
    const icon = type === 'temperature' ? <FaThermometerHalf /> : <FaTint />;

    return (
      <Badge bg={color} className="d-inline-flex align-items-center gap-1 p-2">
        {icon}
        {status === 'high' ? 'Yüksek' : status === 'low' ? 'Düşük' : 'Çözüldü'}
      </Badge>
    );
  };

  const filteredAlarms = alarms.filter(alarm => {
    const searchString = searchTerm.toLowerCase();
    return (
      alarm.type.toLowerCase().includes(searchString) ||
      alarm.status.toLowerCase().includes(searchString) ||
      alarm.sensorId.toLowerCase().includes(searchString) ||
      new Date(alarm.timestamp).toLocaleString().toLowerCase().includes(searchString)
    );
  });

  return (
    <div className="alarm-history-page">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="d-flex align-items-center">
              <FaExclamationTriangle className="text-warning me-2" size={24} />
              <h4 className="mb-0">Alarm Geçmişi</h4>
            </div>
            <InputGroup className="w-auto">
              <InputGroup.Text>
                <FaSearch />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </InputGroup>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover className="align-middle">
                <thead>
                  <tr>
                    <th>Sensör</th>
                    <th>Tarih/Saat</th>
                    <th>Tip</th>
                    <th>Değer</th>
                    <th>Limit</th>
                    <th>Durum</th>
                    <th>İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAlarms.map(alarm => (
                    <tr key={alarm.id} className="alarm-row">
                      <td>{alarm.sensorId}</td>
                      <td>{new Date(alarm.timestamp).toLocaleString()}</td>
                      <td>
                        <div className="d-flex align-items-center">
                          {alarm.type === 'temperature' ? (
                            <FaThermometerHalf className="me-2 text-danger" />
                          ) : (
                            <FaTint className="me-2 text-primary" />
                          )}
                          {alarm.type === 'temperature' ? 'Sıcaklık' : 'Nem'}
                        </div>
                      </td>
                      <td>
                        <strong>
                          {alarm.value}
                          {alarm.type === 'temperature' ? '°C' : '%'}
                        </strong>
                      </td>
                      <td>
                        {alarm.threshold}
                        {alarm.type === 'temperature' ? '°C' : '%'}
                      </td>
                      <td>{getStatusBadge(alarm.status, alarm.type)}</td>
                      <td>
                        {alarm.status !== 'resolved' && (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() => handleResolveAlarm(alarm.id)}
                          >
                            Çözüldü
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              {filteredAlarms.length === 0 && (
                <div className="text-center py-5 text-muted">
                  <FaExclamationTriangle size={48} className="mb-3" />
                  <h5>Alarm Bulunamadı</h5>
                  <p>Seçilen kriterlere uygun alarm kaydı bulunmamaktadır.</p>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AlarmHistory;
