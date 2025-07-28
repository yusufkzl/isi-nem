export interface SensorData {
  id: number;
  temperature: number;
  humidity: number;
  measurementTime: string;
  measurement_time: string;
  sensorId: number;
}

// Cache key for localStorage
const CACHE_KEY = 'lastSensorData';
const CACHE_TIMESTAMP_KEY = 'lastSensorDataTimestamp';

// Get cached data from localStorage
const getCachedData = (): SensorData[] | null => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

// Save data to localStorage
const setCachedData = (data: SensorData[]) => {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Ignore localStorage errors
  }
};

// Yeni ngrok API endpoint'i
export const fetchSensorData = async (): Promise<SensorData[]> => {
    try {
    console.log('API çağrısı başlatılıyor...');
    const response = await fetch('https://eb2676e52e0c.ngrok-free.app/api/evant/getAll', {
      method: 'GET',
        headers: {
        'ngrok-skip-browser-warning': 'true',
        'Accept': 'application/json'
      }
    });

    console.log('API yanıt durumu:', response.status);
    
    if (!response.ok) {
      throw new Error('Veri çekme hatası');
    }
    const rawData = await response.json();
    console.log('Ham API verisi:', rawData.slice(0, 2));
    
    // Sayı formatını düzelt (virgülü noktaya çevir)
    const data = rawData.map((item: any) => ({
      ...item,
      temperature: typeof item.temperature === 'string' 
        ? parseFloat(item.temperature.replace(',', '.'))
        : item.temperature,
      humidity: typeof item.humidity === 'string'
        ? parseFloat(item.humidity.replace(',', '.'))
        : item.humidity
    }));
    
    console.log('İşlenmiş veri:', data.slice(0, 2));
    
    // Sadece veri gerçekten doluysa cache et
    if (Array.isArray(data) && data.length > 0) {
    setCachedData(data);
    }
    
    return data;
  } catch (error) {
    console.error('API Hatası:', error);
    // Return cached data if API fails
    const cachedData = getCachedData();
    if (cachedData && cachedData.length > 0) {
      console.log('API başarısız, önbellekten veri kullanılıyor:', cachedData.slice(0, 2));
      return cachedData;
    }
    throw error;
  }
};

// Check if data is from cache (last API call failed)
export const isDataFromCache = (): boolean => {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!cached || !timestamp) return false;
    
    // If cache is older than 5 minutes, consider it stale
    const cacheAge = Date.now() - parseInt(timestamp);
    return cacheAge > 5 * 60 * 1000; // 5 minutes
  } catch {
    return false;
  }
};

// Get cache timestamp for display
export const getCacheTimestamp = (): Date | null => {
  try {
    const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY);
    return timestamp ? new Date(parseInt(timestamp)) : null;
  } catch {
    return null;
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