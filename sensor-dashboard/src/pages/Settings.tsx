import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { notificationService, NotificationConfig, NotificationHistory } from '../services/notificationService';

interface AlertSettings {
  tempMin: number;
  tempMax: number;
  humMin: number;
  humMax: number;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
}

const DEFAULT_SETTINGS: AlertSettings = {
  tempMin: 20,
  tempMax: 26,
  humMin: 40,
  humMax: 60,
  notificationsEnabled: true,
  soundEnabled: true
};

const Settings: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState<AlertSettings>(() => {
    const saved = localStorage.getItem('alertSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  
  // Gelişmiş bildirim ayarları
  const [notificationConfig, setNotificationConfig] = useState<NotificationConfig>(
    notificationService.getConfig()
  );
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications' | 'history'>('alerts');

  useEffect(() => {
    // Bildirim geçmişini yükle
    setNotificationHistory(notificationService.getHistory(20));
  }, []);

  const handleChange = (field: keyof AlertSettings, value: number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotificationChange = (field: keyof NotificationConfig, value: any) => {
    const newConfig = {
      ...notificationConfig,
      [field]: value
    };
    setNotificationConfig(newConfig);
    notificationService.updateConfig(newConfig);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('alertSettings', JSON.stringify(settings));
    
    // Başarı bildirimi göster
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
    alertDiv.style.top = '100px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '9999';
    alertDiv.innerHTML = `
      ✅ Ayarlar başarıyla kaydedildi!
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      if (alertDiv.parentNode) {
        alertDiv.parentNode.removeChild(alertDiv);
      }
    }, 3000);
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.setItem('alertSettings', JSON.stringify(DEFAULT_SETTINGS));
  };

  const handleTestNotification = async () => {
    await notificationService.sendTestNotification();
    // Geçmişi yenile
    setNotificationHistory(notificationService.getHistory(20));
  };

  const handleClearHistory = () => {
    notificationService.clearHistory();
    setNotificationHistory([]);
  };

  const sensorList = ['1', '2', '3']; // Örnek sensör listesi
  const [selectedSensorId, setSelectedSensorId] = useState(sensorList[0]);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className={`card border-0 shadow-sm ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
            <div className="card-body">
              <h4 className="card-title mb-4">⚙️ Sistem Ayarları</h4>

              {/* Sensör Seçimi EN ÜSTTE */}
              <div className="mb-4">
                <label className="form-label fw-bold">Sensör Seç:</label>
                <select
                  className="form-select"
                  value={selectedSensorId}
                  onChange={e => setSelectedSensorId(e.target.value)}
                >
                  {sensorList.map(id => (
                    <option key={id} value={id}>Sensör {id}</option>
                  ))}
                </select>
              </div>

              {/* Tab Navigation */}
              <ul className="nav nav-tabs mb-4" id="settingsTabs" role="tablist">
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'alerts' ? 'active' : ''}`}
                    onClick={() => setActiveTab('alerts')}
                  >
                    🚨 Alarm Eşikleri
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'notifications' ? 'active' : ''}`}
                    onClick={() => setActiveTab('notifications')}
                  >
                    🔔 Bildirim Ayarları
                  </button>
                </li>
                <li className="nav-item" role="presentation">
                  <button 
                    className={`nav-link ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                  >
                    📜 Bildirim Geçmişi
                  </button>
                </li>
              </ul>

              {/* Alarm Eşikleri Tab */}
              {activeTab === 'alerts' && (
                <form onSubmit={handleSubmit}>
                  <div className="row g-4">
                    {/* Sıcaklık Ayarları */}
                    <div className="col-md-6">
                      <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                        <div className="card-body">
                          <h5 className="card-title">🌡️ Sıcaklık Eşikleri</h5>
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label">Minimum Sıcaklık (°C)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={settings.tempMin}
                                onChange={(e) => handleChange('tempMin', parseFloat(e.target.value))}
                                step="0.1"
                                min="0"
                                max="50"
                  />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Maksimum Sıcaklık (°C)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={settings.tempMax}
                                onChange={(e) => handleChange('tempMax', parseFloat(e.target.value))}
                                step="0.1"
                                min="0"
                                max="50"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                </div>

                    {/* Nem Ayarları */}
                    <div className="col-md-6">
                      <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                        <div className="card-body">
                          <h5 className="card-title">💧 Nem Eşikleri</h5>
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label">Minimum Nem (%)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={settings.humMin}
                                onChange={(e) => handleChange('humMin', parseFloat(e.target.value))}
                                step="0.1"
                                min="0"
                                max="100"
                  />
                            </div>
                            <div className="col-12">
                              <label className="form-label">Maksimum Nem (%)</label>
                              <input
                                type="number"
                                className="form-control"
                                value={settings.humMax}
                                onChange={(e) => handleChange('humMax', parseFloat(e.target.value))}
                                step="0.1"
                                min="0"
                                max="100"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                </div>

                    {/* Genel Ayarlar */}
                    <div className="col-12">
                      <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                        <div className="card-body">
                          <h5 className="card-title">🔧 Genel Ayarlar</h5>
                          <div className="row g-3">
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="notificationsEnabled"
                                  checked={settings.notificationsEnabled}
                                  onChange={(e) => handleChange('notificationsEnabled', e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="notificationsEnabled">
                                  Bildirimleri Etkinleştir
                                </label>
                              </div>
                            </div>
                            <div className="col-md-6">
                              <div className="form-check form-switch">
                                <input
                                  className="form-check-input"
                                  type="checkbox"
                                  id="soundEnabled"
                                  checked={settings.soundEnabled}
                                  onChange={(e) => handleChange('soundEnabled', e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="soundEnabled">
                                  Ses Uyarılarını Etkinleştir
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
              </div>
              
                  {/* Butonlar */}
                  <div className="d-flex justify-content-between mt-4">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={handleReset}
                    >
                      🔄 Varsayılana Sıfırla
                    </button>
                    <button type="submit" className="btn btn-primary">
                      💾 Kaydet
                    </button>
                  </div>
                </form>
              )}

              {/* Bildirim Ayarları Tab */}
              {activeTab === 'notifications' && (
                <div className="row g-4">
                  {/* Bildirim Türleri */}
                  <div className="col-md-6">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title">📱 Bildirim Türleri</h5>
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="browserEnabled"
                                checked={notificationConfig.browserEnabled}
                                onChange={(e) => handleNotificationChange('browserEnabled', e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="browserEnabled">
                                Tarayıcı Bildirimleri
                              </label>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="soundEnabledAdv"
                                checked={notificationConfig.soundEnabled}
                                onChange={(e) => handleNotificationChange('soundEnabled', e.target.checked)}
                  />
                              <label className="form-check-label" htmlFor="soundEnabledAdv">
                                Ses Bildirimleri
                              </label>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="emailEnabled"
                                checked={notificationConfig.emailEnabled}
                                onChange={(e) => handleNotificationChange('emailEnabled', e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="emailEnabled">
                                Email Bildirimleri
                              </label>
                            </div>
                </div>
                          {notificationConfig.emailEnabled && (
                            <div className="col-12">
                              <label className="form-label">Email Adresi</label>
                              <input
                                type="email"
                                className="form-control"
                                value={notificationConfig.emailAddress || ''}
                                onChange={(e) => handleNotificationChange('emailAddress', e.target.value)}
                                placeholder="ornek@email.com"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                </div>
              </div>

                  {/* Şiddet Seviyeleri */}
                  <div className="col-md-6">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title">⚠️ Şiddet Seviyeleri</h5>
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="warningLevel"
                                checked={notificationConfig.severityLevels.warning}
                                onChange={(e) => handleNotificationChange('severityLevels', {
                                  ...notificationConfig.severityLevels,
                                  warning: e.target.checked
                                })}
                              />
                              <label className="form-check-label" htmlFor="warningLevel">
                                🟡 Uyarı Seviyesi
                              </label>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="criticalLevel"
                                checked={notificationConfig.severityLevels.critical}
                                onChange={(e) => handleNotificationChange('severityLevels', {
                                  ...notificationConfig.severityLevels,
                                  critical: e.target.checked
                                })}
                              />
                              <label className="form-check-label" htmlFor="criticalLevel">
                                🟠 Kritik Seviye
                              </label>
                            </div>
                          </div>
                          <div className="col-12">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="emergencyLevel"
                                checked={notificationConfig.severityLevels.emergency}
                                onChange={(e) => handleNotificationChange('severityLevels', {
                                  ...notificationConfig.severityLevels,
                                  emergency: e.target.checked
                                })}
                              />
                              <label className="form-check-label" htmlFor="emergencyLevel">
                                🔴 Acil Durum
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
              </div>

                  {/* Zaman Ayarları */}
                  <div className="col-12">
                    <div className={`card ${isDarkMode ? 'bg-secondary' : 'bg-light'}`}>
                      <div className="card-body">
                        <h5 className="card-title">⏰ Zaman Ayarları</h5>
                        <div className="row g-3">
                          <div className="col-md-4">
                            <div className="form-check form-switch">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="workingHoursOnly"
                                checked={notificationConfig.workingHoursOnly}
                                onChange={(e) => handleNotificationChange('workingHoursOnly', e.target.checked)}
                              />
                              <label className="form-check-label" htmlFor="workingHoursOnly">
                                Sadece Çalışma Saatlerinde Bildir
                              </label>
                            </div>
                          </div>
                          {notificationConfig.workingHoursOnly && (
                            <>
                              <div className="col-md-4">
                                <label className="form-label">Başlangıç Saati</label>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={notificationConfig.workingHoursStart}
                                  onChange={(e) => handleNotificationChange('workingHoursStart', e.target.value)}
                                />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label">Bitiş Saati</label>
                                <input
                                  type="time"
                                  className="form-control"
                                  value={notificationConfig.workingHoursEnd}
                                  onChange={(e) => handleNotificationChange('workingHoursEnd', e.target.value)}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test Butonu */}
                  <div className="col-12">
                    <div className="d-flex justify-content-center">
                      <button
                        type="button"
                        className="btn btn-warning"
                        onClick={handleTestNotification}
                      >
                        🧪 Test Bildirimi Gönder
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bildirim Geçmişi Tab */}
              {activeTab === 'history' && (
                <div className="row">
                  <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h5>📜 Son Bildirimler</h5>
                      <button
                        type="button"
                        className="btn btn-outline-danger btn-sm"
                        onClick={handleClearHistory}
                      >
                        🗑️ Geçmişi Temizle
                      </button>
                    </div>
                    
                    {notificationHistory.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-1"></i>
                        <p className="mt-3">Henüz bildirim geçmişi bulunmuyor.</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className={`table ${isDarkMode ? 'table-dark' : 'table-light'}`}>
                          <thead>
                            <tr>
                              <th>Tür</th>
                              <th>Alarm Detayı</th>
                              <th>Durum</th>
                              <th>Zaman</th>
                            </tr>
                          </thead>
                          <tbody>
                            {notificationHistory.map((notification) => (
                              <tr key={notification.id}>
                                <td>
                                  <span className={`badge ${
                                    notification.type === 'email' ? 'bg-primary' :
                                    notification.type === 'browser' ? 'bg-info' : 'bg-secondary'
                                  }`}>
                                    {notification.type === 'email' ? '📧' :
                                     notification.type === 'browser' ? '🌐' : '🔊'}
                                    {notification.type.toUpperCase()}
                                  </span>
                                </td>
                                <td>
                                  <small>
                                    {notification.alert.type === 'temperature' ? '🌡️' : '💧'} 
                                    {notification.alert.value.toFixed(1)}
                                    {notification.alert.type === 'temperature' ? '°C' : '%'}
                                    ({notification.alert.status === 'high' ? 'Yüksek' : 'Düşük'})
                                  </small>
                                </td>
                                <td>
                                  <span className={`badge ${
                                    notification.status === 'sent' ? 'bg-success' :
                                    notification.status === 'failed' ? 'bg-danger' : 'bg-warning'
                                  }`}>
                                    {notification.status === 'sent' ? '✅ Gönderildi' :
                                     notification.status === 'failed' ? '❌ Başarısız' : '⏳ Bekliyor'}
                                  </span>
                                </td>
                                <td>
                                  <small>{new Date(notification.timestamp).toLocaleString('tr-TR')}</small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
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

export default Settings;