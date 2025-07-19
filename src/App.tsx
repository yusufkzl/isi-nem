import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ToastContainer } from 'react-bootstrap';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import Analytics from './pages/Analytics';
import AlarmHistory from './pages/AlarmHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Register from './pages/Register';
import Login from './pages/Login';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';
import { useState } from 'react';
import SensorDataDisplay from './components/SensorDataDisplay';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <ThemeProvider>
      <Router>
        <div className="app-wrapper">
          {isLoggedIn ? (
            <>
              <Header onLogout={handleLogout} />
              <Container fluid className="py-4">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/data" element={<DataVisualization />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/alarms" element={<AlarmHistory />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Routes>
              </Container>
            </>
          ) : (
            <Routes>
              <Route path="/register" element={<Register onRegister={handleLogin} />} />
              <Route path="/login" element={<Login onLogin={handleLogin} />} />
              <Route path="*" element={<Login onLogin={handleLogin} />} />
            </Routes>
          )}
          <ToastContainer className="position-fixed bottom-0 end-0 p-3" />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App; 