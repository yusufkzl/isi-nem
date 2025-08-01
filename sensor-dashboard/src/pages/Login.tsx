import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import '../styles/login.css';

const Login: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === '1234' && password === '1234') {
      login();
      setError('');
    } else {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div className="login-split-bg">
      <div className="login-split-container">
        <div className="login-split-left">
          <img src="/login.png" alt="Login Illustration" className="login-illustration" />
        </div>
        <div className="login-split-right">
          <div className="login-form-box">
            <h2 className="login-title">Giriş Yap</h2>
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
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
                <label htmlFor="password" className="form-label">Şifre</label>
                <div className="input-group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
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
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <input type="checkbox" id="remember" className="form-check-input me-1" />
                  <label htmlFor="remember" className="form-check-label">Beni Hatırla</label>
                </div>
                <Link to="/forgot" className="small text-decoration-none">Şifremi unuttum?</Link>
              </div>
              <button type="submit" className="btn btn-primary w-100 mb-2">
                Giriş Yap
              </button>
              <div className="text-center mt-2">
                <span>Hesabınız yok mu? </span>
                <Link to="/register" className="text-decoration-none">Kayıt olun</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"></link>