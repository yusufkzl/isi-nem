import { SensorData } from './api';

export interface SensorStats {
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  minHum: number;
  maxHum: number;
  avgHum: number;
  totalReadings: number;
  lastUpdate: string;
}

// Gelişmiş analitik için yeni interface'ler
export interface TrendData {
  slope: number;
  direction: 'increasing' | 'decreasing' | 'stable';
  prediction: number[];
  confidence: number;
}

export interface AnomalyResult {
  isAnomaly: boolean;
  score: number;
  threshold: number;
  type: 'temperature' | 'humidity';
  value: number;
  timestamp: string;
}

export interface CorrelationResult {
  coefficient: number;
  strength: 'very_weak' | 'weak' | 'moderate' | 'strong' | 'very_strong';
  relationship: 'positive' | 'negative' | 'none';
}

export interface ComparisonResult {
  current: SensorStats;
  previous: SensorStats;
  changes: {
    tempChange: number;
    humChange: number;
    readingsChange: number;
  };
  trends: {
    temperature: TrendData;
    humidity: TrendData;
  };
}

// Mevcut fonksiyonlar...
export const calculateStats = (data: SensorData[]): SensorStats => {
  if (data.length === 0) {
    return {
      minTemp: 0,
      maxTemp: 0,
      avgTemp: 0,
      minHum: 0,
      maxHum: 0,
      avgHum: 0,
      totalReadings: 0,
      lastUpdate: new Date().toISOString()
    };
  }

  const temps = data.map(d => d.temperature);
  const hums = data.map(d => d.humidity);

  return {
    minTemp: Math.min(...temps),
    maxTemp: Math.max(...temps),
    avgTemp: temps.reduce((a, b) => a + b, 0) / temps.length,
    minHum: Math.min(...hums),
    maxHum: Math.max(...hums),
    avgHum: hums.reduce((a, b) => a + b, 0) / hums.length,
    totalReadings: data.length,
    lastUpdate: data[0].measurement_time || data[0].measurementTime
  };
};

export const generateChartData = (data: SensorData[], limit: number = 20) => {
  const sortedData = [...data]
    .sort((a, b) => new Date(a.measurement_time || a.measurementTime).getTime() - 
                    new Date(b.measurement_time || b.measurementTime).getTime())
    .slice(-limit);

  return {
    labels: sortedData.map(d => new Date(d.measurement_time || d.measurementTime).toLocaleTimeString('tr-TR')),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: sortedData.map(d => d.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        yAxisID: 'y-temp',
      },
      {
        label: 'Nem (%)',
        data: sortedData.map(d => d.humidity),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        yAxisID: 'y-hum',
      }
    ]
  };
};

// *** YENİ GELİŞMİŞ ANALİTİK FONKSİYONLARI ***

// 1. Basit Lineer Regresyon ile Tahmin
export const calculateTrend = (data: SensorData[], type: 'temperature' | 'humidity'): TrendData => {
  if (data.length < 2) {
    return {
      slope: 0,
      direction: 'stable',
      prediction: [],
      confidence: 0
    };
  }

  const sortedData = [...data].sort((a, b) => 
    new Date(a.measurement_time || a.measurementTime).getTime() - 
    new Date(b.measurement_time || b.measurementTime).getTime()
  );

  const values = sortedData.map(d => type === 'temperature' ? d.temperature : d.humidity);
  const n = values.length;
  
  // X değerleri (zaman indeksi)
  const x = Array.from({ length: n }, (_, i) => i);
  
  // Lineer regresyon hesaplama
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * values[i], 0);
  const sumXX = x.reduce((acc, xi) => acc + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Gelecek 5 değer tahmini
  const prediction = Array.from({ length: 5 }, (_, i) => slope * (n + i) + intercept);
  
  // R-squared hesaplama (güven seviyesi)
  const yMean = sumY / n;
  const ssRes = values.reduce((acc, yi, i) => acc + Math.pow(yi - (slope * i + intercept), 2), 0);
  const ssTot = values.reduce((acc, yi) => acc + Math.pow(yi - yMean, 2), 0);
  const rSquared = 1 - (ssRes / ssTot);
  
  return {
    slope,
    direction: Math.abs(slope) < 0.01 ? 'stable' : slope > 0 ? 'increasing' : 'decreasing',
    prediction,
    confidence: Math.max(0, Math.min(1, rSquared))
  };
};

