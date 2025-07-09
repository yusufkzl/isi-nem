import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ToastContainer } from 'react-bootstrap';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import AlarmHistory from './pages/AlarmHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <div className="app-wrapper">
          <Header />
          <Container fluid className="py-4">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/data" element={<DataVisualization />} />
              <Route path="/alarms" element={<AlarmHistory />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Container>
          <ToastContainer className="position-fixed bottom-0 end-0 p-3" />
        </div>
      </Router>
    </ThemeProvider>
  );
};

export default App; 