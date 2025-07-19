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

const API_BASE_URL = 'http://localhost:8080/api';

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

  // Alarm related endpoints
  getAlarms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/evant/alarms`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching alarms:', error);
      throw error;
    }
  },

  getActiveAlarms: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/evant/alarms/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active alarms:', error);
      throw error;
    }
  },

  clearAlarm: async (alarmId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/evant/alarms/${alarmId}/clear`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Error clearing alarm:', error);
      throw error;
    }
  },
};

export const fetchSensorData = async () => {
  try {
    const response = await fetch('/api/evant/getAll');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch sensor data:', error);
    throw error;
  }
};

export default apiService; 