// 2. Anomali Tespiti (Z-Score yöntemi)
export const detectAnomalies = (data: SensorData[], threshold: number = 2): AnomalyResult[] => {
  if (data.length < 3) return [];

  const results: AnomalyResult[] = [];
  
  // Sıcaklık anomalileri
  const temps = data.map(d => d.temperature);
  const tempMean = temps.reduce((a, b) => a + b, 0) / temps.length;
  const tempStd = Math.sqrt(temps.reduce((acc, temp) => acc + Math.pow(temp - tempMean, 2), 0) / temps.length);
  
  // Nem anomalileri
  const hums = data.map(d => d.humidity);
  const humMean = hums.reduce((a, b) => a + b, 0) / hums.length;
  const humStd = Math.sqrt(hums.reduce((acc, hum) => acc + Math.pow(hum - humMean, 2), 0) / hums.length);
  
  data.forEach(d => {
    // Sıcaklık anomali kontrol
    const tempZScore = Math.abs(d.temperature - tempMean) / tempStd;
    if (tempZScore > threshold) {
      results.push({
        isAnomaly: true,
        score: tempZScore,
        threshold,
        type: 'temperature',
        value: d.temperature,
        timestamp: d.measurement_time || d.measurementTime
      });
    }
    
    // Nem anomali kontrol
    const humZScore = Math.abs(d.humidity - humMean) / humStd;
    if (humZScore > threshold) {
      results.push({
        isAnomaly: true,
        score: humZScore,
        threshold,
        type: 'humidity',
        value: d.humidity,
        timestamp: d.measurement_time || d.measurementTime
      });
    }
  });
  
  return results;
};

// 3. Korelasyon Analizi
export const calculateCorrelation = (data: SensorData[]): CorrelationResult => {
  if (data.length < 2) {
    return {
      coefficient: 0,
      strength: 'very_weak',
      relationship: 'none'
    };
  }

  const temps = data.map(d => d.temperature);
  const hums = data.map(d => d.humidity);
  const n = data.length;
  
  const tempMean = temps.reduce((a, b) => a + b, 0) / n;
  const humMean = hums.reduce((a, b) => a + b, 0) / n;
  
  let numerator = 0;
  let tempSumSq = 0;
  let humSumSq = 0;
  
  for (let i = 0; i < n; i++) {
    const tempDiff = temps[i] - tempMean;
    const humDiff = hums[i] - humMean;
    
    numerator += tempDiff * humDiff;
    tempSumSq += tempDiff * tempDiff;
    humSumSq += humDiff * humDiff;
  }
  
  const coefficient = numerator / Math.sqrt(tempSumSq * humSumSq);
  
  const absCoeff = Math.abs(coefficient);
  let strength: CorrelationResult['strength'];
  if (absCoeff < 0.2) strength = 'very_weak';
  else if (absCoeff < 0.4) strength = 'weak';
  else if (absCoeff < 0.6) strength = 'moderate';
  else if (absCoeff < 0.8) strength = 'strong';
  else strength = 'very_strong';
  
  const relationship = Math.abs(coefficient) < 0.1 ? 'none' : coefficient > 0 ? 'positive' : 'negative';
  
  return {
    coefficient,
    strength,
    relationship
  };
};

// 4. Veri Karşılaştırma (Dönemsel)
export const comparePeriodsData = (currentData: SensorData[], previousData: SensorData[]): ComparisonResult => {
  const currentStats = calculateStats(currentData);
  const previousStats = calculateStats(previousData);
  
  return {
    current: currentStats,
    previous: previousStats,
    changes: {
      tempChange: ((currentStats.avgTemp - previousStats.avgTemp) / previousStats.avgTemp) * 100,
      humChange: ((currentStats.avgHum - previousStats.avgHum) / previousStats.avgHum) * 100,
      readingsChange: currentStats.totalReadings - previousStats.totalReadings
    },
    trends: {
      temperature: calculateTrend(currentData, 'temperature'),
      humidity: calculateTrend(currentData, 'humidity')
    }
  };
};

