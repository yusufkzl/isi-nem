import { SensorData } from '../services/api';

export function checkForAlarms(sensorData: SensorData[]): any[] {
  const thresholds = JSON.parse(localStorage.getItem('thresholds') || '{}');
  const existing = JSON.parse(localStorage.getItem('alarmLog') || '[]'); // mevcut alarmlar

  const alarms: any[] = [];

  sensorData.forEach(sensor => {
    // Sıcaklık yüksek
    if (thresholds?.temperature?.max && sensor.temperature > thresholds.temperature.max) {
      const exists = existing.some((a: any) =>
        a.sensorId === sensor.id &&
        a.type === 'temperature' &&
        a.status === 'high' &&
        !a.resolved // çözülmemişse aynı alarm tekrar eklenmesin
      );

      if (!exists) {
        alarms.push({
          id: `temp-high-${sensor.id}-${Date.now()}`,
          sensorId: sensor.id,
          type: 'temperature',
          value: sensor.temperature,
          threshold: thresholds.temperature.max,
          timestamp: sensor.timestamp,
          status: 'high',
        });
      }
    }

    // Nem yüksek
    if (thresholds?.humidity?.max && sensor.humidity > thresholds.humidity.max) {
      const exists = existing.some((a: any) =>
        a.sensorId === sensor.id &&
        a.type === 'humidity' &&
        a.status === 'high' &&
        !a.resolved
      );

      if (!exists) {
        alarms.push({
          id: `humidity-high-${sensor.id}-${Date.now()}`,
          sensorId: sensor.id,
          type: 'humidity',
          value: sensor.humidity,
          threshold: thresholds.humidity.max,
          timestamp: sensor.timestamp,
          status: 'high',
        });
      }
    }
  });

  return alarms;
}
