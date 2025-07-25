export interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  measurementTime: string;
  measurement_time: string;
}

// Doğrudan ngrok adresini kullanarak API çağrısı
export const fetchSensorData = async (): Promise<SensorData[]> => {
    try {
    const response = await fetch('https://d89dbf6d0ca9.ngrok-free.app/api/evant/getAll', {
      method: 'GET',
        headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Veri çekme hatası');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Hatası:', error);
    throw error;
  }
};

export const getLatestSensorData = (data: SensorData[]): { sensor1: SensorData | null, sensor2: SensorData | null } => {
  const sortedData = [...data].sort((a, b) => 
    new Date(b.measurement_time || b.measurementTime).getTime() - 
    new Date(a.measurement_time || a.measurementTime).getTime()
  );

  return {
    sensor1: sortedData[0] || null,
    sensor2: sortedData[1] || null
  };
}; 