import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor!');
      return;
    }

    // Basit kayıt işlemi
    if (username && password) {
      login(); // Kayıt sonrası otomatik giriş
      setError('');
    } else {
      setError('Tüm alanları doldurun!');
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center py-5">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className={`card border-0 shadow-sm ${isDarkMode ? 'bg-dark text-light' : 'bg-white'}`}>
              <div className="card-body p-4">
                <h4 className="text-center mb-4">Kayıt Ol</h4>
                
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
                      className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
            />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">Şifre</label>
                    <input
              type="password"
                      className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
                      required
            />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="confirmPassword" className="form-label">Şifre Tekrar</label>
                    <input
                      type="password"
                      className={`form-control ${isDarkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      id="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100 mb-3">
            Kayıt Ol
                  </button>

                  <div className="text-center">
                    <Link to="/login" className="text-decoration-none">
                      Zaten hesabınız var mı? Giriş yapın
                    </Link>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 