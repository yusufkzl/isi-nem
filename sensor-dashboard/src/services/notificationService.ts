// Gelişmiş Bildirim Servisi
import { Alert } from './dataAnalysis';

export interface NotificationConfig {
  emailEnabled: boolean;
  soundEnabled: boolean;
  browserEnabled: boolean;
  workingHoursOnly: boolean;
  workingHoursStart: string; // "09:00"
  workingHoursEnd: string; // "18:00"
  emailAddress?: string;
  severityLevels: {
    warning: boolean;
    critical: boolean;
    emergency: boolean;
  };
}

export interface NotificationHistory {
  id: string;
  type: 'email' | 'browser' | 'sound';
  alert: Alert;
  timestamp: string;
  status: 'sent' | 'failed' | 'pending';
  recipient?: string;
}

export interface SeverityLevels {
  level: 'warning' | 'critical' | 'emergency';
  tempThresholds: {
    warningMin: number;
    warningMax: number;
    criticalMin: number;
    criticalMax: number;
    emergencyMin: number;
    emergencyMax: number;
  };
  humThresholds: {
    warningMin: number;
    warningMax: number;
    criticalMin: number;
    criticalMax: number;
    emergencyMin: number;
    emergencyMax: number;
  };
}

class NotificationService {
  private config: NotificationConfig;
  private history: NotificationHistory[] = [];

  constructor() {
    this.config = this.loadConfig();
    this.loadHistory();
  }

  private loadConfig(): NotificationConfig {
    const saved = localStorage.getItem('notificationConfig');
    return saved ? JSON.parse(saved) : {
      emailEnabled: false,
      soundEnabled: true,
      browserEnabled: true,
      workingHoursOnly: false,
      workingHoursStart: "09:00",
      workingHoursEnd: "18:00",
      severityLevels: {
        warning: true,
        critical: true,
        emergency: true
      }
    };
  }

  private loadHistory(): void {
    const saved = localStorage.getItem('notificationHistory');
    this.history = saved ? JSON.parse(saved) : [];
  }

  private saveConfig(): void {
    localStorage.setItem('notificationConfig', JSON.stringify(this.config));
  }

  private saveHistory(): void {
    // Son 100 bildirimi sakla
    const recentHistory = this.history.slice(-100);
    localStorage.setItem('notificationHistory', JSON.stringify(recentHistory));
  }

  // Çalışma saatleri kontrolü
  private isWorkingHours(): boolean {
    if (!this.config.workingHoursOnly) return true;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    return currentTime >= this.config.workingHoursStart && currentTime <= this.config.workingHoursEnd;
  }

  // Alarm şiddet seviyesi belirleme
  private getAlertSeverity(alert: Alert): 'warning' | 'critical' | 'emergency' {
    const severityLevels: SeverityLevels = {
      level: 'warning',
      tempThresholds: {
        warningMin: 18, warningMax: 28,
        criticalMin: 15, criticalMax: 32,
        emergencyMin: 10, emergencyMax: 40
      },
      humThresholds: {
        warningMin: 35, warningMax: 65,
        criticalMin: 25, criticalMax: 75,
        emergencyMin: 15, emergencyMax: 85
      }
    };

    if (alert.type === 'temperature') {
      if (alert.value <= severityLevels.tempThresholds.emergencyMin || 
          alert.value >= severityLevels.tempThresholds.emergencyMax) {
        return 'emergency';
      } else if (alert.value <= severityLevels.tempThresholds.criticalMin || 
                 alert.value >= severityLevels.tempThresholds.criticalMax) {
        return 'critical';
      }
    } else if (alert.type === 'humidity') {
      if (alert.value <= severityLevels.humThresholds.emergencyMin || 
          alert.value >= severityLevels.humThresholds.emergencyMax) {
        return 'emergency';
      } else if (alert.value <= severityLevels.humThresholds.criticalMin || 
                 alert.value >= severityLevels.humThresholds.criticalMax) {
        return 'critical';
      }
    }

    return 'warning';
  }

  // Browser bildirim gönderme
  private async sendBrowserNotification(alert: Alert): Promise<boolean> {
    if (!this.config.browserEnabled) return false;

    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return false;
      }

      const severity = this.getAlertSeverity(alert);
      const icon = severity === 'emergency' ? '🚨' : severity === 'critical' ? '⚠️' : '🔔';
      
      const notification = new Notification(`${icon} Sensör Uyarısı`, {
        body: `${alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'}: ${alert.value.toFixed(1)}${alert.type === 'temperature' ? '°C' : '%'} - ${alert.status === 'high' ? 'Yüksek' : 'Düşük'} seviye`,
        icon: '/favicon.ico',
        tag: alert.id,
        requireInteraction: severity === 'emergency'
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      setTimeout(() => notification.close(), 10000);
      return true;
    } catch (error) {
      console.error('Browser bildirimi gönderilemedi:', error);
      return false;
    }
  }

