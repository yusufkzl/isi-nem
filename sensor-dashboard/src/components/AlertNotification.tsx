import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { Alert } from '../services/dataAnalysis';

interface AlertNotificationProps {
  alerts: Alert[];
}

const AlertNotification: React.FC<AlertNotificationProps> = ({ alerts }) => {
  const { isDarkMode } = useTheme();
  const [showNotification, setShowNotification] = useState(false);
  const [settings, setSettings] = useState({
    notificationsEnabled: true,
    soundEnabled: true
  });

  useEffect(() => {
    const savedSettings = localStorage.getItem('alertSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings({
        notificationsEnabled: parsedSettings.notificationsEnabled,
        soundEnabled: parsedSettings.soundEnabled
      });
    }
  }, []);

  useEffect(() => {
    if (alerts.length > 0 && settings.notificationsEnabled) {
      const latestAlert = alerts[alerts.length - 1];
      setShowNotification(true);

      // Sesli uyarı
      if (settings.soundEnabled) {
        new Audio('/alert.mp3').play().catch(console.error);
      }

      // Tarayıcı bildirimi
      if (Notification.permission === 'granted') {
        new Notification('Sensör Uyarısı', {
          body: `${latestAlert.type === 'temperature' ? 'Sıcaklık' : 'Nem'} ${latestAlert.status === 'high' ? 'yüksek' : 'düşük'}: ${latestAlert.value.toFixed(1)}${latestAlert.type === 'temperature' ? '°C' : '%'}`,
          icon: '/logo192.png'
        });
      }

      // 5 saniye sonra bildirimi kapat
      setTimeout(() => setShowNotification(false), 5000);
    }
  }, [alerts, settings]);

  if (!showNotification) return null;

  const latestAlert = alerts[alerts.length - 1];

  return (
    <div className="position-fixed bottom-4 end-4" style={{ zIndex: 1050 }}>
      <div 
        className={`alert ${latestAlert.status === 'high' ? 'alert-danger' : 'alert-info'} alert-dismissible fade show shadow-lg`}
        role="alert"
      >
        <div className="d-flex align-items-center">
          <i className={`bi ${latestAlert.type === 'temperature' ? 'bi-thermometer-high' : 'bi-droplet'} me-2`}></i>
          <div>
            <strong>
              {latestAlert.type === 'temperature' ? 'Sıcaklık' : 'Nem'} Uyarısı!
            </strong>
            <br />
            <small>
              Değer {latestAlert.status === 'high' ? 'yüksek' : 'düşük'}: {latestAlert.value.toFixed(1)}
              {latestAlert.type === 'temperature' ? '°C' : '%'}
              <br />
              Limit: {latestAlert.threshold}
              {latestAlert.type === 'temperature' ? '°C' : '%'}
            </small>
          </div>
        </div>
        <button 
          type="button" 
          className="btn-close" 
          onClick={() => setShowNotification(false)}
        ></button>
      </div>
    </div>
  );
};

export default AlertNotification; 