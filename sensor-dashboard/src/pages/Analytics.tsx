import React, { useState, useEffect } from 'react';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { useTheme } from '../context/ThemeContext';
import { fetchSensorData, SensorData } from '../services/api';
import {
  calculateStats, 
  generateChartData,
  calculateTrend,
  detectAnomalies,
  calculateCorrelation,
  comparePeriodsData,
  groupDataByPeriod,
  generatePredictionChart,
  TrendData,
  AnomalyResult,
  CorrelationResult,
  ComparisonResult
} from '../services/dataAnalysis';

const Analytics: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSensor, setSelectedSensor] = useState<number>(0);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [analysisType, setAnalysisType] = useState<'basic' | 'trend' | 'correlation' | 'anomaly' | 'comparison'>('basic');
  const [showPredictions, setShowPredictions] = useState(false);
  const [groupPeriod, setGroupPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  
  // Analiz sonuçları
  const [trends, setTrends] = useState<{ temp: TrendData | null, hum: TrendData | null }>({ temp: null, hum: null });
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationResult | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchSensorData();
      setSensorData(data);
      
      // Tarih aralığını API verilerinden otomatik ayarla
      if (data.length > 0) {
        const sortedData = data.sort((a, b) => 
          new Date(a.measurement_time || a.measurementTime).getTime() - 
          new Date(b.measurement_time || b.measurementTime).getTime()
        );
        const startDate = new Date(sortedData[0].measurement_time || sortedData[0].measurementTime);
        const endDate = new Date(sortedData[sortedData.length - 1].measurement_time || sortedData[sortedData.length - 1].measurementTime);
        
        setDateRange({
          start: startDate.toISOString().split('T')[0],
          end: endDate.toISOString().split('T')[0]
        });
      }
      
      performAnalysis(data);
      setError(null);
    } catch (err) {
      setError('Veri yüklenirken bir hata oluştu.');
      console.error('Analytics veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const performAnalysis = (data: SensorData[]) => {
    if (data.length < 3) return;

    // Trend analizi
    const tempTrend = calculateTrend(data, 'temperature');
    const humTrend = calculateTrend(data, 'humidity');
    setTrends({ temp: tempTrend, hum: humTrend });

    // Anomali tespiti
    const detectedAnomalies = detectAnomalies(data, 2);
    setAnomalies(detectedAnomalies);

    // Korelasyon analizi
    const correlationResult = calculateCorrelation(data);
    setCorrelation(correlationResult);

    // Dönemsel karşılaştırma (son 7 gün vs önceki 7 gün)
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const currentWeekData = data.filter(d => {
      const date = new Date(d.measurement_time || d.measurementTime);
      return date >= weekAgo && date <= now;
    });
    
    const previousWeekData = data.filter(d => {
      const date = new Date(d.measurement_time || d.measurementTime);
      return date >= twoWeeksAgo && date < weekAgo;
    });
    
    if (currentWeekData.length > 0 && previousWeekData.length > 0) {
      const comparisonResult = comparePeriodsData(currentWeekData, previousWeekData);
      setComparison(comparisonResult);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000); // Her 5 dakika güncelle
    return () => clearInterval(interval);
  }, []);

  // Filtrelenmiş veri
  const getFilteredData = () => {
    let filtered = sensorData;

    // Sensör filtresi
    if (selectedSensor > 0) {
      filtered = filtered.filter(d => d.id === selectedSensor);
    }

    // Tarih filtresi
    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59); // Günün sonuna kadar dahil et
      
      filtered = filtered.filter(d => {
        const date = new Date(d.measurement_time || d.measurementTime);
        return date >= startDate && date <= endDate;
      });
    }

    return filtered;
  };

  const getChartData = () => {
    const filteredData = getFilteredData();
    
    if (showPredictions && analysisType === 'trend') {
      return generatePredictionChart(filteredData, 'temperature');
    }
    
    if (analysisType === 'correlation' && chartType === 'scatter') {
      return {
        datasets: [{
          label: 'Sıcaklık vs Nem',
          data: filteredData.map(d => ({ x: d.temperature, y: d.humidity })),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      };
    }
    
    return generateChartData(filteredData);
  };

  const getUniqueySensors = () => {
    const sensorIds = [...new Set(sensorData.map(d => d.id))];
    return sensorIds.sort((a, b) => a - b);
  };

  const getAnalysisResult = () => {
    const filteredData = getFilteredData();
    const stats = calculateStats(filteredData);

    switch (analysisType) {
      case 'trend':
        return (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="app-card">
                <div className="app-card-header">
                  <h6 className="mb-0">🌡️ Sıcaklık Trendi</h6>
                </div>
                <div className="app-card-body">
                  {trends.temp ? (
                    <div className="text-center">
                      <div className={`display-6 fw-bold mb-2 ${
                        trends.temp.direction === 'increasing' ? 'text-danger' :
                        trends.temp.direction === 'decreasing' ? 'text-info' : 'text-success'
                      }`}>
                        {trends.temp.direction === 'increasing' ? '↗️' :
                         trends.temp.direction === 'decreasing' ? '↘️' : '➡️'}
                      </div>
                      <p className="mb-3">
                        <strong>{trends.temp.direction === 'increasing' ? 'Artış' :
                                trends.temp.direction === 'decreasing' ? 'Azalış' : 'Sabit'}</strong>
                      </p>
                      <div className="row g-3 text-center">
                        <div className="col-6">
                          <div className="metric-value small">{trends.temp.slope.toFixed(4)}</div>
                          <div className="metric-label">Eğim</div>
                        </div>
                        <div className="col-6">
                          <div className="metric-value small">%{(trends.temp.confidence * 100).toFixed(1)}</div>
                          <div className="metric-label">Güven</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-graph-up fs-1"></i>
                      <p className="mt-2">Yeterli veri yok</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="app-card">
                <div className="app-card-header">
                  <h6 className="mb-0">💧 Nem Trendi</h6>
                </div>
                <div className="app-card-body">
                  {trends.hum ? (
                    <div className="text-center">
                      <div className={`display-6 fw-bold mb-2 ${
                        trends.hum.direction === 'increasing' ? 'text-info' :
                        trends.hum.direction === 'decreasing' ? 'text-warning' : 'text-success'
                      }`}>
                        {trends.hum.direction === 'increasing' ? '↗️' :
                         trends.hum.direction === 'decreasing' ? '↘️' : '➡️'}
                      </div>
                      <p className="mb-3">
                        <strong>{trends.hum.direction === 'increasing' ? 'Artış' :
                                trends.hum.direction === 'decreasing' ? 'Azalış' : 'Sabit'}</strong>
                      </p>
                      <div className="row g-3 text-center">
                        <div className="col-6">
                          <div className="metric-value small">{trends.hum.slope.toFixed(4)}</div>
                          <div className="metric-label">Eğim</div>
                        </div>
                        <div className="col-6">
                          <div className="metric-value small">%{(trends.hum.confidence * 100).toFixed(1)}</div>
                          <div className="metric-label">Güven</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-muted">
                      <i className="bi bi-graph-up fs-1"></i>
                      <p className="mt-2">Yeterli veri yok</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 'correlation':
  return (
          <div className="app-card">
            <div className="app-card-header">
              <h6 className="mb-0">🔗 Korelasyon Analizi</h6>
            </div>
            <div className="app-card-body">
              {correlation ? (
                <div className="text-center">
                  <div className={`display-4 fw-bold mb-3 ${
                    Math.abs(correlation.coefficient) > 0.7 ? 'text-success' :
                    Math.abs(correlation.coefficient) > 0.4 ? 'text-warning' : 'text-secondary'
                  }`}>
                    {correlation.coefficient.toFixed(3)}
                  </div>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6>İlişki Gücü</h6>
                      <span className={`badge bg-${
                        correlation.strength === 'very_strong' || correlation.strength === 'strong' ? 'success' :
                        correlation.strength === 'moderate' ? 'warning' : 'secondary'
                      }-subtle text-${
                        correlation.strength === 'very_strong' || correlation.strength === 'strong' ? 'success' :
                        correlation.strength === 'moderate' ? 'warning' : 'secondary'
                      }-emphasis fs-6`}>
                        {correlation.strength === 'very_weak' ? 'Çok Zayıf' :
                         correlation.strength === 'weak' ? 'Zayıf' :
                         correlation.strength === 'moderate' ? 'Orta' :
                         correlation.strength === 'strong' ? 'Güçlü' : 'Çok Güçlü'}
                      </span>
                    </div>
                    <div className="col-md-6">
                      <h6>İlişki Yönü</h6>
                      <span className={`badge bg-${
                        correlation.relationship === 'positive' ? 'success' :
                        correlation.relationship === 'negative' ? 'info' : 'secondary'
                      }-subtle text-${
                        correlation.relationship === 'positive' ? 'success' :
                        correlation.relationship === 'negative' ? 'info' : 'secondary'
                      }-emphasis fs-6`}>
                        {correlation.relationship === 'positive' ? '↗️ Pozitif' :
                         correlation.relationship === 'negative' ? '↘️ Negatif' : '➡️ Yok'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <small className="text-muted">
                      Sıcaklık ve nem arasındaki ilişki katsayısı. 
                      {Math.abs(correlation.coefficient) > 0.5 ? ' Güçlü bir ilişki var.' : ' Zayıf bir ilişki var.'}
                    </small>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-link-45deg fs-1"></i>
                  <p className="mt-2">Korelasyon hesaplanamadı</p>
            </div>
          )}
            </div>
          </div>
        );

      case 'anomaly':
        return (
          <div className="app-card">
            <div className="app-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0">⚠️ Anomali Tespiti</h6>
                <span className="badge bg-warning-subtle text-warning-emphasis">
                  {anomalies.length} anomali
                </span>
              </div>
            </div>
            <div className="app-card-body">
              {anomalies.length > 0 ? (
                <div className="list-group list-group-flush">
                  {anomalies.slice(-10).map((anomaly, index) => (
                    <div key={index} className="list-group-item border-0 px-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <span className={`badge bg-${
                            anomaly.score > 3 ? 'danger' : 
                            anomaly.score > 2.5 ? 'warning' : 'info'
                          }-subtle text-${
                            anomaly.score > 3 ? 'danger' : 
                            anomaly.score > 2.5 ? 'warning' : 'info'
                          }-emphasis`}>
                            {anomaly.type === 'temperature' ? '🌡️' : '💧'}
                          </span>
                          <div>
                            <div className="fw-medium">
                              {anomaly.value.toFixed(2)}{anomaly.type === 'temperature' ? '°C' : '%'}
                            </div>
                            <small className="text-muted">
                              {new Date(anomaly.timestamp).toLocaleString('tr-TR')}
                            </small>
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold">Z-Score: {anomaly.score.toFixed(2)}</div>
                          <small className="text-muted">Eşik: {anomaly.threshold}</small>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-check-circle fs-1 text-success"></i>
                  <p className="mt-2">Anomali tespit edilmedi</p>
                  <small>Tüm değerler normal aralıkta</small>
                </div>
              )}
            </div>
          </div>
        );

      case 'comparison':
        return (
          <div className="app-card">
            <div className="app-card-header">
              <h6 className="mb-0">📊 Dönemsel Karşılaştırma</h6>
            </div>
            <div className="app-card-body">
              {comparison ? (
                <div className="row g-4">
                  <div className="col-md-6">
                    <h6 className="text-center mb-3">🌡️ Sıcaklık</h6>
                    <div className="row g-3 text-center">
                      <div className="col-6">
                        <div className="metric-card">
                          <div className="metric-value">{comparison.current.avgTemp.toFixed(1)}°C</div>
                          <div className="metric-label">Bu Hafta</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="metric-card">
                          <div className="metric-value">{comparison.previous.avgTemp.toFixed(1)}°C</div>
                          <div className="metric-label">Önceki Hafta</div>
                        </div>
                      </div>
                    </div>
                                         <div className="text-center mt-3">
                       <span className={`badge bg-${
                         comparison.changes.tempChange > 0 ? 'danger' : comparison.changes.tempChange < 0 ? 'info' : 'secondary'
                       }-subtle text-${
                         comparison.changes.tempChange > 0 ? 'danger' : comparison.changes.tempChange < 0 ? 'info' : 'secondary'
                       }-emphasis fs-6`}>
                         {comparison.changes.tempChange > 0 ? '↗️' : comparison.changes.tempChange < 0 ? '↘️' : '➡️'}
                         {Math.abs(comparison.changes.tempChange).toFixed(1)}°C
                       </span>
                     </div>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-center mb-3">💧 Nem</h6>
                    <div className="row g-3 text-center">
                      <div className="col-6">
                        <div className="metric-card">
                          <div className="metric-value">{comparison.current.avgHum.toFixed(1)}%</div>
                          <div className="metric-label">Bu Hafta</div>
                        </div>
                      </div>
                      <div className="col-6">
                        <div className="metric-card">
                          <div className="metric-value">{comparison.previous.avgHum.toFixed(1)}%</div>
                          <div className="metric-label">Önceki Hafta</div>
                        </div>
                      </div>
                    </div>
                                         <div className="text-center mt-3">
                       <span className={`badge bg-${
                         comparison.changes.humChange > 0 ? 'info' : comparison.changes.humChange < 0 ? 'warning' : 'secondary'
                       }-subtle text-${
                         comparison.changes.humChange > 0 ? 'info' : comparison.changes.humChange < 0 ? 'warning' : 'secondary'
                       }-emphasis fs-6`}>
                         {comparison.changes.humChange > 0 ? '↗️' : comparison.changes.humChange < 0 ? '↘️' : '➡️'}
                         {Math.abs(comparison.changes.humChange).toFixed(1)}%
                       </span>
                     </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted">
                  <i className="bi bi-bar-chart fs-1"></i>
                  <p className="mt-2">Karşılaştırma için yeterli veri yok</p>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return (
          <div className="row g-4">
            <div className="col-md-3">
              <div className="metric-card text-center">
                <div className="metric-icon text-primary">
                  <i className="bi bi-graph-up"></i>
                </div>
                <div className="metric-value">{stats.totalReadings}</div>
                <div className="metric-label">Toplam Ölçüm</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="metric-card text-center">
                <div className="metric-icon text-danger">
                  <i className="bi bi-thermometer-high"></i>
                </div>
                <div className="metric-value">{stats.avgTemp.toFixed(1)}°C</div>
                <div className="metric-label">Ortalama Sıcaklık</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="metric-card text-center">
                <div className="metric-icon text-info">
                  <i className="bi bi-droplet-fill"></i>
                </div>
                <div className="metric-value">{stats.avgHum.toFixed(1)}%</div>
                <div className="metric-label">Ortalama Nem</div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="metric-card text-center">
                <div className="metric-icon text-success">
                  <i className="bi bi-calendar-check"></i>
                </div>
                <div className="metric-value">
                  {Math.ceil((new Date().getTime() - new Date(stats.lastUpdate).getTime()) / (1000 * 60 * 60 * 24))}
                </div>
                <div className="metric-label">Gün</div>
              </div>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="loading-shimmer rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}></div>
          <h5 className="text-muted">Analiz verileri yükleniyor...</h5>
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
            <h4 className="mt-3 text-danger">Analiz Hatası</h4>
            <p className="text-muted mb-4">{error}</p>
            <button className="btn btn-primary" onClick={loadData}>
              <i className="bi bi-arrow-clockwise me-2"></i>
              Tekrar Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  const chartData = getChartData();
  const ChartComponent = chartType === 'bar' ? Bar : chartType === 'scatter' ? Scatter : Line;

  return (
    <div className="container-fluid">
      {/* Page Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-gradient mb-1">📊 Gelişmiş Analitik</h2>
              <p className="text-muted mb-0">Detaylı veri analizi ve trend tespiti</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success-emphasis">
                <i className="bi bi-database me-1"></i>
                {sensorData.length} kayıt
              </span>
              <span className="badge bg-info-subtle text-info-emphasis">
                <i className="bi bi-clock me-1"></i>
                Canlı
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="app-card mb-4 fade-in">
        <div className="app-card-body">
          <div className="row g-3">
            <div className="col-md-2">
              <label className="form-label small fw-semibold">🎯 Analiz Tipi</label>
              <select 
                className="form-select"
                value={analysisType}
                onChange={(e) => setAnalysisType(e.target.value as any)}
              >
                <option value="basic">Temel İstatistik</option>
                <option value="trend">Trend Analizi</option>
                <option value="correlation">Korelasyon</option>
                <option value="anomaly">Anomali Tespiti</option>
                <option value="comparison">Dönemsel Karşılaştırma</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">📈 Grafik Tipi</label>
              <select 
                className="form-select"
                value={chartType}
                onChange={(e) => setChartType(e.target.value as any)}
              >
                <option value="line">Çizgi</option>
                <option value="bar">Çubuk</option>
                <option value="scatter">Dağılım</option>
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">🔍 Sensör</label>
              <select 
                className="form-select"
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(Number(e.target.value))}
              >
                <option value={0}>Tüm Sensörler</option>
                {getUniqueySensors().map(id => (
                  <option key={id} value={id}>Sensör {id}</option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">📅 Başlangıç</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">📅 Bitiş</label>
              <input
                type="date"
                className="form-control"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </div>
            <div className="col-md-2">
              <label className="form-label small fw-semibold">⚙️ Ayarlar</label>
              <div className="btn-group w-100" role="group">
                {analysisType === 'trend' && (
                  <button
                    className={`btn btn-sm ${showPredictions ? 'btn-info' : 'btn-outline-info'}`}
                    onClick={() => setShowPredictions(!showPredictions)}
                    title="Tahmin göster"
                  >
                    <i className="bi bi-graph-up-arrow"></i>
                  </button>
                )}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={loadData}
                  title="Verileri yenile"
                >
                  <i className="bi bi-arrow-clockwise"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="row g-4 mb-4">
        <div className="col-12">
          <div className="app-card fade-in">
            <div className="app-card-header">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className={`bi ${
                    chartType === 'bar' ? 'bi-bar-chart' : 
                    chartType === 'scatter' ? 'bi-diagram-3' : 'bi-graph-up'
                  } me-2`}></i>
                  {analysisType === 'correlation' && chartType === 'scatter' ? 'Sıcaklık vs Nem Dağılımı' :
                   showPredictions ? 'Trend Tahmini' : 'Sensör Verileri'}
                </h5>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-primary-subtle text-primary-emphasis">
                    {getFilteredData().length} veri noktası
                  </span>
                  {showPredictions && trends.temp && (
                    <span className="badge bg-info-subtle text-info-emphasis">
                      Güven: %{(trends.temp.confidence * 100).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="app-card-body">
              <div style={{ height: '400px' }}>
                <ChartComponent
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
                      }
                    },
                    scales: chartType === 'scatter' ? {
                      x: {
                        title: { display: true, text: 'Sıcaklık (°C)', font: { weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.1)' }
                      },
                      y: {
                        title: { display: true, text: 'Nem (%)', font: { weight: 'bold' } },
                        grid: { color: 'rgba(0,0,0,0.1)' }
                      }
                    } : {
                      'y-temp': {
                        type: 'linear' as const,
                        display: true,
                        position: 'left' as const,
                        title: { display: true, text: 'Sıcaklık (°C)', font: { weight: 'bold' } },
                        grid: { color: 'rgba(255,99,132,0.1)' }
                      },
                      'y-hum': {
                        type: 'linear' as const,
                        display: !showPredictions,
                        position: 'right' as const,
                        title: { display: true, text: 'Nem (%)', font: { weight: 'bold' } },
                        grid: { drawOnChartArea: false, color: 'rgba(53,162,235,0.1)' },
                      },
                      x: {
                        grid: { color: 'rgba(0,0,0,0.1)' }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="fade-in stagger-delay-1">
        {getAnalysisResult()}
      </div>
    </div>
  );
};

export default Analytics; 