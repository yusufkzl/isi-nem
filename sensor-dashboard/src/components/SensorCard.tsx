import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { AlertConfig } from '../services/dataAnalysis';

interface Alert {
  id: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  timestamp: string;
  status: 'high' | 'low';
  sensorId: string;
}

interface SensorCardProps {
  id: string;
  name: string;
  temperature: number;
  humidity: number;
  timestamp: string;
  thresholds: AlertConfig;
  alerts: Alert[];
  historyData?: { timestamp: string; temperature: number; humidity: number }[];
  trendData: { time: string; value: number }[];
  onGoToSettings?: (id: string) => void;
  onShowHistory?: () => void;
}

const SensorCard: React.FC<SensorCardProps> = ({
  id,
  name,
  temperature,
  humidity,
  timestamp,
  alerts,
  thresholds,
  historyData,
  trendData,
  onGoToSettings,
  onShowHistory,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { isDarkMode } = useTheme();

  const getStatusColor = (value: number, type: 'temperature' | 'humidity'): string => {
    if (type === 'temperature') {
      if (value > thresholds.tempMax) return 'danger';
      if (value < thresholds.tempMin) return 'info';
      return 'success';
    } else {
      if (value > thresholds.humMax) return 'danger';
      if (value < thresholds.humMin) return 'info';
    return 'success';
    }
  };

  const getStatusText = (value: number, type: 'temperature' | 'humidity'): string => {
    if (type === 'temperature') {
      if (value > thresholds.tempMax) return 'Yüksek';
      if (value < thresholds.tempMin) return 'Düşük';
      return 'Normal';
    } else {
      if (value > thresholds.humMax) return 'Yüksek';
      if (value < thresholds.humMin) return 'Düşük';
      return 'Normal';
    }
  };

  const formatTime = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Şimdi';
    if (diffMins < 60) return `${diffMins} dk önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    return date.toLocaleDateString('tr-TR');
  };

  const getTrendIcon = (value: number, type: 'temperature' | 'humidity'): string => {
    // Basit trend hesaplama (gerçek implementasyonda son birkaç değer karşılaştırılır)
    const mid = type === 'temperature' ? (thresholds.tempMax + thresholds.tempMin) / 2 : (thresholds.humMax + thresholds.humMin) / 2;
    if (value > mid + 1) return 'bi-trending-up';
    if (value < mid - 1) return 'bi-trending-down';
    return 'bi-dash-lg';
  };

  const getTrendClass = (value: number, type: 'temperature' | 'humidity'): string => {
    const mid = type === 'temperature' ? (thresholds.tempMax + thresholds.tempMin) / 2 : (thresholds.humMax + thresholds.humMin) / 2;
    if (value > mid + 1) return 'trend-up';
    if (value < mid - 1) return 'trend-down';
    return 'trend-stable';
  };

  const chartData = {
    labels: trendData.map(d => d.time),
    datasets: [
      {
        label: 'Ölçüm',
        data: trendData.map(d => d.value),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.1)',
        pointBackgroundColor: '#0ea5e9',
        pointBorderColor: '#fff',
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: false,
        tension: 0.4,
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Değer: ${ctx.parsed.y}`,
        }
      }
    },
    scales: {
      x: { display: false },
      y: { display: false }
    }
  };

  // Bağlantı paylaşma fonksiyonu
  const handleShareLink = () => {
    const url = window.location.origin + `/dashboard?sensor=${id}`;
    navigator.clipboard.writeText(url);
    alert('Bağlantı panoya kopyalandı!');
  };

  return (
    <div className="app-card fade-in">
      <div className="app-card-body">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1">
              <i className="bi bi-cpu text-primary fs-5"></i>
              <h5 className="card-title mb-0 text-gradient">{name}</h5>
            </div>
            <div className="d-flex align-items-center gap-2">
              <small className="text-muted">ID: {id}</small>
              <span className="badge bg-primary-subtle text-primary-emphasis">Aktif</span>
            </div>
          </div>
          <div className="dropdown">
            <button className="btn btn-sm btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown">
              <i className="bi bi-three-dots"></i>
            </button>
            <ul className="dropdown-menu">
              <li>
                <button className="dropdown-item" onClick={() => onGoToSettings && onGoToSettings(id)}>
                  <i className="bi bi-gear me-2"></i>
                  Ayarlar
                </button>
              </li>
              {/* Geçmiş seçeneği kaldırıldı */}
            </ul>
          </div>
        </div>

        {/* Sensor Metrics */}
        <div className="row g-3 mb-4">
          {/* Sıcaklık */}
          <div className="col-md-6">
            <div className={`metric-card sensor-temp-card status-${getStatusColor(temperature, 'temperature')}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="metric-icon">
                  <i className="bi bi-thermometer-half"></i>
                </div>
                <div className="text-end">
                  <i className={`bi ${getTrendIcon(temperature, 'temperature')} ${getTrendClass(temperature, 'temperature')}`}></i>
                </div>
              </div>
              <div className="metric-value text-center">
                {temperature.toFixed(1)}°C
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="metric-label">Sıcaklık</small>
                <span className={`status-badge status-${getStatusColor(temperature, 'temperature')}`}>
                  {getStatusText(temperature, 'temperature')}
                </span>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  Limit: {thresholds.tempMin}°C - {thresholds.tempMax}°C
                </small>
              </div>
            </div>
          </div>

          {/* Nem */}
          <div className="col-md-6">
            <div className={`metric-card sensor-hum-card status-${getStatusColor(humidity, 'humidity')}`}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="metric-icon">
                  <i className="bi bi-droplet-half"></i>
                </div>
                <div className="text-end">
                  <i className={`bi ${getTrendIcon(humidity, 'humidity')} ${getTrendClass(humidity, 'humidity')}`}></i>
                </div>
              </div>
              <div className="metric-value text-center">
                {humidity.toFixed(1)}%
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <small className="metric-label">Nem</small>
                <span className={`status-badge status-${getStatusColor(humidity, 'humidity')}`}>
                  {getStatusText(humidity, 'humidity')}
                </span>
              </div>
              <div className="mt-2">
                <small className="text-muted">
                  Limit: {thresholds.humMin}% - {thresholds.humMax}%
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Mini Chart */}
        <div className="app-card-compact bg-light-subtle border-0 mb-3">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <small className="fw-semibold text-muted">Son 6 Ölçüm Trendi</small>
            <small className="text-muted">
              <i className="bi bi-clock me-1"></i>
              {formatTime(timestamp)}
            </small>
          </div>
          <div style={{ height: '60px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <div className="alert alert-warning border-0 shadow-sm">
            <div className="d-flex align-items-center">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              <small>
                <strong>{alerts.length} aktif uyarı</strong> - Son: {getStatusText(alerts[0].value, alerts[0].type)} {alerts[0].type === 'temperature' ? 'sıcaklık' : 'nem'}
              </small>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="d-flex gap-2 flex-wrap">
          <button 
            className="btn btn-sm btn-outline-secondary"
            onClick={handleShareLink}
          >
            <i className="bi bi-share me-1"></i>
            Bağlantıyı Paylaş
          </button>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowHistory(true)}
          >
            <i className="bi bi-list-ul me-1"></i>
            Detaylar
          </button>
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-gear me-2"></i>
                  Sensör Ayarları - {name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowSettings(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="alert alert-warning">
                  <i className="bi bi-tools me-2"></i>
                  Sensör ayarları global ayarlar sayfasından yapılandırılabilir.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Detaylar Modalı */}
      {showHistory && (
        <div className="modal fade show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-list-ul me-2"></i>
                  Sensör Geçmişi - {name}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowHistory(false)}
                ></button>
              </div>
              <div className="modal-body">
                {/* Örnek geçmiş verileri */}
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th>Tarih</th>
                      <th>Sıcaklık (°C)</th>
                      <th>Nem (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(historyData || []).slice(-10).reverse().map((item, idx) => (
                      <tr key={idx}>
                        <td>{new Date(item.timestamp).toLocaleString('tr-TR')}</td>
                        <td>{item.temperature.toFixed(1)}</td>
                        <td>{item.humidity.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SensorCard;