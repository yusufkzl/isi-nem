import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Register: React.FC<{ onRegister: () => void }> = ({ onRegister }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Basit bir doğrulama
    if (name && password && email) {
      // Kullanıcı bilgilerini localStorage'a kaydet
      localStorage.setItem('user', JSON.stringify({ name, password, email }));
      // Kayıt işlemi başarılıysa giriş sayfasına yönlendir
      onRegister();
      navigate('/login');
    } else {
      setError('Lütfen tüm alanları doldurun.');
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4">Kayıt Ol</h3>
        <Form onSubmit={handleRegister}>
          <Form.Group className="mb-3">
            <Form.Label>Kullanıcı Adı</Form.Label>
            <Form.Control
              type="text"
              placeholder="İsminizi girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>E-posta</Form.Label>
            <Form.Control
              type="email"
              placeholder="E-posta adresinizi girin"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Şifre</Form.Label>
            <Form.Control
              type="password"
              placeholder="Şifrenizi girin"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>
          {error && <div className="alert alert-danger">{error}</div>}
          <Button variant="primary" type="submit">
            Kayıt Ol
          </Button>
        </Form>
        <div className="mt-3">
          <span>Zaten bir hesabınız var mı? </span>
          <a href="/login">Giriş Yap</a>
        </div>
      </Card>
    </Container>
  );
};

export default Register; 