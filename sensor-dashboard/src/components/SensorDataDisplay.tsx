import React, { useEffect, useState } from 'react';
import { fetchSensorData, isDataFromCache } from '../services/api';

const SensorDataDisplay: React.FC = () => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchSensorData();
        setSensorData(data);
        setIsUsingCachedData(isDataFromCache());
        setError(null);
      } catch (err) {
        // Only set error if we have no data at all
        if (sensorData.length === 0) {
        setError('Failed to load sensor data');
        }
      }
    };

    getData();
  }, []);

  if (error && sensorData.length === 0) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {isUsingCachedData && (
        <div style={{ background: '#fff3cd', padding: '8px', marginBottom: '16px', borderRadius: '4px' }}>
          ⚠️ Showing cached data - connection issue
        </div>
      )}
      <h2>Sensor Data</h2>
      <ul>
        {sensorData.map((sensor, index) => (
          <li key={index}>
            ID: {sensor.id}, Temperature: {sensor.temperature}°C, Humidity: {sensor.humidity}%, Date: {sensor.measurementTime}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SensorDataDisplay; 