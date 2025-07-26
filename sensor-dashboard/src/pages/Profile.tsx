import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Row, Col, Modal } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaKey, FaSignOutAlt, FaCamera } from 'react-icons/fa';

const Profile: React.FC = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [user, setUser] = useState({ name: '', email: '' });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // API çağrısı burada yapılacak
    setShowPasswordModal(false);
  };

  const handleLogout = () => {
    // Çıkış işlemi burada yapılacak
  };

  return (
    <div className="profile-page">
      <Row className="g-4">
        <Col lg={4}>
          <Card className="shadow-sm text-center">
            <Card.Body>
              <div className="position-relative d-inline-block mb-4">
                <div className="profile-image-container rounded-circle overflow-hidden">
                  <img
                    src="https://via.placeholder.com/150"
                    alt="Profil"
                    className="img-fluid"
                  />
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  className="position-absolute bottom-0 end-0 rounded-circle p-2"
                >
                  <FaCamera />
                </Button>
              </div>
              <h4>{user.name}</h4>
              <p className="text-muted mb-4">Sistem Yöneticisi</p>
              <Button
                variant="outline-danger"
                className="d-flex align-items-center mx-auto"
                onClick={handleLogout}
              >
                <FaSignOutAlt className="me-2" />
                Çıkış Yap
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h5 className="mb-4">Profil Bilgileri</h5>
              <Form>
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaUser className="me-2" />
                        Ad Soyad
                      </Form.Label>
                      <Form.Control
                        type="text"
                        defaultValue={user.name}
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label>
                        <FaEnvelope className="me-2" />
                        E-posta
                      </Form.Label>
                      <Form.Control
                        type="email"
                        defaultValue={user.email}
                        className="bg-light"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="mt-4">
                  <Button
                    variant="outline-primary"
                    className="d-flex align-items-center"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <FaKey className="me-2" />
                    Şifre Değiştir
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          <Card className="shadow-sm">
            <Card.Body>
              <h5 className="mb-4">Hesap Ayarları</h5>
              <Form>
                <Form.Check
                  type="switch"
                  id="two-factor"
                  label="İki Faktörlü Doğrulama"
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="activity-log"
                  label="Aktivite Günlüğü"
                  className="mb-3"
                />
                <Form.Check
                  type="switch"
                  id="login-alerts"
                  label="Giriş Uyarıları"
                />
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Şifre Değiştir</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePasswordSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Mevcut Şifre</Form.Label>
              <Form.Control
                type="password"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Yeni Şifre</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Yeni Şifre (Tekrar)</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                İptal
              </Button>
              <Button variant="primary" type="submit">
                Değiştir
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default Profile; 