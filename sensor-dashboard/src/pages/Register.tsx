import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import '../styles/login.css';

const Register: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !email || !password || !confirmPassword) {
      setError('Tüm alanları doldurun!');
      setSuccess('');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      setSuccess('');
      return;
    }
    setError('');
    setSuccess('Kayıt başarılı! Giriş yapabilirsiniz.');
  };

  // Sosyal giriş butonları için demo fonksiyonlar
  const handleGoogle = () => alert('Google ile kayıt ol (demo)');
  const handleFacebook = () => alert('Facebook ile kayıt ol (demo)');
  const handleApple = () => alert('Apple ile kayıt ol (demo)');

  return (
    <div className="login-split-bg">
      <div className="login-split-container">
        <div className="login-split-left">
          <img src="/login.png" alt="Register Illustration" className="login-illustration" />
        </div>
        <div className="login-split-right">
          <div className="login-form-box">
            <h2 className="login-title">Kayıt Ol</h2>
            {/* Sosyal medya ile kayıt */}
            <div className="d-flex justify-content-center gap-3 mb-3">
              <button type="button" className="btn btn-light border rounded-circle p-2" onClick={handleFacebook}>
                <i className="bi bi-facebook" style={{ fontSize: 24, color: '#1877f3' }}></i>
              </button>
              <button type="button" className="btn btn-light border rounded-circle p-2" onClick={handleGoogle}>
                <i className="bi bi-google" style={{ fontSize: 24, color: '#ea4335' }}></i>
              </button>
              <button type="button" className="btn btn-light border rounded-circle p-2" onClick={handleApple}>
                <i className="bi bi-apple" style={{ fontSize: 24, color: '#111' }}></i>
              </button>
            </div>
            {/* Ayırıcı */}
            <div className="d-flex align-items-center mb-3">
              <hr className="flex-grow-1" />
              <span className="mx-2 text-muted small">veya e-posta ile kayıt ol</span>
              <hr className="flex-grow-1" />
            </div>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" role="alert">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="username" className="form-label">Kullanıcı Adı</label>
                <input
                  type="text"
                  className="form-control"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">E-posta</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Şifre</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Şifre Tekrar</label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    className="form-control"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    tabIndex={-1}
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                  </button>
                </div>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-2">
                Kayıt Ol
              </button>
              <div className="text-center mt-2">
                <span>Zaten hesabınız var mı? </span>
                <Link to="/login" className="text-decoration-none">Giriş Yap</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;