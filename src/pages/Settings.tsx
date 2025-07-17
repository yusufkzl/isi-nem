import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Toast } from 'react-bootstrap';
import { FaThermometerHalf, FaTint, FaBell, FaPalette, FaSave } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

interface ThresholdSettings {
  temperature: {
    min: number;
    max: number;
  };
  humidity: {
    min: number;
    max: number;
  };
}

interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
}

const Settings: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [showToast, setShowToast] = useState(false);
  


const [thresholds, setThresholds] = useState<ThresholdSettings>({
  temperature: { min: 18, max: 28 },
  humidity: { min: 30, max: 60 }
});

const [notifications, setNotifications] = useState<NotificationSettings>({
  email: true,
  push: true,
  sms: false
});

// Sayfa ilk açıldığında localStorage'dan verileri çek
useEffect(() => {
  const savedThresholds = localStorage.getItem('thresholds');
  const savedNotifications = localStorage.getItem('notifications');

  if (savedThresholds) {
    setThresholds(JSON.parse(savedThresholds));
  }

  if (savedNotifications) {
    setNotifications(JSON.parse(savedNotifications));
  }
}, []);


  const handleThresholdChange = (
    type: 'temperature' | 'humidity',
    limit: 'min' | 'max',
    value: number
  ) => {
    setThresholds(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [limit]: value
      }
    }));
  };

  const handleNotificationChange = (type: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

const handleSave = async () => {
  try {
    // Eşik değerleri ve bildirim tercihlerini localStorage’a yaz
    localStorage.setItem('thresholds', JSON.stringify(thresholds));
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // API çağrısı yapılacaksa burada olabilir
    await new Promise(resolve => setTimeout(resolve, 1000));

    setShowToast(true); // Toast göster
  } catch (error) {
    console.error('Ayarları kaydetme hatası:', error);
  }
};



  return (
    <div className="settings-page">
      <Row className="g-4">
        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <FaThermometerHalf className="text-primary me-2" size={24} />
                <h5 className="mb-0">Sıcaklık Limitleri</h5>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label>Minimum Sıcaklık (°C)</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Range
                    min={0}
                    max={50}
                    value={thresholds.temperature.min}
                    onChange={(e) => handleThresholdChange('temperature', 'min', Number(e.target.value))}
                  />
                  <span className="min-width-3 text-center">{thresholds.temperature.min}°C</span>
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label>Maximum Sıcaklık (°C)</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Range
                    min={0}
                    max={50}
                    value={thresholds.temperature.max}
                    onChange={(e) => handleThresholdChange('temperature', 'max', Number(e.target.value))}
                  />
                  <span className="min-width-3 text-center">{thresholds.temperature.max}°C</span>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm h-100">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <FaTint className="text-primary me-2" size={24} />
                <h5 className="mb-0">Nem Limitleri</h5>
              </div>
              
              <Form.Group className="mb-4">
                <Form.Label>Minimum Nem (%)</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Range
                    min={0}
                    max={100}
                    value={thresholds.humidity.min}
                    onChange={(e) => handleThresholdChange('humidity', 'min', Number(e.target.value))}
                  />
                  <span className="min-width-3 text-center">{thresholds.humidity.min}%</span>
                </div>
              </Form.Group>

              <Form.Group>
                <Form.Label>Maximum Nem (%)</Form.Label>
                <div className="d-flex align-items-center gap-3">
                  <Form.Range
                    min={0}
                    max={100}
                    value={thresholds.humidity.max}
                    onChange={(e) => handleThresholdChange('humidity', 'max', Number(e.target.value))}
                  />
                  <span className="min-width-3 text-center">{thresholds.humidity.max}%</span>
                </div>
              </Form.Group>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <FaBell className="text-primary me-2" size={24} />
                <h5 className="mb-0">Bildirim Ayarları</h5>
              </div>

              <Form.Check
                type="switch"
                id="email-notifications"
                label="E-posta Bildirimleri"
                checked={notifications.email}
                onChange={() => handleNotificationChange('email')}
                className="mb-3"
              />

              <Form.Check
                type="switch"
                id="push-notifications"
                label="Push Bildirimleri"
                checked={notifications.push}
                onChange={() => handleNotificationChange('push')}
                className="mb-3"
              />

              <Form.Check
                type="switch"
                id="sms-notifications"
                label="SMS Bildirimleri"
                checked={notifications.sms}
                onChange={() => handleNotificationChange('sms')}
              />
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Body>
              <div className="d-flex align-items-center mb-4">
                <FaPalette className="text-primary me-2" size={24} />
                <h5 className="mb-0">Görünüm Ayarları</h5>
              </div>

              <Form.Check
                type="switch"
                id="theme-toggle"
                label="Karanlık Mod"
                checked={isDarkMode}
                onChange={toggleTheme}
                className="mb-3"
              />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <div className="d-flex justify-content-end mt-4">
        <Button
          variant="primary"
          size="lg"
          onClick={handleSave}
          className="d-inline-flex align-items-center"
        >
          <FaSave className="me-2" />
          Ayarları Kaydet
        </Button>
      </div>

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        delay={3000}
        autohide
        className="position-fixed bottom-0 end-0 m-4"
      >
        <Toast.Header>
          <strong className="me-auto">Başarılı</strong>
        </Toast.Header>
        <Toast.Body>Ayarlarınız başarıyla kaydedildi!</Toast.Body>
      </Toast>
    </div>
  );
};

export default Settings; 