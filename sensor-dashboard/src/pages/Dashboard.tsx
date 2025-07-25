import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import SensorCard from '../components/SensorCard';
import AlertNotification from '../components/AlertNotification';
import { Line } from 'react-chartjs-2';
import { fetchSensorData, getLatestSensorData, SensorData } from '../services/api';
import { 
  calculateStats, 
  generateChartData, 
  checkAlerts, 
  Alert, 
  AlertConfig,
  // Yeni gelişmiş analitik fonksiyonları
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

const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [sensorData, setSensorData] = useState<{ sensor1: SensorData | null, sensor2: SensorData | null }>({
    sensor1: null,
    sensor2: null
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

  // Gelişmiş analitik state'leri
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationResult | null>(null);
  const [temperatureTrend, setTemperatureTrend] = useState<TrendData | null>(null);
  const [humidityTrend, setHumidityTrend] = useState<TrendData | null>(null);
  const [showPredictions, setShowPredictions] = useState(false);

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

    // Anomali tespiti
    const detectedAnomalies = detectAnomalies(data, 2);
    setAnomalies(detectedAnomalies);

    // Korelasyon analizi
    const correlationResult = calculateCorrelation(data);
    setCorrelation(correlationResult);

    // Trend analizi
    const tempTrend = calculateTrend(data, 'temperature');
    const humTrend = calculateTrend(data, 'humidity');
    setTemperatureTrend(tempTrend);
    setHumidityTrend(humTrend);
  };

  const loadSensorData = async () => {
    try {
      const data = await fetchSensorData();
      console.log('API\'den gelen ham veri:', data);
      
      // En son verileri al
      const latestData = getLatestSensorData(data);
      setSensorData(latestData);
      
      // Tüm verileri sakla
      setAllData(data);
      
      // Gelişmiş analiz yap
      performAdvancedAnalysis(data);
      
      // Alarmları kontrol et
      if (latestData.sensor1) {
        const newAlerts = checkAlerts(latestData.sensor1, settings);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts]);
          
          // Yeni gelişmiş bildirim sistemi kullan
          for (const alert of newAlerts) {
            await notificationService.sendNotification(alert);
          }
        }
      }

      setError(null);
    } catch (err) {
      setError('Sensör verileri yüklenirken bir hata oluştu.');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSensorData();
    // Her 30 saniyede bir verileri güncelle
    const interval = setInterval(loadSensorData, 30000);
    return () => clearInterval(interval);
  }, [settings]); // settings değiştiğinde yeniden kontrol et

  // Export fonksiyonları
  const handleExportCSV = () => {
    exportService.exportToCSV(allData);
  };

  const handleExportExcel = () => {
    exportService.exportToExcel(allData, true);
  };

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
  const chartData = showPredictions && allData.length > 0 ? 
    generatePredictionChart(allData, 'temperature') : 
    generateChartData(allData);

  return (
    <>
      <div className="container-fluid">
        {/* Page Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h2 className="text-gradient mb-1">📊 Sensör İzleme Dashboard</h2>
                <p className="text-muted mb-0">Gerçek zamanlı sıcaklık ve nem takibi</p>
              </div>
              <div className="d-flex align-items-center gap-2">
                <div className="badge bg-success-subtle text-success-emphasis">
                  <i className="bi bi-wifi me-1"></i>
                  Bağlı
                </div>
                <div className="text-muted small">
                  Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
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
                    <button 
                      className={`btn btn-sm ${showPredictions ? 'btn-info' : 'btn-outline-info'}`}
                      onClick={() => setShowPredictions(!showPredictions)}
                      title="Tahmin grafiğini göster/gizle"
                    >
                      <i className="bi bi-graph-up-arrow me-1"></i>
                      {showPredictions ? 'Normal' : 'Tahmin'}
                    </button>
                    <button 
                      className="btn btn-sm btn-outline-secondary"
                      onClick={loadSensorData}
                      title="Verileri yenile"
                    >
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Ana İçerik - Sol Panel */}
          <div className="col-12 col-xl-8">
            {/* Sensör Kartı */}
            <div className="row g-4 mb-4">
              <div className="col-12">
                {sensorData.sensor1 && (
                  <div className="fade-in">
                    <SensorCard
                      id={String(sensorData.sensor1.id)}
                      name="Ana Sensör"
                      temperature={sensorData.sensor1.temperature}
                      humidity={sensorData.sensor1.humidity}
                      timestamp={sensorData.sensor1.measurement_time || sensorData.sensor1.measurementTime}
                      thresholds={settings}
                      alerts={alerts.filter(a => a.sensorId === String(sensorData.sensor1?.id))}
                    />
                  </div>
                )}
              </div>
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

            {/* Korelasyon Analizi */}
            {correlation && (
              <div className="app-card fade-in stagger-delay-4 mb-4">
                <div className="app-card-header">
                  <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-link-45deg text-primary"></i>
                    <h6 className="mb-0">Korelasyon Analizi</h6>
                  </div>
                </div>
                <div className="app-card-body text-center">
                  <div className={`display-6 fw-bold mb-2 ${
                    Math.abs(correlation.coefficient) > 0.7 ? 'text-success' :
                    Math.abs(correlation.coefficient) > 0.4 ? 'text-warning' : 'text-secondary'
                  }`}>
                    {correlation.coefficient.toFixed(3)}
                  </div>
                  <div className="row g-3">
                    <div className="col-6">
                      <div className={`badge bg-${
                        correlation.strength === 'very_strong' || correlation.strength === 'strong' ? 'success' :
                        correlation.strength === 'moderate' ? 'warning' : 'secondary'
                      }-subtle text-${
                        correlation.strength === 'very_strong' || correlation.strength === 'strong' ? 'success' :
                        correlation.strength === 'moderate' ? 'warning' : 'secondary'
                      }-emphasis w-100`}>
                        {correlation.strength === 'very_weak' ? 'Çok Zayıf' :
                         correlation.strength === 'weak' ? 'Zayıf' :
                         correlation.strength === 'moderate' ? 'Orta' :
                         correlation.strength === 'strong' ? 'Güçlü' : 'Çok Güçlü'}
                      </div>
                      <small className="text-muted d-block mt-1">İlişki Gücü</small>
                    </div>
                    <div className="col-6">
                      <div className={`badge bg-${
                        correlation.relationship === 'positive' ? 'success' :
                        correlation.relationship === 'negative' ? 'info' : 'secondary'
                      }-subtle text-${
                        correlation.relationship === 'positive' ? 'success' :
                        correlation.relationship === 'negative' ? 'info' : 'secondary'
                      }-emphasis w-100`}>
                        {correlation.relationship === 'positive' ? '↗️ Pozitif' :
                         correlation.relationship === 'negative' ? '↘️ Negatif' : '➡️ Yok'}
                      </div>
                      <small className="text-muted d-block mt-1">İlişki Yönü</small>
                    </div>
                  </div>
                </div>
              </div>
            )}

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
      </div>

      {/* Bildirim Bileşeni */}
      <AlertNotification alerts={alerts} />
    </>
  );
};

export default Dashboard; 