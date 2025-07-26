import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { BsExclamationTriangle, BsThermometerHalf, BsDroplet } from 'react-icons/bs';

interface Alarm {
  id: string;
  timestamp: string;
  location: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  status: 'high' | 'low';
}

interface ActiveAlarmsProps {
  alarms: Alarm[];
}

const ActiveAlarms: React.FC<ActiveAlarmsProps> = ({ alarms }) => {
  const getStatusBadgeClass = (status: string) => {
    return status === 'high' ? 'danger' : 'info';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  const getStatusText = (status: string, type: string, value: number, threshold: number) => {
    if (status === 'high') {
      return `${type === 'temperature' ? 'Sıcaklık' : 'Nem'} çok yüksek: ${value}${type === 'temperature' ? '°C' : '%'} > ${threshold}${type === 'temperature' ? '°C' : '%'}`;
    } else {
      return `${type === 'temperature' ? 'Sıcaklık' : 'Nem'} çok düşük: ${value}${type === 'temperature' ? '°C' : '%'} < ${threshold}${type === 'temperature' ? '°C' : '%'}`;
    }
  };

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex align-items-center mb-4">
          <BsExclamationTriangle className="text-danger me-2" size={24} />
          <h5 className="mb-0">Aktif Alarmlar</h5>
        </div>
        <Table responsive>
          <thead>
            <tr>
              <th>Zaman</th>
              <th>Konum</th>
              <th>Tip</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {alarms.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted">
                  Aktif alarm bulunmuyor
                </td>
              </tr>
            ) : (
              alarms.map(alarm => (
                <tr key={alarm.id}>
                  <td>{formatTimestamp(alarm.timestamp)}</td>
                  <td>{alarm.location}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      {alarm.type === 'temperature' ? (
                        <BsThermometerHalf className="text-danger me-2" />
                      ) : (
                        <BsDroplet className="text-primary me-2" />
                      )}
                      {alarm.type === 'temperature' ? 'Sıcaklık' : 'Nem'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge bg-${getStatusBadgeClass(alarm.status)}`}>
                      {getStatusText(alarm.status, alarm.type, alarm.value, alarm.threshold)}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
};

export default ActiveAlarms; 