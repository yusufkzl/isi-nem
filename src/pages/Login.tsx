import React, { useState } from 'react';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const Login: React.FC<{ onLogin: () => void }> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // localStorage'dan kullanıcı bilgilerini al
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const { name: storedName, password: storedPassword } = JSON.parse(storedUser);
      // Kullanıcı bilgilerini doğrula
      if (name === storedName && password === storedPassword) {
        // Giriş başarılıysa ana sayfaya yönlendir
        onLogin();
        navigate('/');
      } else {
        setError('Geçersiz kullanıcı adı veya şifre.');
      }
    } else {
      setError('Kullanıcı bulunamadı. Lütfen kayıt olun.');
    }
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <h3 className="mb-4">Giriş Yap</h3>
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label>Kullanıcı Adı</Form.Label>
            <Form.Control
              type="text"
              placeholder="Kullanıcı adınızı girin"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            Giriş Yap
          </Button>
        </Form>
        <div className="mt-3">
          <span>Hesabınız yok mu? </span>
          <a href="/register">Kayıt Ol</a>
        </div>
      </Card>
    </Container>
  );
};

export default Login; 