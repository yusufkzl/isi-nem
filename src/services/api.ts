export interface SensorData {
  id: string;
  temperature: number;
  humidity: number;
  timestamp: string;
}

export interface HistoricalData {
  data: Array<{
    temperature: number;
    humidity: number;
    timestamp: string;
  }>;
}

export interface Alarm {
  id: string;
  sensorId: string;
  timestamp: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  status: 'active' | 'resolved';
}

export const apiService = {
  // ✅ Gerçek veriyi backend'den alır
  getCurrentData: async (): Promise<SensorData[]> => {
    const response = await fetch('https://f20609b3a1fe.ngrok-free.app/api/evant/getAll');
    if (!response.ok) {
      throw new Error('Veri alınamadı');
    }

    const rawData = await response.json();

    const formattedData: SensorData[] = rawData.map((item: any) => ({
      id: String(item.id),
      temperature: item.temperature,
      humidity: item.humidity,
      timestamp: item.measurement_time || item.measurementTime,
    }));

    return formattedData;
  },

  // Diğerleri mock (değiştirmene gerek yok şimdilik)
  getHistoricalData: async (startDate: string, endDate: string): Promise<HistoricalData> => {
    const data = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const interval = (end - start) / 24;

    for (let i = 0; i < 24; i++) {
      data.push({
        temperature: 22 + Math.random() * 4,
        humidity: 45 + Math.random() * 10,
        timestamp: new Date(start + interval * i).toISOString(),
      });
    }

    return { data };
  },

  updateThresholds: async (thresholds: { temperature: number; humidity: number }): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  exportData: async (startDate: string, endDate: string): Promise<Blob> => {
    const data = await apiService.getHistoricalData(startDate, endDate);
    const csvContent = [
      'Tarih,Sıcaklık (°C),Nem (%)',
      ...data.data.map(row =>
        `${new Date(row.timestamp).toLocaleString('tr-TR')},${row.temperature},${row.humidity}`
      ),
    ].join('\n');

    return new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  },

  getAlarms: async (): Promise<{ data: Alarm[] }> => {
    const alarms: Alarm[] = [
      {
        id: '1',
        sensorId: '1',
        timestamp: new Date().toISOString(),
        type: 'temperature',
        value: 28.5,
        threshold: 27,
        status: 'active',
      },
      {
        id: '2',
        sensorId: '2',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        type: 'humidity',
        value: 65,
        threshold: 60,
        status: 'active',
      },
    ];

    await new Promise(resolve => setTimeout(resolve, 500));
    return { data: alarms };
  },

  resolveAlarm: async (alarmId: string): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

export default apiService;
