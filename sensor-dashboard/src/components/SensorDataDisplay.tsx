import React, { useEffect, useState } from 'react';
import { fetchSensorData } from '../services/api';

const SensorDataDisplay: React.FC = () => {
  const [sensorData, setSensorData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const data = await fetchSensorData();
        setSensorData(data);
      } catch (err) {
        setError('Failed to load sensor data');
      }
    };

    getData();
  }, []);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
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