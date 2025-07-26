import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { SensorStats } from '../services/dataAnalysis';

interface StatsCardProps {
  stats: SensorStats;
}

const StatsCard: React.FC<StatsCardProps> = ({ stats }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className={`card border-0 shadow-sm ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
      <div className="card-body">
        <h5 className="card-title mb-4">İstatistikler</h5>
        <div className="row g-3">
          <div className="col-md-6">
            <div className={`card ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-3">Sıcaklık İstatistikleri</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>En Düşük:</span>
                  <span className="text-info">{stats.minTemp.toFixed(1)}°C</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>En Yüksek:</span>
                  <span className="text-danger">{stats.maxTemp.toFixed(1)}°C</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Ortalama:</span>
                  <span className="text-success">{stats.avgTemp.toFixed(1)}°C</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className={`card ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
              <div className="card-body">
                <h6 className="card-subtitle mb-3">Nem İstatistikleri</h6>
                <div className="d-flex justify-content-between mb-2">
                  <span>En Düşük:</span>
                  <span className="text-info">{stats.minHum.toFixed(1)}%</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>En Yüksek:</span>
                  <span className="text-danger">{stats.maxHum.toFixed(1)}%</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span>Ortalama:</span>
                  <span className="text-success">{stats.avgHum.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-3 text-muted small">
          <div>Toplam Ölçüm: {stats.totalReadings}</div>
          <div>Son Güncelleme: {new Date(stats.lastUpdate).toLocaleString('tr-TR')}</div>
        </div>
      </div>
    </div>
  );
};

export default StatsCard; 