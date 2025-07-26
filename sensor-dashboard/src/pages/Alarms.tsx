import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { fetchSensorData, SensorData } from '../services/api';
import { checkAlerts, Alert, AlertConfig } from '../services/dataAnalysis';

const Alarms: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [alarms, setAlarms] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // API'den gelen gerçek veriler için eşik değerleri
  const alertConfig: AlertConfig = {
    tempMin: 20,
    tempMax: 26,
    humMin: 40,
    humMax: 60
  };

  const loadAlarms = async () => {
    try {
      setLoading(true);
      // API'den gerçek sensör verilerini al
      const sensorData = await fetchSensorData();
      
      // Tüm sensör verileri için alarmları kontrol et
      const allAlarms: Alert[] = [];
      sensorData.forEach(data => {
        const alerts = checkAlerts(data, alertConfig);
        allAlarms.push(...alerts);
      });
      
      // Tarihe göre sırala (en yeni önce)
      const sortedAlarms = allAlarms.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      
      setAlarms(sortedAlarms);
      setError(null);
    } catch (err) {
      console.error('Alarmlar yüklenirken hata:', err);
      setError('Alarmlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
    // Her 30 saniyede bir güncelle
    const interval = setInterval(loadAlarms, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleResolve = (alarmId: string) => {
    // Alarm çözüldü olarak işaretle (localStorage'da saklanabilir)
    setAlarms(prevAlarms => 
      prevAlarms.map(alarm => 
        alarm.id === alarmId 
          ? { ...alarm, status: alarm.status } // Zaten API'den gelen durum
          : alarm
      )
    );
  };

  const getStatusBadge = (alert: Alert) => {
    return alert.status === 'high' ? (
      <span className="badge bg-danger-subtle text-danger-emphasis">
        <i className="bi bi-arrow-up me-1"></i>
        Yüksek
      </span>
    ) : (
      <span className="badge bg-info-subtle text-info-emphasis">
        <i className="bi bi-arrow-down me-1"></i>
        Düşük
      </span>
    );
  };

  const getTypeIcon = (type: 'temperature' | 'humidity') => {
    return type === 'temperature' ? (
      <i className="bi bi-thermometer-half text-danger"></i>
    ) : (
      <i className="bi bi-droplet-fill text-info"></i>
    );
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMins < 1) return 'Az önce';
    if (diffMins < 60) return `${diffMins} dakika önce`;
    if (diffHours < 24) return `${diffHours} saat önce`;
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="loading-shimmer rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}></div>
          <h5 className="text-muted">Alarmlar yükleniyor...</h5>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="app-card">
          <div className="app-card-body text-center">
            <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-3 text-danger">Yükleme Hatası</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="btn btn-primary" onClick={loadAlarms}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Tekrar Dene
            </button>
          </div>
        </div>
            </div>
    );
  }

  return (
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-gradient mb-1">🚨 Aktif Alarmlar</h2>
              <p className="text-muted mb-0">Gerçek zamanlı sensör uyarıları</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-danger-subtle text-danger-emphasis">
                <i className="bi bi-bell me-1"></i>
                {alarms.length} alarm
              </span>
              <button className="btn btn-sm btn-outline-primary" onClick={loadAlarms}>
                <i className="bi bi-arrow-clockwise me-1"></i>
                Yenile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alarms Card */}
      <div className="app-card fade-in">
        <div className="app-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Alarm Listesi
            </h5>
            <small className="text-muted">
              Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
            </small>
          </div>
            </div>
        <div className="app-card-body">
          {alarms.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-check-circle text-success" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-success">Aktif Alarm Yok</h5>
              <p className="text-muted">Tüm sensör değerleri normal aralıkta.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                <tr>
                  <th>Sensör</th>
                  <th>Tip</th>
                    <th>Değer</th>
                    <th>Eşik</th>
                  <th>Durum</th>
                    <th>Zaman</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                  {alarms.map((alarm, index) => (
                    <tr 
                      key={alarm.id} 
                      className="fade-in"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <td>
                        <span className="badge bg-primary-subtle text-primary-emphasis">
                          Sensör {alarm.sensorId}
                        </span>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          {getTypeIcon(alarm.type)}
                          <span>{alarm.type === 'temperature' ? 'Sıcaklık' : 'Nem'}</span>
                        </div>
                      </td>
                    <td>
                        <span className={`fw-bold ${alarm.status === 'high' ? 'text-danger' : 'text-info'}`}>
                          {alarm.value.toFixed(1)}
                          {alarm.type === 'temperature' ? '°C' : '%'}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted">
                          {alarm.threshold.toFixed(1)}
                          {alarm.type === 'temperature' ? '°C' : '%'}
                      </span>
                      </td>
                      <td>
                        {getStatusBadge(alarm)}
                    </td>
                    <td>
                        <small className="text-muted">
                          {formatDate(alarm.timestamp)}
                        </small>
                    </td>
                      <td>
                        <div className="dropdown">
                          <button 
                            className="btn btn-sm btn-outline-secondary dropdown-toggle"
                            data-bs-toggle="dropdown"
                          >
                            <i className="bi bi-three-dots"></i>
                          </button>
                          <ul className="dropdown-menu">
                            <li>
                              <button 
                                className="dropdown-item"
                          onClick={() => handleResolve(alarm.id)}
                        >
                                <i className="bi bi-check me-2"></i>
                                Çözüldü İşaretle
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button className="dropdown-item text-muted">
                                <i className="bi bi-info-circle me-2"></i>
                                Detaylar
                              </button>
                            </li>
                          </ul>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alarms; 