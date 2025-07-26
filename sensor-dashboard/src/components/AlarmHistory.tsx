import React, { useEffect, useState } from 'react';
import '../styles/AlarmHistory.css';

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
      const response = await fetch('/api/evant/alarms');
      if (!response.ok) {
        throw new Error('Failed to fetch alarms');
      }
      const data = await response.json();
      setAlarms(data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load alarm history');
      setLoading(false);
    }
  };

  const clearAlarm = async (alarmId: number) => {
    try {
      const response = await fetch(`/api/evant/alarms/${alarmId}/clear`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to clear alarm');
      }
      // Refresh alarms after clearing
      fetchAlarms();
    } catch (err) {
      setError('Failed to clear alarm');
    }
  };

  useEffect(() => {
    fetchAlarms();
    // Fetch alarms every minute
    const interval = setInterval(fetchAlarms, 60000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div>Loading alarm history...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="alarm-history">
      <h2>Alarm Geçmişi</h2>
      <div className="alarm-table">
        <table>
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
              <tr key={alarm.id} className={alarm.status === 'ACTIVE' ? 'active-alarm' : ''}>
                <td>{new Date(alarm.timestamp).toLocaleString('tr-TR')}</td>
                <td>{alarm.alarmType === 'TEMPERATURE' ? 'Sıcaklık' : 'Nem'}</td>
                <td>{alarm.value.toFixed(2)}{alarm.alarmType === 'TEMPERATURE' ? '°C' : '%'}</td>
                <td>{alarm.limitValue.toFixed(2)}{alarm.alarmType === 'TEMPERATURE' ? '°C' : '%'}</td>
                <td>{alarm.status === 'ACTIVE' ? 'Aktif' : 'Temizlendi'}</td>
                <td>
                  {alarm.status === 'ACTIVE' && (
                    <button onClick={() => clearAlarm(alarm.id)}>Temizle</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AlarmHistory; 