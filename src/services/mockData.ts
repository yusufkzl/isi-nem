export interface SensorReading {
  hour: string;
  temperature: number;
  humidity: number;
}

export interface SensorHistoryData {
  sensor1: SensorReading[];
  sensor2: SensorReading[];
}

export async function getSensorHistoryData(
  date: string,
  startTime: string,
  endTime: string
): Promise<SensorHistoryData> {
  try {
    const response = await fetch('https://f20609b3a1fe.ngrok-free.app/api/evant/getAll');
    if (!response.ok) {
      throw new Error('Veri alınamadı');
    }

    const rawData = await response.json();

    const sensor1: SensorReading[] = [];
    const sensor2: SensorReading[] = [];

    rawData.forEach((item: any) => {
      const hour = new Date(item.measurement_time || item.measurementTime).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });

      const reading: SensorReading = {
        hour,
        temperature: item.temperature,
        humidity: item.humidity,
      };

      if (item.id === 1) {
        sensor1.push(reading);
      } else if (item.id === 2) {
        sensor2.push(reading);
      }
    });

    return {
      sensor1: filterByTimeRange(sensor1, startTime, endTime),
      sensor2: filterByTimeRange(sensor2, startTime, endTime),
    };

  } catch (error) {
    console.error('Gerçek veri alınırken hata:', error);
    throw error;
  }
}

function filterByTimeRange(data: SensorReading[], startTime: string, endTime: string): SensorReading[] {
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  return data.filter(item => {
    const hour = parseInt(item.hour.split(':')[0], 10);
    return hour >= startHour && hour <= endHour;
  });
}
