import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Form, Badge } from 'react-bootstrap';
import { Line, Bar, Scatter } from 'react-chartjs-2';
import { fetchSensorData, SensorData, isDataFromCache, getCacheTimestamp } from '../services/api';

interface SmartGroupedData {
  timestamp: string;
  temperature: number;
  humidity: number;
  count: number;
  period: 'minute' | 'hour' | 'day' | 'week' | 'month';
  intervalHours: number;
}

const Analytics: React.FC = () => {
  const [sensorData, setSensorData] = useState<SensorData[]>(() => {
    const saved = localStorage.getItem('lastSensorData');
    try {
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUsingCachedData, setIsUsingCachedData] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<number>(0);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [chartType, setChartType] = useState<'line' | 'bar' | 'scatter'>('line');
  const [timeInterval, setTimeInterval] = useState<'auto' | '2min' | '15min' | '1hour' | '2hour' | 'daily'>('auto');
  const [timeRange, setTimeRange] = useState({ startTime: '', endTime: '' });
  const [maxDataPoints, setMaxDataPoints] = useState(50);
  const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await fetchSensorData();
      setSensorData(data);
      localStorage.setItem('lastSensorData', JSON.stringify(data));
      setIsUsingCachedData(isDataFromCache());
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
      setError(null);
    } catch (err) {
      setError('API bağlantı hatası!');
      console.error('Analytics veri yükleme hatası:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setChartData(getEnhancedChartData());
  }, [sensorData, dateRange, timeRange, timeInterval, selectedSensor, maxDataPoints]);

  const getFilteredData = () => {
    let filtered = sensorData;

    if (selectedSensor > 0) {
      filtered = filtered.filter(d => d.id === selectedSensor);
    }

    if (dateRange.start && dateRange.end) {
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59);
      
      filtered = filtered.filter(d => {
        const date = new Date(d.measurement_time || d.measurementTime);
        return date >= startDate && date <= endDate;
      });
    }

    return Array.isArray(filtered) ? filtered : [];
  };

  const getSmartGroupedData = (): SmartGroupedData[] => {
    let filteredData = getFilteredData();
    if (filteredData.length === 0) return [];

    const groupInterval: 'hour' = 'hour';
    const intervalHours = 2;

    const groupedData: { [key: string]: SensorData[] } = {};
    
    filteredData.forEach(item => {
      const date = new Date(item.measurement_time || item.measurementTime);
      const roundedHour = Math.floor(date.getHours() / intervalHours) * intervalHours;
      const groupDate = new Date(date);
      groupDate.setHours(roundedHour, 0, 0, 0);
      const groupKey = groupDate.toISOString();
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = [];
      }
      groupedData[groupKey].push(item);
    });

    const averagedData = Object.keys(groupedData)
      .sort()
      .map(key => {
        const items = groupedData[key];
        const avgTemp = items.reduce((sum, item) => sum + item.temperature, 0) / items.length;
        const avgHum = items.reduce((sum, item) => sum + item.humidity, 0) / items.length;
        return {
          timestamp: key,
          temperature: Number(avgTemp.toFixed(1)),
          humidity: Number(avgHum.toFixed(1)),
          count: items.length,
          period: 'hour' as const,
          intervalHours
        };
      });

    return averagedData;
  };

  const formatLabel = (timestamp: string, period: 'hour', intervalHours: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('tr-TR')} ${String(date.getHours()).padStart(2, '0')}:00`;
  };

  const calculateDynamicRanges = () => {
    return {
      tempMin: 0,
      tempMax: 100,
      humMin: 0,
      humMax: 100
    };
  };

  const formatTooltipTitle = (context: any, smartData: SmartGroupedData[]) => {
    const dataIndex = context[0].dataIndex;
    const item = smartData[dataIndex];
    if (!item) return '';
    
    const date = new Date(item.timestamp);
    
    if (item.period === 'minute') {
      const endMinute = new Date(date.getTime() + item.intervalHours * 60 * 60 * 1000);
      return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })} - ${endMinute.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    } else if (item.period === 'hour') {
      const endHour = new Date(date.getTime() + item.intervalHours * 60 * 60 * 1000);
      return `${date.toLocaleDateString('tr-TR')} ${date.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit'
      })} - ${endHour.toLocaleTimeString('tr-TR', { 
        hour: '2-digit', 
        minute: '2-digit'
      })}`;
    } else if (item.period === 'day') {
      return date.toLocaleDateString('tr-TR', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } else if (item.period === 'week') {
      const weekEnd = new Date(date);
      weekEnd.setDate(date.getDate() + 6);
      return `${date.toLocaleDateString('tr-TR')} - ${weekEnd.toLocaleDateString('tr-TR')}`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long'
      });
    }
  };

  const formatTooltipLabel = (value: any, name: string) => {
    if (name === 'Sıcaklık (°C)') {
      return `Sıcaklık: ${value}°C`;
    } else if (name === 'Nem (%)') {
      return `Nem: ${value}%`;
    }
    return `${name}: ${value}`;
  };

  const getEnhancedChartData = () => {
    const filteredData = getFilteredData();
    
    const smartData = getSmartGroupedData();
    
      return {
      labels: smartData.map(d => formatLabel(d.timestamp, d.period as any, d.intervalHours)),
      datasets: [
        {
          label: 'Sıcaklık (°C)',
          data: smartData.map(d => d.temperature),
          borderColor: 'rgba(255, 99, 132, 1)',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderWidth: 4,
          fill: false,
          tension: 0.3,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointBackgroundColor: 'rgba(255, 99, 132, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          yAxisID: 'y'
        },
        {
          label: 'Nem (%)',
          data: smartData.map(d => d.humidity),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderWidth: 4,
          fill: false,
          tension: 0.3,
          pointRadius: 6,
          pointHoverRadius: 10,
          pointBackgroundColor: 'rgba(54, 162, 235, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          yAxisID: 'y1'
        }
      ]
    };
  };

  const getChartOptions = () => {
    const smartData = getSmartGroupedData();
    const sampleItem = smartData[0];
    const dynamicRanges = calculateDynamicRanges();
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        title: {
          display: true,
          text: `Sensör Verileri ${sampleItem ? `(${
            sampleItem.period === 'minute' ? 
              `${Math.round(sampleItem.intervalHours * 60)} Dakikalık` :
            sampleItem.period === 'hour' ? 
              `${sampleItem.intervalHours} Saatlik` :
            sampleItem.period === 'day' ? 'Günlük' : 
            sampleItem.period === 'week' ? 'Haftalık' : 'Aylık'
          } Ortalama - ${smartData.length} veri noktası)` : ''}`,
          font: {
            size: 16,
            weight: 'bold' as const
          }
        },
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#333',
          borderWidth: 1,
          cornerRadius: 8,
          padding: 12,
          callbacks: {
            title: function(context: any) {
              return formatTooltipTitle(context, smartData);
            },
            label: function(context: any) {
              return formatTooltipLabel(context.parsed.y, context.dataset.label);
            },
            afterBody: function(context: any) {
              const dataIndex = context[0].dataIndex;
              const item = smartData[dataIndex];
              if (item && item.count > 1) {
                return [``, `📊 ${item.count} ölçüm ortalaması`];
              }
              return [];
            }
          }
        }
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Zaman',
            font: {
              size: 14,
              weight: 'bold' as const
            }
          },
          ticks: {
            maxRotation: 45,
            minRotation: 0,
            maxTicksLimit: Math.min(12, smartData.length)
          }
        },
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
          min: dynamicRanges.tempMin,
          max: dynamicRanges.tempMax,
          title: {
            display: true,
            text: 'Sıcaklık (°C)',
            color: 'rgba(255, 99, 132, 1)',
            font: {
              size: 16,
              weight: 'bold' as const
            }
          },
          ticks: {
            color: 'rgba(255, 99, 132, 1)',
            stepSize: 10,
            callback: function(value: any) {
              return value + '°C';
            }
          },
          grid: {
            drawOnChartArea: true,
            color: 'rgba(255, 99, 132, 0.1)',
          },
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          min: dynamicRanges.humMin,
          max: dynamicRanges.humMax,
          title: {
            display: true,
            text: 'Nem (%)',
            color: 'rgba(54, 162, 235, 1)',
            font: {
              size: 16,
              weight: 'bold' as const
            }
          },
          ticks: {
            color: 'rgba(54, 162, 235, 1)',
            stepSize: 10,
            callback: function(value: any) {
              return value + '%';
            }
          },
          grid: {
            drawOnChartArea: false,
            color: 'rgba(54, 162, 235, 0.1)',
          },
        },
      },
    };
  };

  const getUniqueySensors = () => {
    const sensorIds = [...new Set(sensorData.map(d => d.id))];
    return sensorIds.sort((a, b) => a - b);
  };

  const renderErrorBanner = () => {
    const lastUpdate = getCacheTimestamp();
    if (error && sensorData.length > 0) {
      return (
        <div className="alert alert-warning text-center" role="alert">
          <i className="bi bi-exclamation-triangle me-2"></i>
          API bağlantı hatası! Son yüklenen veriler gösteriliyor.<br/>
          <span className="small text-muted">Son veri güncelleme: {lastUpdate ? lastUpdate.toLocaleString('tr-TR') : 'Bilinmiyor'}</span>
        </div>
      );
    }
    return null;
  };

  const renderConnectionStatus = () => {
    const isOffline = !!error || sensorData.length === 0;
    const lastUpdate = getCacheTimestamp();
    return (
      <div className="d-flex align-items-center gap-3 mb-2">
        <span>
          {isOffline ? (
            <span className="badge bg-danger">
              <i className="bi bi-x-circle me-1"></i>
              API bağlantı hatası!
            </span>
          ) : (
            <span className="badge bg-success">
              <i className="bi bi-check-circle me-1"></i>
              API Bağlantısı Var
            </span>
          )}
        </span>
        <span className="text-muted small">
          Son güncelleme: {lastUpdate ? lastUpdate.toLocaleString('tr-TR') : 'Bilinmiyor'}
        </span>
      </div>
    );
  };

  if (loading && sensorData.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <div className="loading-shimmer rounded-circle mx-auto mb-3" style={{ width: '60px', height: '60px' }}></div>
          <h5 className="text-muted">Analiz verileri yükleniyor...</h5>
        </div>
      </div>
    );
  }

  if (error && sensorData.length === 0) {
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

  const ChartComponent = chartType === 'bar' ? Bar : chartType === 'scatter' ? Scatter : Line;

  return (
    <div className="container-fluid">
      {renderConnectionStatus()}
      {renderErrorBanner()}
      {/* Başlık */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="text-gradient mb-1">📈 Gelişmiş Analitik</h2>
              <p className="text-muted mb-0">Akıllı veri gruplandırma ve detaylı analiz</p>
            </div>
            <div className="d-flex align-items-center gap-2">
              {isUsingCachedData && (
                <Badge bg="warning">Önbellek Verisi</Badge>
              )}
              <Badge bg="info">{sensorData.length} kayıt</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Gelişmiş Filtreler */}
      <Card className="app-card mb-4">
        <Card.Body>
          <Row className="g-3">
            <Col md={2}>
              <Form.Label className="small fw-semibold">🏷️ Sensör</Form.Label>
              <Form.Select
                value={selectedSensor}
                onChange={(e) => setSelectedSensor(Number(e.target.value))}
              >
                <option value={0}>Tüm Sensörler</option>
                {getUniqueySensors().map(id => (
                  <option key={id} value={id}>Sensör {id}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-semibold">⏱️ Zaman Aralığı</Form.Label>
              <Form.Select
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value as any)}
              >
                <option value="auto">🤖 Otomatik</option>
                <option value="2min">⚡ 2 Dakika</option>
                <option value="15min">🕒 15 Dakika</option>
                <option value="1hour">🕐 1 Saat</option>
                <option value="2hour">🕑 2 Saat</option>
                <option value="daily">📅 Günlük</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-semibold">📅 Başlangıç</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-semibold">📅 Bitiş</Form.Label>
              <Form.Control
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              />
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-semibold">🕐 Saat Başlangıç</Form.Label>
              <Form.Control
                type="time"
                value={timeRange.startTime}
                onChange={(e) => setTimeRange(prev => ({ ...prev, startTime: e.target.value }))}
                placeholder="08:00"
              />
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-semibold">🕕 Saat Bitiş</Form.Label>
              <Form.Control
                type="time"
                value={timeRange.endTime}
                onChange={(e) => setTimeRange(prev => ({ ...prev, endTime: e.target.value }))}
                placeholder="18:00"
              />
            </Col>
          </Row>
          <Row className="g-3 mt-2">
            <Col md={2}>
              <Form.Label className="small fw-semibold">📊 Grafik Tipi</Form.Label>
              <Form.Select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'line' | 'bar' | 'scatter')}
              >
                <option value="line">📈 Çizgi</option>
                <option value="bar">📊 Çubuk</option>
                <option value="scatter">🔵 Dağılım</option>
              </Form.Select>
            </Col>
            <Col md={2}>
              <Form.Label className="small fw-semibold">🎯 Max Veri Noktası</Form.Label>
              <Form.Select
                value={maxDataPoints}
                onChange={(e) => setMaxDataPoints(Number(e.target.value))}
              >
                <option value={25}>25 nokta</option>
                <option value={50}>50 nokta</option>
                <option value={100}>100 nokta</option>
                <option value={200}>200 nokta</option>
              </Form.Select>
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-semibold">ℹ️ Veri Durumu</Form.Label>
              <div className="d-flex align-items-center gap-2 pt-2">
                {isUsingCachedData && (
                  <Badge bg="warning">📦 Önbellek Verisi</Badge>
                )}
                <Badge bg="info">📊 {sensorData.length} toplam kayıt</Badge>
                <Badge bg="success">📈 {getSmartGroupedData().length} veri noktası</Badge>
              </div>
            </Col>
            <Col md={4}>
              <Form.Label className="small fw-semibold">⚙️ Ayarlar</Form.Label>
              <div className="d-flex gap-2 pt-1">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={loadData}
                  title="Verileri yenile"
                >
                  <i className="bi bi-arrow-clockwise"></i> Yenile
                </Button>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => {
                    setTimeRange({ startTime: '', endTime: '' });
                    setSelectedSensor(0);
                    setTimeInterval('auto');
                  }}
                  title="Filtreleri temizle"
                >
                  <i className="bi bi-x-circle"></i> Temizle
                </Button>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Ana Grafik */}
      <Card className="app-card mb-4">
        <Card.Body>
          <div style={{ height: '500px', position: 'relative' }}>
                <ChartComponent
                  data={chartData}
              options={getChartOptions()}
            />
          </div>
        </Card.Body>
      </Card>

      {/* İstatistikler */}
      {sensorData.length > 0 && (
        <Row>
          <Col md={3}>
            <Card className="app-card text-center">
              <Card.Body>
                <i className="bi bi-thermometer-half text-danger mb-2" style={{ fontSize: '2rem' }}></i>
                <h6 className="text-muted">Ortalama Sıcaklık</h6>
                <h4 className="text-danger mb-0">
                  {(sensorData.reduce((sum, d) => sum + d.temperature, 0) / sensorData.length).toFixed(1)}°C
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="app-card text-center">
              <Card.Body>
                <i className="bi bi-droplet text-info mb-2" style={{ fontSize: '2rem' }}></i>
                <h6 className="text-muted">Ortalama Nem</h6>
                <h4 className="text-info mb-0">
                  {(sensorData.reduce((sum, d) => sum + d.humidity, 0) / sensorData.length).toFixed(1)}%
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="app-card text-center">
              <Card.Body>
                <i className="bi bi-graph-up text-success mb-2" style={{ fontSize: '2rem' }}></i>
                <h6 className="text-muted">En Yüksek Sıcaklık</h6>
                <h4 className="text-success mb-0">
                  {Math.max(...sensorData.map(d => d.temperature)).toFixed(1)}°C
                </h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="app-card text-center">
              <Card.Body>
                <i className="bi bi-graph-down text-warning mb-2" style={{ fontSize: '2rem' }}></i>
                <h6 className="text-muted">En Düşük Sıcaklık</h6>
                <h4 className="text-warning mb-0">
                  {Math.min(...sensorData.map(d => d.temperature)).toFixed(1)}°C
                </h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default Analytics; 