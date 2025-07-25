import React from 'react';
import { Line } from 'react-chartjs-2';
import { SensorData } from '../services/api';

interface MiniChartProps {
  data: SensorData[];
  dataKey: 'temperature' | 'humidity';
  unit: string;
}

const MiniChart: React.FC<MiniChartProps> = ({
  data,
  dataKey,
  unit,
}) => {
  const chartData = {
    labels: data.map(d => new Date(d.measurement_time || d.measurementTime).toLocaleTimeString('tr-TR')),
    datasets: [
      {
        label: `${dataKey === 'temperature' ? 'Sıcaklık' : 'Nem'} (${unit})`,
        data: data.map(d => d[dataKey]),
        borderColor: dataKey === 'temperature' ? 'rgb(255, 99, 132)' : 'rgb(53, 162, 235)',
        backgroundColor: dataKey === 'temperature' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: true,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default MiniChart; 