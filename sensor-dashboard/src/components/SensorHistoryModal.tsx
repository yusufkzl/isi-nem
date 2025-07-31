import React from 'react';
import { SensorData } from '../services/api';

interface Props {
  show: boolean;
  onClose: () => void;
  data: SensorData[];
}

const SensorHistoryModal: React.FC<Props> = ({ show, onClose, data }) => {
  if (!show) return null;
  return (
    <div className="modal-backdrop fade-in">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Sensör Geçmişi</h5>
            <button type="button" className="btn-close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Tarih</th>
                  <th>Sıcaklık (°C)</th>
                  <th>Nem (%)</th>
                </tr>
              </thead>
              <tbody>
                {data.map((item, idx) => (
                  <tr key={idx}>
                    <td>{new Date(item.measurement_time || item.measurementTime).toLocaleString('tr-TR')}</td>
                    <td>{item.temperature}</td>
                    <td>{item.humidity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SensorHistoryModal;