// 5. Günlük/Haftalık/Aylık Veri Grupalama
export const groupDataByPeriod = (data: SensorData[], period: 'day' | 'week' | 'month') => {
  const grouped: { [key: string]: SensorData[] } = {};
  
  data.forEach(item => {
    const date = new Date(item.measurement_time || item.measurementTime);
    let key: string;
    
    switch (period) {
      case 'day':
        key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        break;
      case 'week':
        const startOfWeek = new Date(date);
        startOfWeek.setDate(date.getDate() - date.getDay());
        key = startOfWeek.toISOString().split('T')[0];
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
    }
    
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(item);
  });
  
  return grouped;
};

// 6. Tahmin Grafiği için Veri
export const generatePredictionChart = (data: SensorData[], type: 'temperature' | 'humidity') => {
  const trend = calculateTrend(data, type);
  const sortedData = [...data].sort((a, b) => 
    new Date(a.measurement_time || a.measurementTime).getTime() - 
    new Date(b.measurement_time || b.measurementTime).getTime()
  ).slice(-20);

  const labels = [
    ...sortedData.map(d => new Date(d.measurement_time || d.measurementTime).toLocaleTimeString('tr-TR')),
    ...Array.from({ length: 5 }, (_, i) => `Tahmin ${i + 1}`)
  ];

  const actualData = sortedData.map(d => type === 'temperature' ? d.temperature : d.humidity);
  const predictionData = [
    ...Array(actualData.length).fill(null),
    ...trend.prediction
  ];

  return {
    labels,
    datasets: [
      {
        label: `Gerçek ${type === 'temperature' ? 'Sıcaklık' : 'Nem'}`,
        data: [...actualData, ...Array(5).fill(null)],
        borderColor: type === 'temperature' ? 'rgb(255, 99, 132)' : 'rgb(53, 162, 235)',
        backgroundColor: type === 'temperature' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
        fill: false,
      },
      {
        label: `Tahmin ${type === 'temperature' ? 'Sıcaklık' : 'Nem'}`,
        data: predictionData,
        borderColor: type === 'temperature' ? 'rgba(255, 99, 132, 0.6)' : 'rgba(53, 162, 235, 0.6)',
        backgroundColor: type === 'temperature' ? 'rgba(255, 99, 132, 0.2)' : 'rgba(53, 162, 235, 0.2)',
        borderDash: [5, 5],
        fill: false,
      }
    ]
  };
};

// Mevcut alert fonksiyonları...
export interface AlertConfig {
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
}

export interface Alert {
  id: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'high' | 'low';
  sensorId: string;
}

export const checkAlerts = (data: SensorData, config: AlertConfig): Alert[] => {
  const alerts: Alert[] = [];
  const timestamp = data.measurement_time || data.measurementTime;

  if (data.temperature > config.tempMax) {
    alerts.push({
      id: `temp-high-${data.id}-${Date.now()}`,
      type: 'temperature',
      value: data.temperature,
      threshold: config.tempMax,
      timestamp,
      status: 'high',
      sensorId: String(data.id)
    });
  } else if (data.temperature < config.tempMin) {
    alerts.push({
      id: `temp-low-${data.id}-${Date.now()}`,
      type: 'temperature',
      value: data.temperature,
      threshold: config.tempMin,
      timestamp,
      status: 'low',
      sensorId: String(data.id)
    });
  }

  if (data.humidity > config.humMax) {
    alerts.push({
      id: `hum-high-${data.id}-${Date.now()}`,
      type: 'humidity',
      value: data.humidity,
      threshold: config.humMax,
      timestamp,
      status: 'high',
      sensorId: String(data.id)
    });
  } else if (data.humidity < config.humMin) {
    alerts.push({
      id: `hum-low-${data.id}-${Date.now()}`,
      type: 'humidity',
      value: data.humidity,
      threshold: config.humMin,
      timestamp,
      status: 'low',
      sensorId: String(data.id)
    });
  }

  return alerts;
}; 