// src/services/mockData.ts

export interface SensorReading {
  hour: string;
  temperature: number;
  humidity: number;
}

export interface SensorHistoryData {
  sensor1: SensorReading[];
  sensor2: SensorReading[];
}

function generateMockReadings(): SensorReading[] {
  const readings: SensorReading[] = [];

  for (let i = 0; i < 24; i++) {
    readings.push({
      hour: `${i.toString().padStart(2, '0')}:00`,
      temperature: 20 + Math.random() * 5,
      humidity: 40 + Math.random() * 10,
    });
  }

  return readings;
}

// ✅ Saat aralığı filtresi
function filterByTimeRange(data: SensorReading[], startTime: string, endTime: string): SensorReading[] {
  const startHour = parseInt(startTime.split(':')[0], 10);
  const endHour = parseInt(endTime.split(':')[0], 10);

  return data.filter(item => {
    const hour = parseInt(item.hour.split(':')[0], 10);
    return hour >= startHour && hour <= endHour;
  });
}

// ✅ Servis fonksiyonu
export async function getSensorHistoryData(
  date: string,
  startTime: string,
  endTime: string
): Promise<SensorHistoryData> {
  console.log(`Fetching mock data for date=${date}, start=${startTime}, end=${endTime}`);

  const sensor1 = generateMockReadings();
  const sensor2 = generateMockReadings();

  return {
    sensor1: filterByTimeRange(sensor1, startTime, endTime),
    sensor2: filterByTimeRange(sensor2, startTime, endTime),
  };
}
