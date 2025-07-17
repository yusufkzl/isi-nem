import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container, ToastContainer } from 'react-bootstrap';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import DataVisualization from './pages/DataVisualization';
import AlarmHistory from './pages/AlarmHistory';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';   //✔️ Doğru şifre → kullanıcı adı: admin şifre: 1234
import Register from './pages/Register';   // Register hazır olunca açacağız
import { ThemeProvider } from './context/ThemeContext';
import './styles/App.css';
import 'react-circular-progressbar/dist/styles.css';
import Analytics from './pages/Analytics';


const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Login ve Register sayfalarında Header yok */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} /> 

          {/* Diğer tüm sayfalarda Header var */}
          <Route
            path="*"
            element={
              <div className="app-wrapper">
                <Header />
                <Container fluid className="py-4">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/data" element={<DataVisualization />} />
                    <Route path="/alarms" element={<AlarmHistory />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/analytics" element={<Analytics />} />
                  </Routes>
                </Container>
                <ToastContainer className="position-fixed bottom-0 end-0 p-3" />
              </div>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
