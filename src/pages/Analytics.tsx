// src/pages/Analytics.tsx

import React, { useEffect, useState } from 'react';
import DateTimeSelector from '../components/DateTimeSelector';
import SensorSelector from '../components/SensorSelector';
import SensorHistoryChart from '../components/SensorHistoryChart';
import { getSensorHistoryData, SensorReading } from '../services/mockData';

const Analytics: React.FC = () => {
  // Tarih ve saat seçimleri
  const [date, setDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [startTime, setStartTime] = useState('00:00');
  const [endTime, setEndTime] = useState('23:59');

  // Sensör seçimi
  const [selectedSensor, setSelectedSensor] = useState<1 | 2 | null>(null);

  // Veriler
  const [sensor1Data, setSensor1Data] = useState<SensorReading[]>([]);
  const [sensor2Data, setSensor2Data] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Veri yükleme
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSensorHistoryData(date, startTime, endTime);
      setSensor1Data(result.sensor1);
      setSensor2Data(result.sensor2);
    } catch (err) {
      setError('Veriler yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // İlk yüklemede veri çek
  useEffect(() => {
    loadData();
  }, []);

  // Kullanıcı seçim değiştirdiğinde veri çek
  const handleDateTimeChange = (newDate: string, newStart: string, newEnd: string) => {
    setDate(newDate);
    setStartTime(newStart);
    setEndTime(newEnd);
  };

  useEffect(() => {
    loadData();
  }, [date, startTime, endTime]);

 return (
  <div className="min-h-screen bg-gray-100 py-8">
    <div className="max-w-5xl mx-auto px-4">

      {/* Kart 1: Üst Panel */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-10 border border-gray-200">
        <h1 className="text-3xl font-bold mb-6 text-blue-700 flex items-center gap-2">
          📈 Veri Analizi Paneli
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="flex-1 min-w-[200px]">
            <DateTimeSelector
              date={date}
              startTime={startTime}
              endTime={endTime}
              onChange={handleDateTimeChange}
            />
          </div>
          <div className="flex-1 min-w-[150px]">
            <SensorSelector
              selected={selectedSensor}
              onChange={setSelectedSensor}
            />
          </div>
        </div>
      </div>

      {/* Yükleniyor veya Hata */}
      {loading && (
        <div className="text-center text-gray-500 my-6">Yükleniyor...</div>
      )}
      {error && (
        <div className="text-center text-red-500 my-6">{error}</div>
      )}

      {/* Kart 2 ve 3: Sensör Grafikleri */}
      {!loading && !error && (
        <>
          {selectedSensor === null && (
            <div className="grid grid-cols-1 gap-12">
              {/* Sensör 1 Kartı */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300">
                <SensorHistoryChart title="Sensör 1" data={sensor1Data} />
              </div>

              {/* Sensör 2 Kartı */}
              <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-300">
                <SensorHistoryChart title="Sensör 2" data={sensor2Data} />
              </div>
            </div>
          )}

          {selectedSensor === 1 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-300">
              <SensorHistoryChart title="Sensör 1" data={sensor1Data} />
            </div>
          )}

          {selectedSensor === 2 && (
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-300">
              <SensorHistoryChart title="Sensör 2" data={sensor2Data} />
            </div>
          )}
        </>
      )}
    </div>
  </div>
);
};

export default Analytics;
