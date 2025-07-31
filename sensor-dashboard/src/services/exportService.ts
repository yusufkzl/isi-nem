// Export ve Rapor Servisi
import { SensorData } from './api';
import { SensorStats, calculateStats, CorrelationResult, AnomalyResult } from './dataAnalysis';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

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

  // CSV Export (Düzenli ve uyumlu)
  exportToCSV(data: SensorData[], filename?: string): void {
    const headers = ['ID', 'Tarih', 'Saat', 'Sıcaklık (°C)', 'Nem (%)'];
    const csvRows = [
      headers.join(','),
      ...data.map(item => [
        `"${item.id}"`,
        `"${new Date(item.measurement_time || item.measurementTime).toLocaleDateString('tr-TR')}"`,
        `"${new Date(item.measurement_time || item.measurementTime).toLocaleTimeString('tr-TR')}"`,
        `"${item.temperature.toFixed(2)}"`,
        `"${item.humidity.toFixed(2)}"`
      ].join(','))
    ];
    const csvContent = csvRows.join('\r\n');
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

  // Excel Export (Gerçek .xlsx dosyası)
  exportToExcel(data: SensorData[], includeStats: boolean = true, filename?: string): void {
    const wsData = [
      ['ID', 'Tarih', 'Saat', 'Sıcaklık (°C)', 'Nem (%)'],
      ...data.map(item => [
        item.id,
        new Date(item.measurement_time || item.measurementTime).toLocaleDateString('tr-TR'),
        new Date(item.measurement_time || item.measurementTime).toLocaleTimeString('tr-TR'),
        item.temperature,
        item.humidity
      ])
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, 'Veriler');

    // İstatistikler sayfası ekle
    if (includeStats) {
      const stats = calculateStats(data);
      const statsSheet = XLSX.utils.aoa_to_sheet([
        ['Kategori', 'Minimum', 'Maksimum', 'Ortalama'],
        ['Sıcaklık', stats.minTemp, stats.maxTemp, stats.avgTemp],
        ['Nem', stats.minHum, stats.maxHum, stats.avgHum],
        ['Toplam Ölçüm', stats.totalReadings, '', ''],
        ['Son Güncelleme', new Date(stats.lastUpdate).toLocaleString('tr-TR'), '', '']
      ]);
      XLSX.utils.book_append_sheet(wb, statsSheet, 'İstatistikler');
    }

    XLSX.writeFile(wb, filename || `sensor_report_${new Date().toISOString().split('T')[0]}.xlsx`);
  }

  // PDF Export (Gerçek PDF dosyası)
  exportToPDF(reportData: ReportData, filename?: string): void {
    const doc = new jsPDF();
    doc.setFont('helvetica');
    doc.setFontSize(16);
    doc.text('Sensör Veri Raporu', 10, 10);

    doc.setFontSize(12);
    doc.text(`Rapor Tarihi: ${new Date(reportData.generatedAt).toLocaleString('tr-TR')}`, 10, 20);
    doc.text(`Veri Aralığı: ${new Date(reportData.dateRange.start).toLocaleDateString('tr-TR')} - ${new Date(reportData.dateRange.end).toLocaleDateString('tr-TR')}`, 10, 30);

    // İstatistikler
    doc.text('Genel İstatistikler:', 10, 40);
    doc.text(`Sıcaklık - Min: ${reportData.stats.minTemp.toFixed(2)}°C, Max: ${reportData.stats.maxTemp.toFixed(2)}°C, Ortalama: ${reportData.stats.avgTemp.toFixed(2)}°C`, 10, 50);
    doc.text(`Nem - Min: ${reportData.stats.minHum.toFixed(2)}%, Max: ${reportData.stats.maxHum.toFixed(2)}%, Ortalama: ${reportData.stats.avgHum.toFixed(2)}%`, 10, 60);

    // Korelasyon
    doc.text('Korelasyon Analizi:', 10, 70);
    doc.text(`Korelasyon Katsayısı: ${reportData.correlations.coefficient.toFixed(4)}`, 10, 78);
    doc.text(`İlişki Gücü: ${this.translateStrength(reportData.correlations.strength)}`, 10, 86);
    doc.text(`İlişki Yönü: ${this.translateRelationship(reportData.correlations.relationship)}`, 10, 94);

    // Anomali tablosu
    if (reportData.anomalies.length > 0) {
      doc.text('Anomali Tespitleri:', 10, 104);
      let y = 112;
      doc.setFontSize(10);
      doc.text('Tarih | Tür | Değer | Skor', 10, y);
      y += 6;
      reportData.anomalies.slice(0, 10).forEach(anomaly => {
        doc.text(
          `${new Date(anomaly.timestamp).toLocaleString('tr-TR')} | ${anomaly.type === 'temperature' ? 'Sıcaklık' : 'Nem'} | ${anomaly.value.toFixed(2)}${anomaly.type === 'temperature' ? '°C' : '%'} | ${anomaly.score.toFixed(2)}`,
          10, y
        );
        y += 6;
      });
      doc.setFontSize(12);
    }

    // Son 10 veri tablosu
    doc.text('Son 10 Kayıt:', 10, 140);
    let y2 = 148;
    doc.setFontSize(10);
    doc.text('ID | Tarih | Sıcaklık | Nem', 10, y2);
    y2 += 6;
    reportData.data.slice(-10).forEach(item => {
      doc.text(
        `${item.id} | ${new Date(item.measurement_time || item.measurementTime).toLocaleString('tr-TR')} | ${item.temperature.toFixed(2)}°C | ${item.humidity.toFixed(2)}%`,
        10, y2
      );
      y2 += 6;
    });
    doc.setFontSize(12);

    doc.save(filename || `sensor_report_${new Date().toISOString().split('T')[0]}.pdf`);
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
  scheduleAutoReport(interval: 'day' | 'week' | 'month', callback: () => Promise<ReportData>): void {
    const intervalMs = {
      day: 24 * 60 * 60 * 1000,
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000
    };

    setInterval(async () => {
      try {
        const reportData = await callback();
        this.exportToPDF(reportData, `auto_report_${interval}_${new Date().toISOString().split('T')[0]}.pdf`);
        console.log(`Otomatik ${interval} rapor oluşturuldu`);
      } catch (error) {
        console.error('Otomatik rapor oluşturma hatası:', error);
      }
    }, intervalMs[interval]);
  }

  // Yardımcı fonksiyonlar
  private downloadFile(content: string | Blob, filename: string, mimeType: string): void {
    let blob: Blob;
    if (typeof content === 'string') {
      blob = new Blob([content], { type: mimeType });
    } else {
      blob = content;
    }
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
          this.exportToExcel(data, true, `${base}.xlsx`);
          break;
      }
    });
  }
}

// Singleton instance
export const exportService = new ExportService();

// Export types
export { ExportService };