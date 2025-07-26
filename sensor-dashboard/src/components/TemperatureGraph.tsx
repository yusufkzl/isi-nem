import React from 'react';
import { Line } from 'react-chartjs-2';
import { SensorData } from '../services/api';

interface TemperatureGraphProps {
  data: SensorData[];
}

const TemperatureGraph: React.FC<TemperatureGraphProps> = ({ data }) => {
  const chartData = {
    labels: data.map(d => new Date(d.measurement_time || d.measurementTime).toLocaleTimeString('tr-TR')),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: data.map(d => d.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
      {
        label: 'Nem (%)',
        data: data.map(d => d.humidity),
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Sıcaklık ve Nem Grafiği',
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default TemperatureGraph; 