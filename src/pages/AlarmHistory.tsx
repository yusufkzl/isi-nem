import React, { useEffect, useState } from 'react';
import { Container, Table, Button, Alert, Spinner } from 'react-bootstrap';
import { apiService } from '../services/api';

interface Alarm {
  id: number;
  sensorId: number;
  alarmType: string;
  value: number;
  limitValue: number;
  timestamp: string;
  status: string;
}

const AlarmHistory: React.FC = () => {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlarms = async () => {
    try {
      setLoading(true);
      const data = await apiService.getAlarms();
      setAlarms(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching alarms:', err);
      setError('Alarm geçmişi yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearAlarm = async (alarmId: number) => {
    try {
      await apiService.clearAlarm(alarmId);
      await fetchAlarms(); // Refresh the list after clearing
      setError(null);
    } catch (err) {
      console.error('Error clearing alarm:', err);
      setError('Alarm temizlenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
  };

  useEffect(() => {
    fetchAlarms();
    const interval = setInterval(fetchAlarms, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '200px' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container>
      <h2 className="mb-4">Alarm Geçmişi</h2>
      
      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {alarms.length === 0 ? (
        <Alert variant="info">
          Alarm kaydı bulunmamaktadır.
        </Alert>
      ) : (
        <Table responsive hover>
          <thead>
            <tr>
              <th>Tarih/Saat</th>
              <th>Tip</th>
              <th>Değer</th>
              <th>Limit</th>
              <th>Durum</th>
              <th>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {alarms.map((alarm) => (
              <tr 
                key={alarm.id} 
                className={alarm.status === 'ACTIVE' ? 'table-danger' : ''}
              >
                <td>{new Date(alarm.timestamp).toLocaleString('tr-TR')}</td>
                <td>{alarm.alarmType === 'TEMPERATURE' ? 'Sıcaklık' : 'Nem'}</td>
                <td>
                  {alarm.value.toFixed(2)}
                  {alarm.alarmType === 'TEMPERATURE' ? '°C' : '%'}
                </td>
                <td>
                  {alarm.limitValue.toFixed(2)}
                  {alarm.alarmType === 'TEMPERATURE' ? '°C' : '%'}
                </td>
                <td>
                  <span className={`badge bg-${alarm.status === 'ACTIVE' ? 'danger' : 'success'}`}>
                    {alarm.status === 'ACTIVE' ? 'Aktif' : 'Temizlendi'}
                  </span>
                </td>
                <td>
                  {alarm.status === 'ACTIVE' && (
                    <Button 
                      variant="warning" 
                      size="sm"
                      onClick={() => handleClearAlarm(alarm.id)}
                    >
                      Temizle
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
};

export default AlarmHistory; 