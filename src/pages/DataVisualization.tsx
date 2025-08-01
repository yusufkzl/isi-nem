import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Spinner } from 'react-bootstrap';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import DatePicker from 'react-datepicker';
import { FaDownload, FaCalendar } from 'react-icons/fa';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';
import 'react-datepicker/dist/react-datepicker.css';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SensorData {
  timestamp: string;
  temperature: number;
  humidity: number;
}

const DataVisualization: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [startDate, setStartDate] = useState<Date>(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [data, setData] = useState<SensorData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/sensor-data', {
        params: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        }
      });
      setData(response.data);
    } catch (error) {
      console.error('Veri çekme hatası:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, fetchData]);

  const downloadCSV = () => {
    const headers = ['Tarih', 'Sıcaklık', 'Nem'];
    const csvData = data.map(item => [
      new Date(item.timestamp).toLocaleString(),
      item.temperature,
      item.humidity
    ]);
    
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `sensor_data_${startDate.toISOString().split('T')[0]}_${endDate.toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const temperatureData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Sıcaklık (°C)',
        data: data.map(d => d.temperature),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const humidityData = {
    labels: data.map(d => new Date(d.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Nem (%)',
        data: data.map(d => d.humidity),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        borderColor: 'rgb(53, 162, 235)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDarkMode ? '#fff' : '#666'
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#666'
        }
      },
      y: {
        grid: {
          color: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: isDarkMode ? '#fff' : '#666'
        }
      }
    }
  };

  return (
    <div className="data-visualization-page">
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-center mb-4">
            <Col md={8}>
              <h4 className="mb-0">Veri Görselleştirme</h4>
            </Col>
            <Col md={4} className="text-md-end">
              <Button
                variant="outline-primary"
                onClick={downloadCSV}
                className="d-inline-flex align-items-center"
              >
                <FaDownload className="me-2" />
                CSV İndir
              </Button>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col md={6}>
              <Form.Group className="d-flex align-items-center">
                <FaCalendar className="me-2 text-muted" />
                <DatePicker
                  selected={startDate}
                  onChange={(date: Date | null) => date && setStartDate(date)}
                  selectsStart
                  startDate={startDate}
                  endDate={endDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Başlangıç Tarihi"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="d-flex align-items-center">
                <FaCalendar className="me-2 text-muted" />
                <DatePicker
                  selected={endDate}
                  onChange={(date: Date | null) => date && setEndDate(date)}
                  selectsEnd
                  startDate={startDate}
                  endDate={endDate}
                  minDate={startDate}
                  className="form-control"
                  dateFormat="dd/MM/yyyy"
                  placeholderText="Bitiş Tarihi"
                />
              </Form.Group>
            </Col>
          </Row>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <h5 className="mb-4">Sıcaklık Grafiği</h5>
                  <div className="chart-container">
                    <Line data={temperatureData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>

              <Card>
                <Card.Body>
                  <h5 className="mb-4">Nem Grafiği</h5>
                  <div className="chart-container">
                    <Bar data={humidityData} options={chartOptions} />
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DataVisualization; 