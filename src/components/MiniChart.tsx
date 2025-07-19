import React from 'react';
import { Card } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import { SensorData } from '../services/api';
import { ChartOptions } from 'chart.js';

interface MiniChartProps {
  title: string;
  data: SensorData[];
  dataKey: 'temperature' | 'humidity';
  unit: string;
  color: string;
}

const MiniChart: React.FC<MiniChartProps> = ({
  title,
  data,
  dataKey,
  unit,
  color,
}) => {
  const chartData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString('tr-TR')),
    datasets: [
      {
        label: `${dataKey === 'temperature' ? 'Sıcaklık' : 'Nem'} (${unit})`,
        data: data.map(d => d[dataKey]),
        borderColor: color,
        backgroundColor: color + '20',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        borderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
        type: 'category',
      },
      y: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          callback: function(value) {
            return value.toString() + unit;
          }
        },
      },
    },
  };

  const currentValue = data.length > 0 ? data[data.length - 1][dataKey] : 0;

  return (
    <Card className="h-100 border-0 shadow-sm">
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="mb-0">{title}</h6>
          <span className="fs-5 fw-bold" style={{ color }}>
            {currentValue}
            {unit}
          </span>
        </div>
        <div style={{ height: '100px' }}>
          <Line data={chartData} options={options} />
        </div>
      </Card.Body>
    </Card>
  );
};

export default MiniChart; 