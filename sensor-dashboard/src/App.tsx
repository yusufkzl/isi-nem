import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import Analytics from './pages/Analytics';
import Reports from './pages/Reports';
import AlarmHistory from './pages/AlarmHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import './styles/App.css';

// Özel Route bileşeni - korumalı rotalar için
const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? element : <Navigate to="/login" replace />;
};

// Ana içerik bileşeni
const AppContent: React.FC = () => {
  const { isLoggedIn, logout } = useAuth();
  const { isDarkMode } = useTheme();

  return (
      <Router>
      <div className={`min-vh-100 ${isDarkMode ? 'bg-dark text-light' : 'bg-light'}`}>
        {isLoggedIn && <Header onLogout={logout} />}
        <main className={`${isLoggedIn ? 'pt-5 mt-4' : ''}`}>
          <div className="container-fluid px-4">
            <Routes>
              {/* Korumalı rotalar */}
              <Route path="/" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/data" element={<PrivateRoute element={<DataVisualization />} />} />
              <Route path="/analytics" element={<PrivateRoute element={<Analytics />} />} />
              <Route path="/reports" element={<PrivateRoute element={<Reports />} />} />
              <Route path="/alarms" element={<PrivateRoute element={<AlarmHistory />} />} />
              <Route path="/settings" element={<PrivateRoute element={<Settings />} />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

              {/* Genel rotalar */}
              <Route path="/login" element={
                isLoggedIn ? <Navigate to="/" replace /> : <Login />
              } />
              <Route path="/register" element={
                isLoggedIn ? <Navigate to="/" replace /> : <Register />
              } />

              {/* Bilinmeyen rotaları ana sayfaya yönlendir */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </main>
        </div>
      </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
    </ThemeProvider>
    </AuthProvider>
  );
};

export default App; 