import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { SensorData, fetchSensorData } from '../services/api';

interface Alarm {
  id: number;
  sensorId: string;
  type: 'temperature' | 'humidity';
  value: number;
  threshold: number;
  status: 'high' | 'low';
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  acknowledged: boolean;
  message: string;
}

const AlarmHistory: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [filteredAlarms, setFilteredAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [alarmsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'temperature' | 'humidity'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'high' | 'low'>('all');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'low' | 'medium' | 'high' | 'critical'>('all');
  const [sortBy, setSortBy] = useState<'timestamp' | 'severity' | 'type'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Gelişmiş eşik değerleri (severity bazlı)
  const thresholds = {
    temperature: { 
      min: 20, max: 26,
      critical: { min: 15, max: 35 },
      high: { min: 18, max: 30 },
      medium: { min: 19, max: 28 }
    },
    humidity: { 
      min: 40, max: 60,
      critical: { min: 20, max: 80 },
      high: { min: 30, max: 70 },
      medium: { min: 35, max: 65 }
    }
  };

  const getSeverity = (value: number, type: 'temperature' | 'humidity', status: 'high' | 'low'): 'low' | 'medium' | 'high' | 'critical' => {
    const typeThresholds = thresholds[type];
    
    if (status === 'high') {
      if (value >= typeThresholds.critical.max) return 'critical';
      if (value >= typeThresholds.high.max) return 'high';
      if (value >= typeThresholds.medium.max) return 'medium';
      return 'low';
    } else {
      if (value <= typeThresholds.critical.min) return 'critical';
      if (value <= typeThresholds.high.min) return 'high';
      if (value <= typeThresholds.medium.min) return 'medium';
      return 'low';
    }
  };

  const generateAlarms = (data: SensorData[]): Alarm[] => {
    const alarmList: Alarm[] = [];
    let alarmId = 1;

    data.forEach((reading) => {
      const timestamp = reading.measurement_time || reading.measurementTime;
      
      // Sıcaklık kontrolleri
      if (reading.temperature > thresholds.temperature.max) {
        const severity = getSeverity(reading.temperature, 'temperature', 'high');
        alarmList.push({
          id: alarmId++,
          sensorId: String(reading.id),
          type: 'temperature',
          value: reading.temperature,
          threshold: thresholds.temperature.max,
          status: 'high',
          severity,
          timestamp,
          acknowledged: false, // Yeni alarmlar otomatik olarak onaylanmamış
          message: `Sıcaklık yüksek: ${reading.temperature.toFixed(1)}°C (Limit: ${thresholds.temperature.max}°C)`
        });
      }
      
      if (reading.temperature < thresholds.temperature.min) {
        const severity = getSeverity(reading.temperature, 'temperature', 'low');
        alarmList.push({
          id: alarmId++,
          sensorId: String(reading.id),
          type: 'temperature',
          value: reading.temperature,
          threshold: thresholds.temperature.min,
          status: 'low',
          severity,
          timestamp,
          acknowledged: false,
          message: `Sıcaklık düşük: ${reading.temperature.toFixed(1)}°C (Limit: ${thresholds.temperature.min}°C)`
        });
      }

      // Nem kontrolleri
      if (reading.humidity > thresholds.humidity.max) {
        const severity = getSeverity(reading.humidity, 'humidity', 'high');
        alarmList.push({
          id: alarmId++,
          sensorId: String(reading.id),
          type: 'humidity',
          value: reading.humidity,
          threshold: thresholds.humidity.max,
          status: 'high',
          severity,
          timestamp,
          acknowledged: false,
          message: `Nem yüksek: ${reading.humidity.toFixed(1)}% (Limit: ${thresholds.humidity.max}%)`
        });
      }
      
      if (reading.humidity < thresholds.humidity.min) {
        const severity = getSeverity(reading.humidity, 'humidity', 'low');
        alarmList.push({
          id: alarmId++,
          sensorId: String(reading.id),
          type: 'humidity',
          value: reading.humidity,
          threshold: thresholds.humidity.min,
          status: 'low',
          severity,
          timestamp,
          acknowledged: false,
          message: `Nem düşük: ${reading.humidity.toFixed(1)}% (Limit: ${thresholds.humidity.min}%)`
        });
      }
    });

    return alarmList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const loadAlarms = async () => {
    try {
      setLoading(true);
      const data = await fetchSensorData();
      const alarmList = generateAlarms(data);
      setAlarms(alarmList);
      setFilteredAlarms(alarmList);
      setError(null);
    } catch (err) {
      setError('Alarm verileri yüklenirken bir hata oluştu.');
      console.error('Alarm yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlarms();
    const interval = setInterval(loadAlarms, 60000); // Her dakika güncelle
    return () => clearInterval(interval);
  }, []);

  // Filtreleme ve arama
  useEffect(() => {
    let filtered = [...alarms];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(alarm => 
        alarm.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alarm.sensorId.includes(searchTerm) ||
        alarm.type.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tip filtresi
    if (filterType !== 'all') {
      filtered = filtered.filter(alarm => alarm.type === filterType);
    }

    // Durum filtresi
    if (filterStatus !== 'all') {
      filtered = filtered.filter(alarm => alarm.status === filterStatus);
    }

    // Önem derecesi filtresi
    if (filterSeverity !== 'all') {
      filtered = filtered.filter(alarm => alarm.severity === filterSeverity);
    }

    // Sıralama
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === 'timestamp') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredAlarms(filtered);
    setCurrentPage(1); // Filtreleme yapıldığında ilk sayfaya dön
  }, [alarms, searchTerm, filterType, filterStatus, filterSeverity, sortBy, sortOrder]);

  // Sayfalama
  const indexOfLastAlarm = currentPage * alarmsPerPage;
  const indexOfFirstAlarm = indexOfLastAlarm - alarmsPerPage;
  const currentAlarms = filteredAlarms.slice(indexOfFirstAlarm, indexOfLastAlarm);
  const totalPages = Math.ceil(filteredAlarms.length / alarmsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const toggleAcknowledged = (alarmId: number) => {
    setAlarms(prev => prev.map(alarm => 
      alarm.id === alarmId 
        ? { ...alarm, acknowledged: !alarm.acknowledged }
        : alarm
    ));
  };

  const clearAllAlarms = () => {
    if (window.confirm('Tüm alarmları temizlemek istediğinizden emin misiniz?')) {
      setAlarms([]);
      setFilteredAlarms([]);
    }
  };

  const getSeverityBadge = (severity: string) => {
    const severityConfig = {
      low: { bg: 'success', text: 'Düşük', icon: 'bi-info-circle' },
      medium: { bg: 'warning', text: 'Orta', icon: 'bi-exclamation-triangle' },
      high: { bg: 'danger', text: 'Yüksek', icon: 'bi-exclamation-circle' },
      critical: { bg: 'dark', text: 'Kritik', icon: 'bi-lightning-fill' }
    };
    
    const config = severityConfig[severity as keyof typeof severityConfig];
    return (
      <span className={`badge bg-${config.bg}-subtle text-${config.bg}-emphasis`}>
        <i className={`${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const getTypeIcon = (type: 'temperature' | 'humidity') => {
    return type === 'temperature' ? 
      <i className="bi bi-thermometer-half text-danger"></i> : 
      <i className="bi bi-droplet-fill text-info"></i>;
  };

  const getStatusBadge = (status: 'high' | 'low') => {
    return (
      <span className={`badge bg-${status === 'high' ? 'danger' : 'info'}-subtle text-${status === 'high' ? 'danger' : 'info'}-emphasis`}>
        {status === 'high' ? '↗️ Yüksek' : '↘️ Düşük'}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Az önce';
    if (diffHours < 24) return `${diffHours} saat önce`;
    if (diffDays < 7) return `${diffDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAlarmStats = () => {
    const stats = {
      total: alarms.length,
      unacknowledged: alarms.filter(a => !a.acknowledged).length,
      critical: alarms.filter(a => a.severity === 'critical').length,
      high: alarms.filter(a => a.severity === 'high').length,
      temperature: alarms.filter(a => a.type === 'temperature').length,
      humidity: alarms.filter(a => a.type === 'humidity').length
    };
    return stats;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="loading-shimmer rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}></div>
          <h5 className="text-muted">Alarm geçmişi yükleniyor...</h5>
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

  const stats = getAlarmStats();

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-gradient mb-1">🚨 Alarm Geçmişi</h2>
              <p className="text-muted mb-0">Sensör alarmları ve bildirimler</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-primary-subtle text-primary-emphasis">
                Toplam: {stats.total}
              </span>
              {stats.unacknowledged > 0 && (
                <span className="badge bg-warning-subtle text-warning-emphasis">
                  Onaylanmamış: {stats.unacknowledged}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="row g-3 mb-4">
        <div className="col-md-2">
          <div className="metric-card text-center fade-in">
            <div className="metric-icon text-primary">
              <i className="bi bi-bell"></i>
            </div>
            <div className="metric-value">{stats.total}</div>
            <div className="metric-label">Toplam Alarm</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="metric-card text-center fade-in stagger-delay-1">
            <div className="metric-icon text-warning">
              <i className="bi bi-exclamation-triangle"></i>
            </div>
            <div className="metric-value">{stats.unacknowledged}</div>
            <div className="metric-label">Onaylanmamış</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="metric-card text-center fade-in stagger-delay-2">
            <div className="metric-icon text-dark">
              <i className="bi bi-lightning-fill"></i>
            </div>
            <div className="metric-value">{stats.critical}</div>
            <div className="metric-label">Kritik</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="metric-card text-center fade-in stagger-delay-3">
            <div className="metric-icon text-danger">
              <i className="bi bi-thermometer-half"></i>
            </div>
            <div className="metric-value">{stats.temperature}</div>
            <div className="metric-label">Sıcaklık</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="metric-card text-center fade-in stagger-delay-4">
            <div className="metric-icon text-info">
              <i className="bi bi-droplet-fill"></i>
            </div>
            <div className="metric-value">{stats.humidity}</div>
            <div className="metric-label">Nem</div>
          </div>
        </div>
        <div className="col-md-2">
          <div className="metric-card text-center fade-in stagger-delay-4">
            <div className="metric-icon text-danger">
              <i className="bi bi-exclamation-circle"></i>
            </div>
            <div className="metric-value">{stats.high}</div>
            <div className="metric-label">Yüksek</div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="app-card mb-4 fade-in">
        <div className="app-card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label className="form-label small fw-semibold">🔍 Arama</label>
              <input
                type="text"
                className="form-control"
                placeholder="Alarm ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">📊 Tip</label>
              <select
                className="form-select"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="temperature">Sıcaklık</option>
                <option value="humidity">Nem</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">📈 Durum</label>
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="high">Yüksek</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">⚡ Önem</label>
              <select
                className="form-select"
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value as any)}
              >
                <option value="all">Tümü</option>
                <option value="critical">Kritik</option>
                <option value="high">Yüksek</option>
                <option value="medium">Orta</option>
                <option value="low">Düşük</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">🔄 Sırala</label>
              <select
                className="form-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, order] = e.target.value.split('-');
                  setSortBy(by as any);
                  setSortOrder(order as any);
                }}
              >
                <option value="timestamp-desc">Tarih (Yeni)</option>
                <option value="timestamp-asc">Tarih (Eski)</option>
                <option value="severity-desc">Önem (Yüksek)</option>
                <option value="severity-asc">Önem (Düşük)</option>
                <option value="type-asc">Tip (A-Z)</option>
              </select>
            </div>
            <div className="col-md-1">
              <label className="form-label small fw-semibold">&nbsp;</label>
              <button
                className="btn btn-outline-danger w-100"
                onClick={clearAllAlarms}
                title="Tüm alarmları temizle"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alarms Table */}
      <div className="app-card fade-in">
        <div className="app-card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-list-ul me-2"></i>
              Alarm Listesi
            </h5>
            <span className="text-muted small">
              {filteredAlarms.length} sonuç gösteriliyor
            </span>
          </div>
        </div>
        <div className="app-card-body p-0">
          {currentAlarms.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
              <h5 className="mt-3 text-muted">Alarm bulunamadı</h5>
              <p className="text-muted">Filtreleri değiştirin veya yeni veriler için bekleyin.</p>
            </div>
      ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
            <tr>
                    <th style={{ width: '5%' }}>
                      <i className="bi bi-check-circle text-muted"></i>
                    </th>
                    <th style={{ width: '10%' }}>Tip</th>
                    <th style={{ width: '15%' }}>Sensör</th>
                    <th style={{ width: '20%' }}>Mesaj</th>
                    <th style={{ width: '10%' }}>Değer</th>
                    <th style={{ width: '10%' }}>Durum</th>
                    <th style={{ width: '10%' }}>Önem</th>
                    <th style={{ width: '15%' }}>Zaman</th>
                    <th style={{ width: '5%' }}>İşlem</th>
            </tr>
          </thead>
          <tbody>
                  {currentAlarms.map((alarm, index) => (
              <tr 
                key={alarm.id} 
                      className={`${!alarm.acknowledged ? 'table-warning' : ''} fade-in`}
                      style={{ animationDelay: `${index * 0.05}s` }}
              >
                      <td>
                        <button
                          className={`btn btn-sm ${alarm.acknowledged ? 'btn-success' : 'btn-outline-warning'}`}
                          onClick={() => toggleAcknowledged(alarm.id)}
                          title={alarm.acknowledged ? 'Onaylandı' : 'Onayla'}
                        >
                          <i className={`bi ${alarm.acknowledged ? 'bi-check-circle-fill' : 'bi-circle'}`}></i>
                        </button>
                </td>
                <td>
                        <div className="d-flex align-items-center gap-2">
                          {getTypeIcon(alarm.type)}
                          <span className="text-capitalize">{alarm.type === 'temperature' ? 'Sıcaklık' : 'Nem'}</span>
                        </div>
                </td>
                <td>
                        <span className="badge bg-primary-subtle text-primary-emphasis">
                          ID: {alarm.sensorId}
                  </span>
                </td>
                <td>
                        <small className="text-muted">{alarm.message}</small>
                      </td>
                      <td>
                        <span className={`fw-bold ${alarm.status === 'high' ? 'text-danger' : 'text-info'}`}>
                          {alarm.value.toFixed(1)}{alarm.type === 'temperature' ? '°C' : '%'}
                        </span>
                      </td>
                      <td>{getStatusBadge(alarm.status)}</td>
                      <td>{getSeverityBadge(alarm.severity)}</td>
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
                              <button className="dropdown-item" onClick={() => toggleAcknowledged(alarm.id)}>
                                <i className="bi bi-check me-2"></i>
                                {alarm.acknowledged ? 'Onayı Kaldır' : 'Onayla'}
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button className="dropdown-item text-danger">
                                <i className="bi bi-trash me-2"></i>
                                Sil
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="app-card-header border-top">
            <div className="d-flex justify-content-between align-items-center">
              <small className="text-muted">
                {indexOfFirstAlarm + 1}-{Math.min(indexOfLastAlarm, filteredAlarms.length)} / {filteredAlarms.length} alarm
              </small>
              <nav>
                <ul className="pagination pagination-sm mb-0">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                  </li>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    const pageNumber = Math.max(1, currentPage - 2) + index;
                    if (pageNumber > totalPages) return null;
                    
                    return (
                      <li key={pageNumber} className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                        <button 
                          className="page-link" 
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      </li>
                    );
                  })}
                  
                  <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                    <button 
                      className="page-link" 
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AlarmHistory; 