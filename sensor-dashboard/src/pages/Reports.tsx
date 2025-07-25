import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { fetchSensorData, SensorData } from '../services/api';
import { 
  calculateStats, 
  calculateCorrelation, 
  detectAnomalies, 
  groupDataByPeriod,
  comparePeriodsData,
  SensorStats,
  CorrelationResult,
  AnomalyResult
} from '../services/dataAnalysis';
import { exportService, ReportData } from '../services/exportService';
import { Line, Bar } from 'react-chartjs-2';

interface ReportConfig {
  type: 'daily' | 'weekly' | 'monthly';
  includeStats: boolean;
  includeCharts: boolean;
  includeAnomalies: boolean;
  includeComparison: boolean;
  format: 'pdf' | 'excel' | 'csv';
  autoGenerate: boolean;
  autoInterval: 'daily' | 'weekly' | 'monthly';
}

const Reports: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [allData, setAllData] = useState<SensorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'weekly',
    includeStats: true,
    includeCharts: true,
    includeAnomalies: true,
    includeComparison: true,
    format: 'pdf',
    autoGenerate: false,
    autoInterval: 'weekly'
  });

  // Analiz sonuçları
  const [stats, setStats] = useState<SensorStats | null>(null);
  const [correlation, setCorrelation] = useState<CorrelationResult | null>(null);
  const [anomalies, setAnomalies] = useState<AnomalyResult[]>([]);
  const [groupedData, setGroupedData] = useState<{ [key: string]: SensorData[] }>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchSensorData();
      setAllData(data);
      
      // Analizleri yap
      const calculatedStats = calculateStats(data);
      const correlationResult = calculateCorrelation(data);
      const detectedAnomalies = detectAnomalies(data, 2);
      const grouped = groupDataByPeriod(data, reportConfig.type);
      
      setStats(calculatedStats);
      setCorrelation(correlationResult);
      setAnomalies(detectedAnomalies);
      setGroupedData(grouped);
      
      setError(null);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
      console.error('Veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    if (!stats || !correlation || allData.length === 0) return;

    setIsGenerating(true);
    
    try {
      const reportData: ReportData = {
        stats,
        data: allData,
        dateRange: {
          start: allData[0].measurement_time || allData[0].measurementTime,
          end: allData[allData.length - 1].measurement_time || allData[allData.length - 1].measurementTime
        },
        correlations: correlation,
        anomalies: reportConfig.includeAnomalies ? anomalies : [],
        generatedAt: new Date().toISOString()
      };

      const filename = `sensor_report_${reportConfig.type}_${new Date().toISOString().split('T')[0]}`;

      switch (reportConfig.format) {
        case 'pdf':
          exportService.exportToPDF(reportData, `${filename}.html`);
          break;
        case 'excel':
          exportService.exportToExcel(allData, reportConfig.includeStats, `${filename}.csv`);
          break;
        case 'csv':
          exportService.exportToCSV(allData, `${filename}.csv`);
          break;
      }

      // Başarı bildirimi
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
      alertDiv.style.top = '100px';
      alertDiv.style.right = '20px';
      alertDiv.style.zIndex = '9999';
      alertDiv.innerHTML = `
        ✅ ${reportConfig.format.toUpperCase()} raporu başarıyla oluşturuldu ve indirildi!
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      `;
      document.body.appendChild(alertDiv);
      
      setTimeout(() => {
        if (alertDiv.parentNode) {
          alertDiv.parentNode.removeChild(alertDiv);
        }
      }, 5000);

    } catch (error) {
      console.error('Rapor oluşturma hatası:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfigChange = (field: keyof ReportConfig, value: any) => {
    const newConfig = { ...reportConfig, [field]: value };
    setReportConfig(newConfig);
    
    // Tip değiştiğinde verileri yeniden grupla
    if (field === 'type') {
      const grouped = groupDataByPeriod(allData, value);
      setGroupedData(grouped);
    }
  };

  const setupAutoReports = () => {
    if (reportConfig.autoGenerate) {
      const callback = async (): Promise<ReportData> => {
        const data = await fetchSensorData();
        return {
          stats: calculateStats(data),
          data,
          dateRange: {
            start: data[0]?.measurement_time || data[0]?.measurementTime || new Date().toISOString(),
            end: data[data.length - 1]?.measurement_time || data[data.length - 1]?.measurementTime || new Date().toISOString()
          },
          correlations: calculateCorrelation(data),
          anomalies: detectAnomalies(data, 2),
          generatedAt: new Date().toISOString()
        };
      };
      
      exportService.scheduleAutoReport(reportConfig.autoInterval, callback);
    }
  };

  // Periyodik karşılaştırma grafiği
  const generateComparisonChart = () => {
    const periods = Object.keys(groupedData).sort();
    const labels = periods.slice(-12); // Son 12 periyod
    
    const avgTemps = labels.map(period => {
      const periodData = groupedData[period];
      const temps = periodData.map(d => d.temperature);
      return temps.reduce((a, b) => a + b, 0) / temps.length;
    });

    const avgHums = labels.map(period => {
      const periodData = groupedData[period];
      const hums = periodData.map(d => d.humidity);
      return hums.reduce((a, b) => a + b, 0) / hums.length;
    });

    return {
      labels: labels.map(label => {
        const date = new Date(label);
        return reportConfig.type === 'daily' ? 
          date.toLocaleDateString('tr-TR') :
          reportConfig.type === 'weekly' ?
          `Hafta ${date.toLocaleDateString('tr-TR')}` :
          `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}`;
      }),
      datasets: [
        {
          label: 'Ortalama Sıcaklık (°C)',
          data: avgTemps,
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgb(255, 99, 132)',
          borderWidth: 2,
          yAxisID: 'y-temp',
        },
        {
          label: 'Ortalama Nem (%)',
          data: avgHums,
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
          borderColor: 'rgb(53, 162, 235)',
          borderWidth: 2,
          yAxisID: 'y-hum',
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className={`card border-0 shadow-sm ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
            <div className="card-body">
              <h4 className="card-title mb-4">📊 Rapor Merkezi</h4>
              
              {/* Rapor Yapılandırması */}
              <div className="row g-4 mb-4">
                <div className="col-md-4">
                  <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                    <div className="card-body">
                      <h6 className="card-title">⚙️ Rapor Ayarları</h6>
                      
                      <div className="mb-3">
                        <label className="form-label">Rapor Türü</label>
                        <select 
                          className="form-select"
                          value={reportConfig.type}
                          onChange={(e) => handleConfigChange('type', e.target.value as 'daily' | 'weekly' | 'monthly')}
                        >
                          <option value="daily">Günlük</option>
                          <option value="weekly">Haftalık</option>
                          <option value="monthly">Aylık</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Format</label>
                        <select 
                          className="form-select"
                          value={reportConfig.format}
                          onChange={(e) => handleConfigChange('format', e.target.value as 'pdf' | 'excel' | 'csv')}
                        >
                          <option value="pdf">PDF (HTML)</option>
                          <option value="excel">Excel</option>
                          <option value="csv">CSV</option>
                        </select>
                      </div>

                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="includeStats"
                          checked={reportConfig.includeStats}
                          onChange={(e) => handleConfigChange('includeStats', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="includeStats">
                          İstatistikleri Dahil Et
                        </label>
                      </div>

                      <div className="form-check mb-2">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="includeAnomalies"
                          checked={reportConfig.includeAnomalies}
                          onChange={(e) => handleConfigChange('includeAnomalies', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="includeAnomalies">
                          Anomalileri Dahil Et
                        </label>
                      </div>

                      <div className="form-check mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="includeCharts"
                          checked={reportConfig.includeCharts}
                          onChange={(e) => handleConfigChange('includeCharts', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="includeCharts">
                          Grafikleri Dahil Et
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                    <div className="card-body">
                      <h6 className="card-title">🔄 Otomatik Raporlar</h6>
                      
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="autoGenerate"
                          checked={reportConfig.autoGenerate}
                          onChange={(e) => handleConfigChange('autoGenerate', e.target.checked)}
                        />
                        <label className="form-check-label" htmlFor="autoGenerate">
                          Otomatik Rapor Oluştur
                        </label>
                      </div>

                      {reportConfig.autoGenerate && (
                        <div className="mb-3">
                          <label className="form-label">Sıklık</label>
                          <select 
                            className="form-select"
                            value={reportConfig.autoInterval}
                            onChange={(e) => handleConfigChange('autoInterval', e.target.value as 'daily' | 'weekly' | 'monthly')}
                          >
                            <option value="daily">Günlük</option>
                            <option value="weekly">Haftalık</option>
                            <option value="monthly">Aylık</option>
                          </select>
                        </div>
                      )}

                      <button
                        className="btn btn-outline-info btn-sm"
                        onClick={setupAutoReports}
                        disabled={!reportConfig.autoGenerate}
                      >
                        🚀 Otomatik Raporu Başlat
                      </button>
                    </div>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                    <div className="card-body">
                      <h6 className="card-title">📈 Rapor Özeti</h6>
                      
                      {stats && (
                        <div>
                          <small className="text-muted d-block">Toplam Ölçüm: {stats.totalReadings}</small>
                          <small className="text-muted d-block">Son Güncelleme: {new Date(stats.lastUpdate).toLocaleDateString('tr-TR')}</small>
                          <small className="text-muted d-block">Anomali Sayısı: {anomalies.length}</small>
                          <small className="text-muted d-block">Korelasyon: {correlation?.coefficient.toFixed(3) || 'N/A'}</small>
                        </div>
                      )}

                      <div className="d-grid gap-2 mt-3">
                        <button
                          className="btn btn-primary"
                          onClick={generateReport}
                          disabled={isGenerating || !stats}
                        >
                          {isGenerating ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Oluşturuluyor...
                            </>
                          ) : (
                            <>
                              📄 Rapor Oluştur
                            </>
                          )}
                        </button>
                        
                        <button
                          className="btn btn-outline-secondary btn-sm"
                          onClick={loadData}
                        >
                          🔄 Verileri Yenile
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Karşılaştırma Grafiği */}
              {reportConfig.includeCharts && Object.keys(groupedData).length > 0 && (
                <div className="row mb-4">
                  <div className="col-12">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h6 className="card-title">📊 {reportConfig.type === 'daily' ? 'Günlük' : reportConfig.type === 'weekly' ? 'Haftalık' : 'Aylık'} Karşılaştırma</h6>
                        <Bar 
                          data={generateComparisonChart()}
                          options={{
                            responsive: true,
                            interaction: {
                              mode: 'index' as const,
                              intersect: false,
                            },
                            scales: {
                              'y-temp': {
                                type: 'linear' as const,
                                display: true,
                                position: 'left' as const,
                                title: {
                                  display: true,
                                  text: 'Sıcaklık (°C)'
                                }
                              },
                              'y-hum': {
                                type: 'linear' as const,
                                display: true,
                                position: 'right' as const,
                                title: {
                                  display: true,
                                  text: 'Nem (%)'
                                },
                                grid: {
                                  drawOnChartArea: false,
                                },
                              },
                            }
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* İstatistikler Özeti */}
              {reportConfig.includeStats && stats && (
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h6 className="card-title">🌡️ Sıcaklık İstatistikleri</h6>
                        <div className="row">
                          <div className="col-4 text-center">
                            <div className="text-info">
                              <small>MIN</small>
                              <div className="fs-5">{stats.minTemp.toFixed(1)}°C</div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="text-success">
                              <small>ORT</small>
                              <div className="fs-5">{stats.avgTemp.toFixed(1)}°C</div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="text-danger">
                              <small>MAX</small>
                              <div className="fs-5">{stats.maxTemp.toFixed(1)}°C</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-6">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h6 className="card-title">💧 Nem İstatistikleri</h6>
                        <div className="row">
                          <div className="col-4 text-center">
                            <div className="text-info">
                              <small>MIN</small>
                              <div className="fs-5">{stats.minHum.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="text-success">
                              <small>ORT</small>
                              <div className="fs-5">{stats.avgHum.toFixed(1)}%</div>
                            </div>
                          </div>
                          <div className="col-4 text-center">
                            <div className="text-danger">
                              <small>MAX</small>
                              <div className="fs-5">{stats.maxHum.toFixed(1)}%</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Anomaliler */}
              {reportConfig.includeAnomalies && anomalies.length > 0 && (
                <div className="row">
                  <div className="col-12">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h6 className="card-title">⚠️ Tespit Edilen Anomaliler ({anomalies.length})</h6>
                        <div className="table-responsive">
                          <table className={`table table-sm ${isDarkMode ? 'table-dark' : 'table-light'}`}>
                            <thead>
                              <tr>
                                <th>Tarih</th>
                                <th>Tür</th>
                                <th>Değer</th>
                                <th>Anomali Skoru</th>
                              </tr>
                            </thead>
                            <tbody>
                              {anomalies.slice(-10).map((anomaly, index) => (
                                <tr key={index}>
                                  <td>{new Date(anomaly.timestamp).toLocaleString('tr-TR')}</td>
                                  <td>
                                    <span className="badge bg-warning text-dark">
                                      {anomaly.type === 'temperature' ? '🌡️ Sıcaklık' : '💧 Nem'}
                                    </span>
                                  </td>
                                  <td>{anomaly.value.toFixed(2)}{anomaly.type === 'temperature' ? '°C' : '%'}</td>
                                  <td>
                                    <span className={`badge ${anomaly.score > 3 ? 'bg-danger' : anomaly.score > 2.5 ? 'bg-warning' : 'bg-info'}`}>
                                      {anomaly.score.toFixed(2)}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports; 