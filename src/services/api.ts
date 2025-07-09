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

// Simüle edilmiş API çağrıları
export const apiService = {
  getCurrentData: async (): Promise<SensorData[]> => {
    // Simüle edilmiş veri
    return [
      {
        id: '1',
        temperature: 24 + Math.random() * 2,
        humidity: 45 + Math.random() * 5,
        timestamp: new Date().toISOString(),
      },
      {
        id: '2',
        temperature: 22 + Math.random() * 2,
        humidity: 50 + Math.random() * 5,
        timestamp: new Date().toISOString(),
      },
    ];
  },

  getHistoricalData: async (startDate: string, endDate: string): Promise<HistoricalData> => {
    // Simüle edilmiş veri
    const data = [];
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const interval = (end - start) / 24; // 24 veri noktası

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
    // Simüle edilmiş API çağrısı
    await new Promise(resolve => setTimeout(resolve, 500));
  },

  exportData: async (startDate: string, endDate: string): Promise<Blob> => {
    // Simüle edilmiş CSV verisi
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
    // Simüle edilmiş alarm verileri
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
      {
        id: '3',
        sensorId: '1',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'temperature',
        value: 29,
        threshold: 27,
        status: 'resolved',
      },
    ];

    await new Promise(resolve => setTimeout(resolve, 500)); // Simüle edilmiş gecikme
    return { data: alarms };
  },

  resolveAlarm: async (alarmId: string): Promise<void> => {
    // Simüle edilmiş API çağrısı
    await new Promise(resolve => setTimeout(resolve, 500));
  },
};

export default apiService; 