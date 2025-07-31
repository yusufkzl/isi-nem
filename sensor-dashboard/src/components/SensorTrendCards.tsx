import React from 'react';

interface TrendCardProps {
  title: string;
  icon: string;
  slope: number;
  confidence: number;
}

const TrendCard: React.FC<TrendCardProps> = ({ title, icon, slope, confidence }) => (
  <div className="trend-card app-card-compact bg-light-subtle border-0 mb-3 p-3">
    <div className="d-flex justify-content-between align-items-center mb-2">
      <div className="d-flex align-items-center gap-2">
        <i className={`bi ${icon} fs-4 text-danger`}></i>
        <span className="fw-bold">{title}</span>
      </div>
      <span className={`badge ${slope > 0 ? 'bg-success' : slope < 0 ? 'bg-info' : 'bg-secondary'}`}>
        <i className={`bi ${slope > 0 ? 'bi-arrow-up' : slope < 0 ? 'bi-arrow-down' : 'bi-dash-lg'} me-1`}></i>
        {slope > 0 ? 'Artıyor' : slope < 0 ? 'Azalıyor' : 'Sabit'}
      </span>
    </div>
    <small className="text-muted">
      Son 6 ölçümdeki değişim hızı ve ölçümlerin tutarlılığı gösterilmektedir.
    </small>
    <div className="d-flex justify-content-between align-items-end mt-3">
      <div>
        <div className="fw-bold">{slope.toFixed(4)}</div>
        <small className="text-muted">Eğim</small>
      </div>
      <div>
        <div className="fw-bold">%{confidence.toFixed(1)}</div>
        <small className="text-muted">
          Güven <span className={confidence < 15 ? 'text-success' : 'text-warning'}>
            {confidence < 15 ? 'Stabil' : 'Dalgalanıyor'}
          </span>
        </small>
      </div>
    </div>
  </div>
);

const App = () => (
  <div>
    <TrendCard
      title="Sıcaklık Trendi"
      icon="bi-thermometer-half"
      slope={-0.0194}
      confidence={10.5}
    />
    <TrendCard
      title="Nem Trendi"
      icon="bi-droplet-half"
      slope={-0.0762}
      confidence={14.1}
    />
  </div>
);

export default App;