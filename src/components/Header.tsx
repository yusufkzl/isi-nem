import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import {BsThermometerHalf,BsGraphUp,BsBell,BsGear,BsPerson,BsSun,BsMoon,BsExclamationTriangle} from 'react-icons/bs';
import './Header.css';
import { useTheme } from '../context/ThemeContext';

const Header: React.FC = () => {
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme(); // ✅ Temayı context'ten al
  const [notifications, setNotifications] = useState<{ id: string; text: string }[]>([]);

  // Bildirimleri localStorage'dan al
  useEffect(() => {
    const stored = localStorage.getItem('alarmLog');
    if (stored) {
      try {
        const alarms = JSON.parse(stored);
        const unresolved = alarms.filter((a: any) => a.status !== 'resolved');
        const formatted = unresolved.map((alarm: any) => ({
          id: alarm.id,
          text:
            alarm.type === 'temperature'
              ? 'Sıcaklık sensörü kritik seviyede!'
              : 'Nem sensörü kritik seviyede!',
        }));
        setNotifications(formatted);
      } catch (error) {
        console.error('Bildirimleri okuma hatası:', error);
      }
    }
  }, []);

  // Bildirimleri temizle
  const clearNotifications = () => {
    const stored = localStorage.getItem('alarmLog');
    if (stored) {
      try {
        const alarms = JSON.parse(stored);
        const resolved = alarms.map((alarm: any) => ({
          ...alarm,
          status: 'resolved'
        }));
        localStorage.setItem('alarmLog', JSON.stringify(resolved));
        setNotifications([]);
      } catch (error) {
        console.error('Temizleme sırasında hata:', error);
      }
    }
  };

  const newNotificationCount = notifications.length;

  return (
    <Navbar
      variant="dark"
      expand="lg"
      className={`shadow-sm ${isDarkMode ? 'bg-dark' : 'custom-navbar'}`}
    >
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <BsThermometerHalf className="me-2" size={24} />
          Ortam İzleme Sistemi
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/" active={location.pathname === '/'} className="d-flex align-items-center">
              <BsThermometerHalf className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/analytics" active={location.pathname === '/analytics'} className="d-flex align-items-center">
              <BsGraphUp className="me-1" /> Analiz
            </Nav.Link>
            <Nav.Link as={Link} to="/alarms" active={location.pathname === '/alarms'} className="d-flex align-items-center">
              <BsExclamationTriangle className="me-1" /> Alarmlar
            </Nav.Link>
          </Nav>

          <Nav>
            {/* 🔔 Bildirim Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="nav-link text-light d-flex align-items-center">
                <BsBell className="me-1" />
                {newNotificationCount > 0 && (
                  <Badge bg="danger" className="notification-badge">
                    {newNotificationCount}
                  </Badge>
                )}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Bildirimler</Dropdown.Header>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <Dropdown.Item key={notification.id} className="fw-bold">
                      {notification.text}
                    </Dropdown.Item>
                  ))
                ) : (
                  <Dropdown.Item className="text-muted">Yeni alarm yok</Dropdown.Item>
                )}
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/alarms">Tüm Bildirimleri Gör</Dropdown.Item>
                <Dropdown.Item className="text-danger" onClick={clearNotifications}>
                  Bildirimleri Temizle
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* 🌙 Karanlık Mod Butonu */}
            <Nav.Link onClick={toggleTheme} className="d-flex align-items-center">
              {isDarkMode ? <BsSun className="me-1" /> : <BsMoon className="me-1" />}
            </Nav.Link>

            {/* ⚙️ Ayar ve Profil Linkleri */}
            <Nav.Link as={Link} to="/settings" active={location.pathname === '/settings'} className="d-flex align-items-center">
              <BsGear className="me-1" /> Ayarlar
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" active={location.pathname === '/profile'} className="d-flex align-items-center">
              <BsPerson className="me-1" /> Profil
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
