import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "Sıcaklık sensörü kritik seviyede!", isNew: true },
    { id: 2, text: "Nem sensörü bakım gerekiyor", isNew: false },
  ];

  return (
    <nav className={`navbar navbar-expand-lg fixed-top ${isDarkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} shadow-sm`}>
      <div className="container-fluid px-4">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <i className="bi bi-thermometer-half me-2 text-primary fs-4"></i>
          <span className="fw-semibold">Sensör İzleme</span>
        </Link>

        <button 
          className="navbar-toggler border-0" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarContent"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link 
              to="/" 
                className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
              >
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link 
              to="/analytics" 
                className={`nav-link ${location.pathname === '/analytics' ? 'active' : ''}`}
              >
                <i className="bi bi-graph-up me-2"></i>
                Analiz
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/reports" 
                className={`nav-link ${location.pathname === '/reports' ? 'active' : ''}`}
              >
                <i className="bi bi-file-earmark-text me-2"></i>
                Raporlar
              </Link>
            </li>
            <li className="nav-item">
              <Link 
              to="/alarms" 
                className={`nav-link ${location.pathname === '/alarms' ? 'active' : ''}`}
              >
                <i className="bi bi-exclamation-triangle me-2"></i>
                Alarmlar
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                to="/settings" 
                className={`nav-link ${location.pathname === '/settings' ? 'active' : ''}`}
              >
                <i className="bi bi-gear me-2"></i>
                Ayarlar
              </Link>
            </li>
          </ul>

          <ul className="navbar-nav align-items-center">
            {/* Bildirimler */}
            <li className="nav-item dropdown me-3">
              <button
                className="btn btn-link nav-link border-0 position-relative"
                onClick={() => setShowNotifications(!showNotifications)}
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-bell fs-5"></i>
                {notifications.some(n => n.isNew) && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                  {notifications.filter(n => n.isNew).length}
                  </span>
                )}
              </button>
              <ul className={`dropdown-menu dropdown-menu-end ${showNotifications ? 'show' : ''}`}>
                <li><h6 className="dropdown-header">Bildirimler</h6></li>
                {notifications.map(notification => (
                  <li key={notification.id}>
                    <button className={`dropdown-item ${notification.isNew ? 'bg-light' : ''}`}>
                      <small>{notification.text}</small>
                      {notification.isNew && <span className="badge bg-primary ms-2">Yeni</span>}
                    </button>
                  </li>
                ))}
                <li><hr className="dropdown-divider" /></li>
                <li><button className="dropdown-item text-center">Tümünü Gör</button></li>
              </ul>
            </li>

            {/* Tema Toggle */}
            <li className="nav-item me-3">
              <button
                className="btn btn-link nav-link border-0"
                onClick={toggleTheme}
                title={isDarkMode ? 'Açık Tema' : 'Koyu Tema'}
              >
                <i className={`bi ${isDarkMode ? 'bi-sun' : 'bi-moon'} fs-5`}></i>
              </button>
            </li>

            {/* Profil */}
            <li className="nav-item dropdown">
              <button
                className="btn btn-link nav-link border-0 d-flex align-items-center"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-person-circle fs-5 me-2"></i>
                <span className="d-none d-md-inline">Admin</span>
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <Link to="/profile" className="dropdown-item">
                    <i className="bi bi-person me-2"></i>
                    Profil
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="dropdown-item">
                    <i className="bi bi-gear me-2"></i>
                    Ayarlar
                  </Link>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={onLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
                    Çıkış Yap
                  </button>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Header; 