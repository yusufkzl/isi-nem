// Export ve Rapor Servisi
import { SensorData } from './api';
import { SensorStats, calculateStats, CorrelationResult, AnomalyResult } from './dataAnalysis';

export interface ReportData {
  stats: SensorStats;
  data: SensorData[];
  dateRange: {
    start: string;
    end: string;
  };
  correlations: CorrelationResult;
  anomalies: AnomalyResult[];
  generatedAt: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeCharts: boolean;
  includeStats: boolean;
  includeAnomalies: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

class ExportService {

  // CSV Export
  exportToCSV(data: SensorData[], filename?: string): void {
    const headers = ['ID', 'Tarih', 'Saat', 'Sıcaklık (°C)', 'Nem (%)'];
    
    const csvContent = [
      headers.join(','),
      ...data.map(item => [
        item.id,
        new Date(item.measurement_time || item.measurementTime).toLocaleDateString('tr-TR'),
        new Date(item.measurement_time || item.measurementTime).toLocaleTimeString('tr-TR'),
        item.temperature.toFixed(2),
        item.humidity.toFixed(2)
      ].join(','))
    ].join('\n');

    this.downloadFile(csvContent, filename || `sensor_data_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  // JSON Export
  exportToJSON(data: SensorData[], includeStats: boolean = true, filename?: string): void {
    const exportData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        totalRecords: data.length,
        dateRange: {
          start: data.length > 0 ? data[0].measurement_time || data[0].measurementTime : null,
          end: data.length > 0 ? data[data.length - 1].measurement_time || data[data.length - 1].measurementTime : null
        }
      },
      data: data
    };

    if (includeStats) {
      exportData.statistics = calculateStats(data);
    }

    const jsonContent = JSON.stringify(exportData, null, 2);
    this.downloadFile(jsonContent, filename || `sensor_data_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  }

  // Excel Export (CSV formatında, Excel tarafından açılabilir)
  exportToExcel(data: SensorData[], includeStats: boolean = true, filename?: string): void {
    let csvContent = 'Sensör Veri Raporu\n\n';
    
    if (includeStats) {
      const stats = calculateStats(data);
      csvContent += 'İSTATİSTİKLER\n';
      csvContent += 'Kategori,Minimum,Maksimum,Ortalama\n';
      csvContent += `Sıcaklık,${stats.minTemp.toFixed(2)},${stats.maxTemp.toFixed(2)},${stats.avgTemp.toFixed(2)}\n`;
      csvContent += `Nem,${stats.minHum.toFixed(2)},${stats.maxHum.toFixed(2)},${stats.avgHum.toFixed(2)}\n\n`;
      csvContent += `Toplam Ölçüm: ${stats.totalReadings}\n`;
      csvContent += `Son Güncelleme: ${new Date(stats.lastUpdate).toLocaleString('tr-TR')}\n\n`;
    }

    csvContent += 'VERİLER\n';
    csvContent += 'ID,Tarih,Saat,Sıcaklık (°C),Nem (%)\n';
    
    data.forEach(item => {
      const date = new Date(item.measurement_time || item.measurementTime);
      csvContent += `${item.id},${date.toLocaleDateString('tr-TR')},${date.toLocaleTimeString('tr-TR')},${item.temperature.toFixed(2)},${item.humidity.toFixed(2)}\n`;
    });

    this.downloadFile(csvContent, filename || `sensor_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  }

  // PDF Export (HTML to PDF simulation)
  exportToPDF(reportData: ReportData, filename?: string): void {
    const htmlContent = this.generateHTMLReport(reportData);
    
    // Gerçek projede jsPDF veya puppeteer kullanılabilir
    // Şimdilik HTML olarak indir
    this.downloadFile(htmlContent, filename || `sensor_report_${new Date().toISOString().split('T')[0]}.html`, 'text/html');
  }

  // HTML Rapor Oluştur
  private generateHTMLReport(reportData: ReportData): string {
    return `
<!DOCTYPE html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sensör Veri Raporu</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #007bff; padding-bottom: 10px; }
        .section { margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 20px; }
        .stat-card { border: 1px solid #ddd; padding: 15px; border-radius: 5px; background: #f8f9fa; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #007bff; color: white; }
        .anomaly { background-color: #fff3cd; }
        .correlation { padding: 10px; background: #e7f3ff; border-radius: 5px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🌡️ Sensör Veri Raporu</h1>
        <p>Rapor Tarihi: ${new Date(reportData.generatedAt).toLocaleString('tr-TR')}</p>
        <p>Veri Aralığı: ${new Date(reportData.dateRange.start).toLocaleDateString('tr-TR')} - ${new Date(reportData.dateRange.end).toLocaleDateString('tr-TR')}</p>
    </div>

    <div class="section">
        <h2>📊 Genel İstatistikler</h2>
        <div class="stats-grid">
            <div class="stat-card">
                <h3>🌡️ Sıcaklık</h3>
                <p><strong>Minimum:</strong> ${reportData.stats.minTemp.toFixed(2)}°C</p>
                <p><strong>Maksimum:</strong> ${reportData.stats.maxTemp.toFixed(2)}°C</p>
                <p><strong>Ortalama:</strong> ${reportData.stats.avgTemp.toFixed(2)}°C</p>
            </div>
            <div class="stat-card">
                <h3>💧 Nem</h3>
                <p><strong>Minimum:</strong> ${reportData.stats.minHum.toFixed(2)}%</p>
                <p><strong>Maksimum:</strong> ${reportData.stats.maxHum.toFixed(2)}%</p>
                <p><strong>Ortalama:</strong> ${reportData.stats.avgHum.toFixed(2)}%</p>
            </div>
        </div>
        <p><strong>Toplam Ölçüm:</strong> ${reportData.stats.totalReadings}</p>
        <p><strong>Son Güncelleme:</strong> ${new Date(reportData.stats.lastUpdate).toLocaleString('tr-TR')}</p>
    </div>

    <div class="section">
        <h2>🔗 Korelasyon Analizi</h2>
        <div class="correlation">
            <p><strong>Korelasyon Katsayısı:</strong> ${reportData.correlations.coefficient.toFixed(4)}</p>
            <p><strong>İlişki Gücü:</strong> ${this.translateStrength(reportData.correlations.strength)}</p>
            <p><strong>İlişki Yönü:</strong> ${this.translateRelationship(reportData.correlations.relationship)}</p>
        </div>
    </div>

    ${reportData.anomalies.length > 0 ? `
    <div class="section">
        <h2>⚠️ Anomali Tespitleri</h2>
        <table>
            <thead>
                <tr>
                    <th>Tarih</th>
                    <th>Tür</th>
                    <th>Değer</th>
                    <th>Anomali Skoru</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.anomalies.map(anomaly => `
                    <tr class="anomaly">
                        <td>${new Date(anomaly.timestamp).toLocaleString('tr-TR')}</td>
                        <td>${anomaly.type === 'temperature' ? 'Sıcaklık' : 'Nem'}</td>
                        <td>${anomaly.value.toFixed(2)}${anomaly.type === 'temperature' ? '°C' : '%'}</td>
                        <td>${anomaly.score.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>
    ` : ''}

    <div class="section">
        <h2>📋 Veri Tablosu (Son 50 Kayıt)</h2>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Tarih</th>
                    <th>Sıcaklık (°C)</th>
                    <th>Nem (%)</th>
                </tr>
            </thead>
            <tbody>
                ${reportData.data.slice(-50).map(item => `
                    <tr>
                        <td>${item.id}</td>
                        <td>${new Date(item.measurement_time || item.measurementTime).toLocaleString('tr-TR')}</td>
                        <td>${item.temperature.toFixed(2)}</td>
                        <td>${item.humidity.toFixed(2)}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    </div>

    <div class="footer">
        <p>Bu rapor Sensör İzleme Sistemi tarafından otomatik olarak oluşturulmuştur.</p>
    </div>
</body>
</html>`;
  }

  // Grafik Export (Canvas to Image)
  exportChartAsImage(chartElement: HTMLCanvasElement, filename?: string): void {
    try {
      chartElement.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = filename || `chart_${new Date().toISOString().split('T')[0]}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Grafik export edilemedi:', error);
    }
  }

  // Otomatik Rapor Planlama
  scheduleAutoReport(interval: 'daily' | 'weekly' | 'monthly', callback: () => Promise<ReportData>): void {
    const intervalMs = {
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
      monthly: 30 * 24 * 60 * 60 * 1000
    };

    setInterval(async () => {
      try {
        const reportData = await callback();
        this.exportToPDF(reportData, `auto_report_${interval}_${new Date().toISOString().split('T')[0]}`);
        console.log(`Otomatik ${interval} rapor oluşturuldu`);
      } catch (error) {
        console.error('Otomatik rapor oluşturma hatası:', error);
      }
    }, intervalMs[interval]);
  }

  // Yardımcı fonksiyonlar
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  private translateStrength(strength: string): string {
    const translations: { [key: string]: string } = {
      'very_weak': 'Çok Zayıf',
      'weak': 'Zayıf',
      'moderate': 'Orta',
      'strong': 'Güçlü',
      'very_strong': 'Çok Güçlü'
    };
    return translations[strength] || strength;
  }

  private translateRelationship(relationship: string): string {
    const translations: { [key: string]: string } = {
      'positive': 'Pozitif (Doğru Orantılı)',
      'negative': 'Negatif (Ters Orantılı)',
      'none': 'İlişki Yok'
    };
    return translations[relationship] || relationship;
  }

  // Bulk Export (Birden fazla format)
  exportMultipleFormats(data: SensorData[], formats: Array<'csv' | 'json' | 'excel'>, basename?: string): void {
    const base = basename || `sensor_data_${new Date().toISOString().split('T')[0]}`;
    
    formats.forEach(format => {
      switch (format) {
        case 'csv':
          this.exportToCSV(data, `${base}.csv`);
          break;
        case 'json':
          this.exportToJSON(data, true, `${base}.json`);
          break;
        case 'excel':
          this.exportToExcel(data, true, `${base}_excel.csv`);
          break;
      }
    });
  }
}

// Singleton instance
export const exportService = new ExportService();

// Export types
export { ExportService }; 