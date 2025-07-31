import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import SensorCard from '../components/SensorCard';
import AlertNotification from '../components/AlertNotification';
import { Line } from 'react-chartjs-2';
import { fetchSensorData, getLatestSensorData, SensorData, isDataFromCache, getCacheTimestamp } from '../services/api';
import { 
  calculateStats, 
  generateChartData, 
  checkAlerts, 
  Alert, 
  AlertConfig,
  calculateTrend,
  detectAnomalies,
  calculateCorrelation,
  generatePredictionChart,
  TrendData,
  AnomalyResult,
  CorrelationResult
} from '../services/dataAnalysis';
import { notificationService } from '../services/notificationService';
import { exportService, ReportData } from '../services/exportService';
import { useNavigate } from 'react-router-dom';
import Select, { GroupBase, StylesConfig } from 'react-select';

const customStyles: StylesConfig<any, true, GroupBase<any>> = {
  control: (provided) => ({
    ...provided,
    borderRadius: 8,
    borderColor: '#d0d7de',
    boxShadow: 'none',
    minHeight: 48,
    fontSize: 16,
    backgroundColor: '#f8fafc',
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? '#e0f2fe'
      : state.isFocused
      ? '#f1f5f9'
      : '#fff',
    color: '#222',
    fontWeight: state.isSelected ? 'bold' : 'normal',
    fontSize: 15,
    padding: 12,
    cursor: 'pointer',
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: '#e0f2fe',
    borderRadius: 6,
    padding: '2px 6px',
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: '#0ea5e9',
    fontWeight: 'bold',
    fontSize: 14,
  }),
  multiValueRemove: (provided) => ({
    ...provided,
    color: '#0ea5e9',
    ':hover': {
      backgroundColor: '#bae6fd',
      color: '#1e293b',
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#64748b',
    fontSize: 15,
  }),
};

const Dashboard: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('lastSensorData');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [allData, setAllData] = useState<SensorData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<AlertConfig>({
    tempMin: 20,
    tempMax: 26,
    humMin: 40,
    humMax: 60
  });
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => getCacheTimestamp());
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationResult | null>(null);
  const [temperatureTrend, setTemperatureTrend] = useState<TrendData | null>(null);
  const [humidityTrend, setHumidityTrend] = useState<TrendData | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

  // Çoklu seçim için state
  const [selectedSensorIds, setSelectedSensorIds] = useState<string[]>([]);

  const navigate = useNavigate();

  // Sensör listesi (zaten var)
  const sensorList = allData
    .map(s => String(s.id))
    .filter((v, i, arr) => arr.indexOf(v) === i);

  // Ayarları yükle
  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  // Bildirim izni iste
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const performAdvancedAnalysis = (data: SensorData[]) => {
    if (data.length < 3) return;
    setAnomalies(detectAnomalies(data, 2));
    setTemperatureTrend(calculateTrend(data, 'temperature'));
    setHumidityTrend(calculateTrend(data, 'humidity'));
  };

  const loadSensorData = async () => {
    try {
      const data = await fetchSensorData();
      setSensorData(data);
      setLastUpdate(getCacheTimestamp());
      setAllData(data);
      setIsUsingCachedData(isDataFromCache());
      performAdvancedAnalysis(data);
      const latestData = getLatestSensorData(data);
      if (latestData.sensor1) {
        const newAlerts = checkAlerts(latestData.sensor1, settings);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts]);
          for (const alert of newAlerts) {
            await notificationService.sendNotification(alert);
          }
        }
      }
      setError(null);
    } catch (err) {
      if (allData.length === 0) {
        setError('Sensör verileri yüklenirken bir hata oluştu.');
      }
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensorData();
    const interval = setInterval(loadSensorData, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log('allData:', allData);
  }, [allData]);

  // Export fonksiyonları
  const handleExportCSV = () => exportService.exportToCSV(allData);
  const handleExportExcel = () => exportService.exportToExcel(allData, true);
  const handleExportPDF = () => {
    const reportData: ReportData = {
      stats: calculateStats(allData),
      data: allData,
      dateRange: {
        start: allData.length > 0 ? allData[0].measurement_time || allData[0].measurementTime : new Date().toISOString(),
        end: allData.length > 0 ? allData[allData.length - 1].measurement_time || allData[allData.length - 1].measurementTime : new Date().toISOString()
      },
      correlations: correlation || { coefficient: 0, strength: 'very_weak', relationship: 'none' },
      anomalies: anomalies,
      generatedAt: new Date().toISOString()
    };
    exportService.exportToPDF(reportData);
  };

  // Ayarlar sayfasına yönlendirme
  const handleGoToSettings = (sensorId: string) => {
    navigate(`/settings?sensor=${sensorId}`);
  };

  // Sensör seçimi için varsayılanı ayarla
  useEffect(() => {
    if (selectedSensorIds.length === 0 && sensorList.length > 0) {
      setSelectedSensorIds([sensorList[0]]);
    }
  }, [sensorList, selectedSensorIds]);

  // Sensör seçeneklerini react-select formatına dönüştür
  const sensorOptions = sensorList.map(id => ({
    value: id,
    label: (
      <span>
        <i className="bi bi-cpu me-2 text-primary"></i>
        Sensör {id}
      </span>
    )
  }));

  // Dashboard kartları için state
  type DashboardCard = {
    sensorId: string;
    visible: boolean;
    order: number;
  };

  const initialCards: DashboardCard[] = [
    { sensorId: '1', visible: true, order: 0 },
    { sensorId: '2', visible: true, order: 1 },
    { sensorId: '3', visible: false, order: 2 },
    // ...diğer sensörler
  ];

  const [dashboardCards, setDashboardCards] = useState<DashboardCard[]>(initialCards);

  const handleRemoveCard = (sensorId: string) => {
    setDashboardCards(cards =>
      cards.map(card =>
        card.sensorId === sensorId ? { ...card, visible: false } : card
      )
    );
  };

  const handleAddCard = (sensorId: string) => {
    setDashboardCards(cards =>
      cards.map(card =>
        card.sensorId === sensorId ? { ...card, visible: true } : card
      )
    );
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="loading-shimmer rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}></div>
          <h5 className="text-muted">Sensör verileri yükleniyor...</h5>
          <p className="text-muted mb-0">Bu işlem birkaç saniye sürebilir</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="app-card fade-in">
          <div className="app-card-body text-center">
            <i className="bi bi-exclamation-circle text-danger" style={{ fontSize: '3rem' }}></i>
            <h4 className="mt-3 text-danger">Bağlantı Hatası</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="btn btn-primary" onClick={loadSensorData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = calculateStats(allData);
  const chartData = {
    labels: allData.map(d => {
      const t = new Date(d.measurement_time || d.measurementTime);
      return `${t.toLocaleDateString('tr-TR')} ${t.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}`;
    }),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: allData.map(d => d.temperature),
        borderColor: '#ff6384',
        backgroundColor: 'rgba(255,99,132,0.2)',
        yAxisID: 'y',
        pointRadius: 4,
        tension: 0.4,
      },
      {
        label: 'Nem (%)',
        data: allData.map(d => d.humidity),
        borderColor: '#36a2eb',
        backgroundColor: 'rgba(54,162,235,0.2)',
        yAxisID: 'y',
        pointRadius: 4,
        tension: 0.4,
      }
    ]
  };

  return (
    <>
      <div className="container-fluid">
        {/* Sensör Seçimi */}
        <div className="mb-3" style={{ maxWidth: 400 }}>
          <label className="form-label fw-bold">Sensör Seç:</label>
          <Select
            options={sensorOptions}
            isMulti
            value={sensorOptions.filter(opt => selectedSensorIds.includes(opt.value))}
            onChange={selected => {
              setSelectedSensorIds(selected.map(opt => opt.value));
            }}
            placeholder="Sensör seçiniz..."
            closeMenuOnSelect={false}
            classNamePrefix="react-select"
            styles={customStyles}
          />
          <small className="text-muted">Bir veya birden fazla sensörü kutucuklardan seçebilirsiniz.</small>
        </div>

        {/* Hızlı İşlemler */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="app-card">
              <div className="app-card-body">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-lightning-charge text-warning fs-5"></i>
                    <h6 className="mb-0 fw-semibold">Hızlı İşlemler</h6>
                  </div>
                  <div className="btn-group" role="group">
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={handleExportCSV}
                      title="CSV olarak dışa aktar"
                    >
                      <i className="bi bi-file-earmark-spreadsheet me-1"></i>
                      CSV
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-success"
                      onClick={handleExportExcel}
                      title="Excel olarak dışa aktar"
                    >
                      <i className="bi bi-file-earmark-excel me-1"></i>
                      Excel
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-danger"
                      onClick={handleExportPDF}
                      title="PDF rapor oluştur"
                    >
                      <i className="bi bi-file-earmark-pdf me-1"></i>
                      PDF
                    </button>
  
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Sol Panel */}
          <div className="col-12 col-xl-8">
            {/* Sensör Kartı */}
            <div className="row g-4 mb-4">
              {selectedSensorIds.map(sensorId => {
                const sensor = allData.find(s => String(s.id) === sensorId);
                if (!sensor) return null;
                // Son 6 ölçüm verisini bul
                const sensorTrend = allData
                  .filter(s => String(s.id) === sensorId)
                  .sort((a, b) => new Date(a.measurement_time || a.measurementTime).getTime() - new Date(b.measurement_time || b.measurementTime).getTime())
                  .slice(-6)
                  .map(s => ({
                    time: new Date(s.measurement_time || s.measurementTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
                    value: s.temperature ?? 0
                  }));

                console.log('sensorTrend', sensorId, sensorTrend);

                return (
                  <div className="col-12" key={sensorId}>
                    <SensorCard
                      id={sensorId}
                      name={`Sensör ${sensorId}`}
                      temperature={sensor.temperature}
                      humidity={sensor.humidity}
                      timestamp={sensor.measurement_time || ''}
                      thresholds={settings}
                      alerts={alerts.filter(a => String(a.sensorId) === sensorId)}
                      onGoToSettings={handleGoToSettings}
                      trendData={sensorTrend}
                    />
                  </div>
                );
              })}
            </div>

            {/* Trend Göstergeleri */}
            {(temperatureTrend || humidityTrend) && (
              <div className="row g-3 mb-4">
                <div className="col-md-6">
                  <div className="app-card fade-in stagger-delay-1">
                    <div className="app-card-compact">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-thermometer text-danger"></i>
                          <h6 className="mb-0">Sıcaklık Trendi</h6>
                        </div>
                        {temperatureTrend && (
                          <span className={`badge bg-${
                            temperatureTrend.direction === 'increasing' ? 'danger' : 
                            temperatureTrend.direction === 'decreasing' ? 'info' : 'success'
                          }-subtle text-${
                            temperatureTrend.direction === 'increasing' ? 'danger' : 
                            temperatureTrend.direction === 'decreasing' ? 'info' : 'success'
                          }-emphasis`}>
                            {temperatureTrend.direction === 'increasing' ? '↗️ Artıyor' : 
                             temperatureTrend.direction === 'decreasing' ? '↘️ Azalıyor' : '➡️ Sabit'}
                          </span>
                        )}
                      </div>
                      {temperatureTrend && (
                        <div className="row text-center">
                          <div className="col-6">
                            <div className="metric-value small">{temperatureTrend.slope.toFixed(4)}</div>
                            <div className="metric-label">Eğim</div>
                          </div>
                          <div className="col-6">
                            <div className="metric-value small">%{(temperatureTrend.confidence * 100).toFixed(1)}</div>
                            <div className="metric-label">Güven</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="app-card fade-in stagger-delay-2">
                    <div className="app-card-compact">
                      <div className="d-flex align-items-center justify-content-between mb-3">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-droplet text-info"></i>
                          <h6 className="mb-0">Nem Trendi</h6>
                        </div>
                        {humidityTrend && (
                          <span className={`badge bg-${
                            humidityTrend.direction === 'increasing' ? 'danger' : 
                            humidityTrend.direction === 'decreasing' ? 'info' : 'success'
                          }-subtle text-${
                            humidityTrend.direction === 'increasing' ? 'danger' : 
                            humidityTrend.direction === 'decreasing' ? 'info' : 'success'
                          }-emphasis`}>
                            {humidityTrend.direction === 'increasing' ? '↗️ Artıyor' : 
                             humidityTrend.direction === 'decreasing' ? '↘️ Azalıyor' : '➡️ Sabit'}
                          </span>
                        )}
                      </div>
                      {humidityTrend && (
                        <div className="row text-center">
                          <div className="col-6">
                            <div className="metric-value small">{humidityTrend.slope.toFixed(4)}</div>
                            <div className="metric-label">Eğim</div>
                          </div>
                          <div className="col-6">
                            <div className="metric-value small">%{(humidityTrend.confidence * 100).toFixed(1)}</div>
                            <div className="metric-label">Güven</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ana Grafik */}
            <div className="app-card fade-in stagger-delay-3">
              <div className="app-card-header">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi ${showPredictions ? 'bi-graph-up-arrow' : 'bi-graph-up'} text-primary`}></i>
                    <h5 className="mb-0">
                      {showPredictions ? '🔮 Sıcaklık Tahmini' : '📈 Sıcaklık ve Nem Grafiği'}
                    </h5>
                  </div>
                  {showPredictions && temperatureTrend && (
                    <div className="d-flex align-items-center gap-2">
                      <span className="badge bg-info-subtle text-info-emphasis">
                        Güven: %{(temperatureTrend.confidence * 100).toFixed(1)}
                      </span>
                      <small className="text-muted">Sonraki 5 ölçüm</small>
                    </div>
                  )}
                </div>
              </div>
              <div className="app-card-body">
                <Line 
                  data={chartData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    interaction: {
                      mode: 'index' as const,
                      intersect: false,
                    },
                    plugins: {
                      legend: {
                        display: true,
                        position: 'top' as const,
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                          font: { size: 12, weight: 'bold' }
                        }
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#333',
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                          label: function(context) {
                            const label = context.dataset.label || '';
                            const value = context.parsed.y;
                            const unit = label.includes('Sıcaklık') ? '°C' : '%';
                            return `${label}: ${value?.toFixed(2)}${unit}`;
                          }
                        }
                      }
                    },
                    scales: showPredictions ? {
                      y: {
                        title: {
                          display: true,
                          text: 'Sıcaklık (°C)',
                          font: { weight: 'bold' }
                        },
                        grid: { color: 'rgba(0,0,0,0.1)' }
                      },
                      x: {
                        grid: { color: 'rgba(0,0,0,0.1)' }
                      }
                    } : {
                                              'y-temp': {
                          type: 'linear' as const,
                          display: true,
                          position: 'left' as const,
                          title: {
                            display: true,
                            text: 'Sıcaklık (°C)',
                            font: { weight: 'bold' }
                          },
                          grid: { color: 'rgba(255,99,132,0.1)' }
                        },
                                              'y-hum': {
                          type: 'linear' as const,
                          display: true,
                          position: 'right' as const,
                          title: {
                            display: true,
                            text: 'Nem (%)',
                            font: { weight: 'bold' }
                          },
                          grid: { drawOnChartArea: false, color: 'rgba(53,162,235,0.1)' },
                        },
                      x: {
                        grid: { color: 'rgba(0,0,0,0.1)' }
                      }
                    }
                  }}
                  height={300}
                />
              </div>
            </div>
          </div>

          {/* Sağ Panel - İstatistikler ve Detaylar */}
          <div className="col-12 col-xl-4">
            {/* Hızlı Metrics */}
            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="metric-card interactive-card fade-in stagger-delay-1">
                  <div className="metric-icon text-danger">
                    <i className="bi bi-thermometer-high"></i>
                  </div>
                  <div className="metric-value">{stats.avgTemp.toFixed(1)}°C</div>
                  <div className="metric-label">Ortalama Sıcaklık</div>
                  <div className="mt-2">
                    <small className="text-muted">
                      {stats.minTemp.toFixed(1)}°C - {stats.maxTemp.toFixed(1)}°C
                    </small>
                  </div>
                </div>
              </div>
              <div className="col-6">
                <div className="metric-card interactive-card fade-in stagger-delay-2">
                  <div className="metric-icon text-info">
                    <i className="bi bi-droplet-fill"></i>
                  </div>
                  <div className="metric-value">{stats.avgHum.toFixed(1)}%</div>
                  <div className="metric-label">Ortalama Nem</div>
                  <div className="mt-2">
                    <small className="text-muted">
                      {stats.minHum.toFixed(1)}% - {stats.maxHum.toFixed(1)}%
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="app-card fade-in stagger-delay-3 mb-4">
              <div className="app-card-header">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-graph-up text-primary"></i>
                  <h6 className="mb-0">Detaylı İstatistikler</h6>
                </div>
              </div>
              <div className="app-card-body">
                <div className="row g-3 text-center">
                  <div className="col-4">
                    <div className="metric-value small text-primary">{stats.totalReadings}</div>
                    <div className="metric-label">Toplam Ölçüm</div>
                  </div>
                  <div className="col-4">
                    <div className="metric-value small text-warning">{anomalies.length}</div>
                    <div className="metric-label">Anomali</div>
                  </div>
                  <div className="col-4">
                    <div className="metric-value small text-success">
                      {Math.ceil((new Date().getTime() - new Date(stats.lastUpdate).getTime()) / (1000 * 60 * 60 * 24))}
                    </div>
                    <div className="metric-label">Gün Aktif</div>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="text-center">
                  <small className="text-muted">
                    Son güncelleme: {new Date(stats.lastUpdate).toLocaleString('tr-TR')}
                  </small>
                </div>
              </div>
            </div>

            {/* Anomali Tespitleri */}
            {anomalies.length > 0 && (
              <div className="app-card fade-in stagger-delay-4 mb-4">
                <div className="app-card-header">
                  <div className="d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-2">
                      <i className="bi bi-exclamation-triangle text-warning"></i>
                      <h6 className="mb-0">Son Anomaliler</h6>
                    </div>
                    <span className="badge bg-warning-subtle text-warning-emphasis">
                      {anomalies.length}
                    </span>
                  </div>
                </div>
                <div className="app-card-body">
                  <div className="list-group list-group-flush">
                    {anomalies.slice(-3).map((anomaly, index) => (
                      <div key={index} className="list-group-item border-0 px-0">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge bg-warning-subtle text-warning-emphasis`}>
                              {anomaly.type === 'temperature' ? '🌡️' : '💧'}
                            </span>
                            <div>
                              <div className="fw-medium small">
                                {anomaly.value.toFixed(1)}{anomaly.type === 'temperature' ? '°C' : '%'}
                              </div>
                              <small className="text-muted">
                                {new Date(anomaly.timestamp).toLocaleTimeString('tr-TR')}
                              </small>
                            </div>
                          </div>
                          <span className={`badge ${
                            anomaly.score > 3 ? 'bg-danger' : 
                            anomaly.score > 2.5 ? 'bg-warning' : 'bg-info'
                          }-subtle text-${
                            anomaly.score > 3 ? 'danger' : 
                            anomaly.score > 2.5 ? 'warning' : 'info'
                          }-emphasis`}>
                            {anomaly.score.toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Aktif Alarmlar */}
            <div className="app-card fade-in stagger-delay-4">
              <div className="app-card-header">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-bell text-danger"></i>
                    <h6 className="mb-0">Aktif Alarmlar</h6>
                  </div>
                  {alerts.length > 0 && (
                    <span className="badge bg-danger-subtle text-danger-emphasis">
                      {alerts.length}
                    </span>
                  )}
                </div>
              </div>
              <div className="app-card-body">
                {alerts.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-check-circle text-success fs-1"></i>
                    <p className="text-muted mt-2 mb-0">Aktif alarm bulunmuyor</p>
                    <small className="text-muted">Tüm değerler normal aralıkta</small>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {alerts.slice(-5).map(alert => (
                      <div key={alert.id} className="list-group-item border-0 px-0">
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex align-items-center gap-2">
                            <span className={`badge bg-${alert.status === 'high' ? 'danger' : 'info'}-subtle text-${alert.status === 'high' ? 'danger' : 'info'}-emphasis`}>
                              {alert.status === 'high' ? 'Yüksek' : 'Düşük'}
                            </span>
                            <div>
                              <div className="fw-medium small">
                                {alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'}: {alert.value.toFixed(1)}
                                {alert.type === 'temperature' ? '°C' : '%'}
                              </div>
                              <small className="text-muted">
                                {new Date(alert.timestamp).toLocaleTimeString('tr-TR')}
                              </small>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Kart Ekleme Dropdown'u */}
        <div className="mb-3">
          <select onChange={e => handleAddCard(e.target.value)}>
            <option value="">Kart Ekle</option>
            {dashboardCards.filter(card => !card.visible).map(card => (
              <option key={card.sensorId} value={card.sensorId}>
                Sensör {card.sensorId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bildirim Bileşeni */}
      <AlertNotification alerts={alerts} />
    </>
  );
};

export default Dashboard;