import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table } from 'react-bootstrap';
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
// Gerçek API'ye bağlanana kadar bu import'u devre dışı bırakabiliriz.
// import { apiService, HistoricalData } from '../services/api';

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

interface SensorDataPoint {
  timestamp: string;
  temp1: number;
  hum1: number;
  temp2: number;
  hum2: number;
}

// Seçilen tarih aralığına göre verileri oluşturan fonksiyon
const generateMockDataForRange = (start: Date, end: Date): SensorDataPoint[] => {
  const data: SensorDataPoint[] = [];

  // Başlangıç zamanından bitiş zamanına kadar 5'er dakika aralıklarla ilerle
  for (let d = new Date(start); d <= end; d.setMinutes(d.getMinutes() + 5)) {
    const timestamp = d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    });

    // Yarı rastgele sensör verileri oluştur
    const temp1 = 22 + Math.random() * 2;
    const hum1 = 45 + Math.random() * 5;
    const temp2 = 23 + Math.random() * 2;
    const hum2 = 44 + Math.random() * 5;

    data.push({
      timestamp,
      temp1: parseFloat(temp1.toFixed(1)),
      hum1: parseFloat(hum1.toFixed(1)),
      temp2: parseFloat(temp2.toFixed(1)),
      hum2: parseFloat(hum2.toFixed(1)),
    });
  }
  return data;
};

// Son 1 saatin verisini 5 dakikalık aralıklarla oluşturan fonksiyon
const generateLastHourData = (): SensorDataPoint[] => {
  const data: SensorDataPoint[] = [];
  const now = new Date();
  // Döngünün başlangıç zamanını 1 saat öncesine ayarla
  const startTime = new Date(now.getTime() - 1 * 60 * 60 * 1000);

  // Başlangıç zamanından şimdiki zamana kadar 5'er dakika aralıklarla ilerle
  for (let d = new Date(startTime); d <= now; d.setMinutes(d.getMinutes() + 5)) {
    const timestamp = d.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Istanbul',
    });

    // Yarı rastgele sensör verileri oluştur
    const temp1 = 22 + Math.random() * 2;
    const hum1 = 45 + Math.random() * 5;
    const temp2 = 23 + Math.random() * 2;
    const hum2 = 44 + Math.random() * 5;

    data.push({
      timestamp,
      temp1: parseFloat(temp1.toFixed(1)),
      hum1: parseFloat(hum1.toFixed(1)),
      temp2: parseFloat(temp2.toFixed(1)),
      hum2: parseFloat(hum2.toFixed(1)),
    });
  }
  return data;
};


const Analytics: React.FC = () => {
  const [startDate, setStartDate] = useState(
    new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [sensorData, setSensorData] = useState<SensorDataPoint[]>([]);
  const [lastHourData, setLastHourData] = useState<SensorDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadHistoricalData = () => {
    setLoading(true);
    setError(null);
    try {
      // Seçilen tarih aralığına göre veri oluştur
      const start = new Date(startDate);
      const end = new Date(endDate);
      setSensorData(generateMockDataForRange(start, end));
      // Son 1 saatin verisini oluştur
      setLastHourData(generateLastHourData());
      setLoading(false);
    } catch (err) {
      console.error('Veri yüklenirken hata oluştu:', err);
      setError('Veriler yüklenirken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistoricalData();
  }, [startDate, endDate]);

  const handleExport = () => {
    try {
      const header = "timestamp,sensor1_temp_C,sensor1_humidity_pct,sensor2_temp_C,sensor2_humidity_pct\n";
      const csvContent = sensorData
        .map(d => `${d.timestamp},${d.temp1},${d.hum1},${d.temp2},${d.hum2}`)
        .join("\n");
      const blob = new Blob([header + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sensor-data-${startDate}-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Dışa aktarma hatası:', err);
      setError('Veriler dışa aktarılırken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const labels = sensorData.map(d => d.timestamp);

  const chartDataSensor1 = {
    labels,
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: sensorData.map(d => d.temp1),
        borderColor: '#dc3545',
        backgroundColor: '#dc354520',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Nem (%)',
        data: sensorData.map(d => d.hum1),
        borderColor: '#0d6efd',
        backgroundColor: '#0d6efd20',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const chartDataSensor2 = {
    labels,
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: sensorData.map(d => d.temp2),
        borderColor: '#ffc107',
        backgroundColor: '#ffc10720',
        fill: true,
        tension: 0.4,
      },
      {
        label: 'Nem (%)',
        data: sensorData.map(d => d.hum2),
        borderColor: '#198754',
        backgroundColor: '#19875420',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const createChartOptions = (titleText: string): ChartOptions<'line'> => ({
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
      title: {
        display: true,
        text: titleText,
        font: { size: 16 },
      },
      tooltip: {
        enabled: true,
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value) => (typeof value === 'number' ? value.toFixed(1) : value),
        },
      },
    },
  });

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
                disabled={loading || sensorData.length === 0}
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

      <Row>
        <Col lg={6} className="mb-4 mb-lg-0">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              {sensorData.length > 0 ? (
                <div style={{ height: '350px' }}>
                  <Line data={chartDataSensor1} options={createChartOptions('Sensör 1 Verileri')} />
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  {loading ? 'Veriler yükleniyor...' : 'Veri bulunmuyor.'}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              {sensorData.length > 0 ? (
                <div style={{ height: '350px' }}>
                  <Line data={chartDataSensor2} options={createChartOptions('Sensör 2 Verileri')} />
                </div>
              ) : (
                <div className="text-center text-muted py-5">
                  {loading ? 'Veriler yükleniyor...' : 'Veri bulunmuyor.'}
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="border-0 shadow-sm mt-4">
        <Card.Body>
          <h5 className="mb-3">Sensör Veri Tablosu</h5>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Zaman</th>
                <th>Sensör 1 Sıcaklık (°C)</th>
                <th>Sensör 1 Nem (%)</th>
                <th>Sensör 2 Sıcaklık (°C)</th>
                <th>Sensör 2 Nem (%)</th>
              </tr>
            </thead>
            <tbody>
              {lastHourData.map((data, index) => (
                <tr key={index}>
                  <td>{data.timestamp}</td>
                  <td>{data.temp1}</td>
                  <td>{data.hum1}</td>
                  <td>{data.temp2}</td>
                  <td>{data.hum2}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Analytics; 