  // Ses bildirimi
  private async playSoundNotification(alert: Alert): Promise<boolean> {
    if (!this.config.soundEnabled) return false;

    try {
      const severity = this.getAlertSeverity(alert);
      let audioFile = '/alert.mp3';
      
      // Şiddete göre farklı sesler (varsa)
      if (severity === 'emergency') {
        audioFile = '/emergency-alert.mp3';
      } else if (severity === 'critical') {
        audioFile = '/critical-alert.mp3';
      }

      const audio = new Audio(audioFile);
      audio.volume = severity === 'emergency' ? 1.0 : severity === 'critical' ? 0.8 : 0.6;
      
      // Emergency durumunda 3 kez çal
      if (severity === 'emergency') {
        for (let i = 0; i < 3; i++) {
          await audio.play();
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } else {
        await audio.play();
      }

      return true;
    } catch (error) {
      console.error('Ses bildirimi çalınamadı:', error);
      return false;
    }
  }

  // Email bildirimi (mock - gerçek implementasyon backend'de olmalı)
  private async sendEmailNotification(alert: Alert): Promise<boolean> {
    if (!this.config.emailEnabled || !this.config.emailAddress) return false;

    try {
      const severity = this.getAlertSeverity(alert);
      
      // Bu gerçek bir projede backend'e POST request gönderilir
      const emailData = {
        to: this.config.emailAddress,
        subject: `🚨 Sensör ${severity.toUpperCase()} Uyarısı`,
        body: `
          <h2>Sensör Uyarısı</h2>
          <p><strong>Şiddet Seviyesi:</strong> ${severity.toUpperCase()}</p>
          <p><strong>Sensör ID:</strong> ${alert.sensorId}</p>
          <p><strong>Tür:</strong> ${alert.type === 'temperature' ? 'Sıcaklık' : 'Nem'}</p>
          <p><strong>Değer:</strong> ${alert.value.toFixed(1)}${alert.type === 'temperature' ? '°C' : '%'}</p>
          <p><strong>Eşik:</strong> ${alert.threshold}${alert.type === 'temperature' ? '°C' : '%'}</p>
          <p><strong>Durum:</strong> ${alert.status === 'high' ? 'Yüksek' : 'Düşük'}</p>
          <p><strong>Zaman:</strong> ${new Date(alert.timestamp).toLocaleString('tr-TR')}</p>
        `
      };

      // Mock API call - gerçek projede backend endpoint'e gönderilir
      console.log('Email gönderildi (mock):', emailData);
      
      // Simülasyon için başarılı dön
      await new Promise(resolve => setTimeout(resolve, 1000));
      return true;
    } catch (error) {
      console.error('Email gönderim hatası:', error);
      return false;
    }
  }

  // Ana bildirim gönderme fonksiyonu
  async sendNotification(alert: Alert): Promise<void> {
    const severity = this.getAlertSeverity(alert);
    
    // Şiddet seviyesi kontrol
    if (!this.config.severityLevels[severity]) {
      return;
    }

    // Çalışma saatleri kontrol
    if (!this.isWorkingHours()) {
      // Sadece emergency durumunda çalışma saatleri dışında bildirim gönder
      if (severity !== 'emergency') {
        return;
      }
    }

    const promises: Promise<boolean>[] = [];
    const notifications: NotificationHistory[] = [];

    // Browser bildirimi
    if (this.config.browserEnabled) {
      promises.push(this.sendBrowserNotification(alert));
      notifications.push({
        id: `browser-${Date.now()}`,
        type: 'browser',
        alert,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    }

    // Ses bildirimi
    if (this.config.soundEnabled) {
      promises.push(this.playSoundNotification(alert));
      notifications.push({
        id: `sound-${Date.now()}`,
        type: 'sound',
        alert,
        timestamp: new Date().toISOString(),
        status: 'pending'
      });
    }

    // Email bildirimi
    if (this.config.emailEnabled && this.config.emailAddress) {
      promises.push(this.sendEmailNotification(alert));
      notifications.push({
        id: `email-${Date.now()}`,
        type: 'email',
        alert,
        timestamp: new Date().toISOString(),
        status: 'pending',
        recipient: this.config.emailAddress
      });
    }

    // Tüm bildirimleri gönder
    const results = await Promise.allSettled(promises);
    
    // Sonuçları güncelle
    results.forEach((result, index) => {
      notifications[index].status = result.status === 'fulfilled' && result.value ? 'sent' : 'failed';
    });

    // Geçmişe ekle
    this.history.push(...notifications);
    this.saveHistory();
  }

  // Konfigürasyon güncelleme
  updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.saveConfig();
  }

  // Geçmişi getir
  getHistory(limit: number = 50): NotificationHistory[] {
    return this.history.slice(-limit).reverse();
  }

  // Geçmişi temizle
  clearHistory(): void {
    this.history = [];
    this.saveHistory();
  }

  // Mevcut konfigürasyonu getir
  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Test bildirimi gönder
  async sendTestNotification(): Promise<void> {
    const testAlert: Alert = {
      id: `test-${Date.now()}`,
      type: 'temperature',
      value: 35,
      threshold: 30,
      timestamp: new Date().toISOString(),
      status: 'high',
      sensorId: 'test'
    };

    await this.sendNotification(testAlert);
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Export types
export { NotificationService }; 