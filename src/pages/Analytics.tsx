import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { apiService, HistoricalData } from '../services/api';

// Chart.js kayıt işlemleri
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics: React.FC = () => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [historicalData, setHistoricalData] = useState<HistoricalData['data']>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistoricalData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getHistoricalData(startDate, endDate);
      setHistoricalData(data.data);
    } catch (error) {
      console.error('Veri yüklenirken hata oluştu:', error);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadHistoricalData();
  }, [loadHistoricalData]);

  const handleExport = async () => {
    try {
      const blob = await apiService.exportData(startDate, endDate);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-data-${startDate}-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Dışa aktarma hatası:', error);
      setError('Veriler dışa aktarılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const chartData = {
    labels: historicalData.map(d => new Date(d.timestamp).toLocaleString('tr-TR')),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: historicalData.map(d => d.temperature),
        borderColor: '#dc3545',
        backgroundColor: '#dc354520',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'Nem (%)',
        data: historicalData.map(d => d.humidity),
        borderColor: '#0d6efd',
        backgroundColor: '#0d6efd20',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        title: {
          display: true,
          text: 'Zaman',
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8,
        },
      },
      y: {
        display: true,
        grid: {
          color: '#e9ecef',
        },
        title: {
          display: true,
          text: 'Değer',
        },
        ticks: {
          callback: function(value: number | string) {
            if (typeof value === 'number') {
              return value.toFixed(1);
            }
            return value;
          },
        },
      },
    },
  };

  return (
    <Container fluid className="py-4">
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body>
          <h5 className="mb-4">Veri Analizi</h5>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Başlangıç Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  max={endDate}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Bitiş Tarihi</Form.Label>
                <Form.Control
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  max={new Date().toISOString().split('T')[0]}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button
                variant="primary"
                onClick={loadHistoricalData}
                disabled={loading}
                className="me-2"
              >
                {loading ? 'Yükleniyor...' : 'Yenile'}
              </Button>
              <Button
                variant="outline-primary"
                onClick={handleExport}
                disabled={loading || historicalData.length === 0}
              >
                CSV İndir
              </Button>
            </Col>
          </Row>
          {error && (
            <div className="alert alert-danger mt-3" role="alert">
              {error}
            </div>
          )}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body>
          {historicalData.length > 0 ? (
            <div style={{ height: '400px' }}>
              <Line data={chartData} options={chartOptions} />
            </div>
          ) : (
            <div className="text-center text-muted py-5">
              {loading ? (
                'Veriler yükleniyor...'
              ) : (
                'Seçilen tarih aralığında veri bulunmuyor.'
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Analytics; 