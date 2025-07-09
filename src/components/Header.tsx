import React, { useState } from 'react';
import { Navbar, Nav, Container, Badge, Dropdown } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { BsThermometerHalf, BsGraphUp, BsBell, BsGear, BsPerson, BsSun, BsMoon } from 'react-icons/bs';

const Header: React.FC = () => {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications] = useState([
    { id: 1, text: "Sıcaklık sensörü kritik seviyede!", isNew: true },
    { id: 2, text: "Nem sensörü bakım gerekiyor", isNew: false },
  ]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    // Tema değişikliği uygulanabilir
  };

  return (
    <Navbar bg={isDarkMode ? "dark" : "primary"} variant="dark" expand="lg" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center">
          <BsThermometerHalf className="me-2" size={24} />
          Sensör İzleme Sistemi
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
              className="d-flex align-items-center"
            >
              <BsThermometerHalf className="me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/analytics" 
              active={location.pathname === '/analytics'}
              className="d-flex align-items-center"
            >
              <BsGraphUp className="me-1" /> Analiz
            </Nav.Link>
          </Nav>
          <Nav>
            <Dropdown align="end">
              <Dropdown.Toggle variant="link" className="nav-link text-light d-flex align-items-center">
                <BsBell className="me-1" />
                <Badge bg="danger" className="notification-badge">
                  {notifications.filter(n => n.isNew).length}
                </Badge>
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Header>Bildirimler</Dropdown.Header>
                {notifications.map(notification => (
                  <Dropdown.Item key={notification.id} className={notification.isNew ? 'fw-bold' : ''}>
                    {notification.text}
                  </Dropdown.Item>
                ))}
                <Dropdown.Divider />
                <Dropdown.Item as={Link} to="/alarms">Tüm Bildirimleri Gör</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <Nav.Link onClick={toggleTheme} className="d-flex align-items-center">
              {isDarkMode ? <BsSun className="me-1" /> : <BsMoon className="me-1" />}
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/settings" 
              active={location.pathname === '/settings'}
              className="d-flex align-items-center"
            >
              <BsGear className="me-1" /> Ayarlar
            </Nav.Link>
            <Nav.Link 
              as={Link} 
              to="/profile" 
              active={location.pathname === '/profile'}
              className="d-flex align-items-center"
            >
              <BsPerson className="me-1" /> Profil
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 