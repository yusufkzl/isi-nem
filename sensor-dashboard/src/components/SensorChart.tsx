import React from 'react';
import { Line } from 'react-chartjs-2';
import { SensorData } from '../services/api';

interface Props {
  data: SensorData[];
}

const SensorChart: React.FC<Props> = ({ data }) => {
  const now = new Date();
  const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const filtered = data.filter(d => {
    const t = new Date(d.measurement_time || d.measurementTime);
    return t >= threeHoursAgo && t <= now;
  });

  const labels = filtered.map(d => {
    const t = new Date(d.measurement_time || d.measurementTime);
    return `${t.toLocaleDateString('tr-TR')} ${t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: filtered.map(d => d.temperature),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.2)',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#ff6384',
        pointRadius: 5,
        tension: 0.4,
        yAxisID: 'y',
      },
      {
        label: 'Nem (%)',
        data: filtered.map(d => d.humidity),
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.2)',
        pointBackgroundColor: '#fff',
        pointBorderColor: '#36a2eb',
        pointRadius: 5,
        tension: 0.4,
        yAxisID: 'y',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
      tooltip: { enabled: true }
    },
    scales: {
      x: {
        title: { display: true, text: 'Tarih ve Saat' },
        ticks: { autoSkip: false, maxRotation: 45, minRotation: 45 }
      },
      y: {
        title: { display: true, text: 'Değer' },
        min: Math.min(0, ...filtered.map(d => d.temperature), ...filtered.map(d => d.humidity)),
        max: 100
      }
    }
  };

  return (
    <div className="app-card-compact bg-light-subtle border-0 mb-3 p-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <i className="bi bi-graph-up-arrow text-primary fs-5"></i>
        <span className="fw-bold">Sıcaklık ve Nem Grafiği</span>
      </div>
      <Line data={chartData} options={chartOptions} height={300} />
    </div>
  );
};

export default SensorChart;

