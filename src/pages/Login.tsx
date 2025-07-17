import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css'; // Tasarım için ayrı css istersen
import { BsEye, BsEyeSlash } from 'react-icons/bs';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // Şimdilik basit kontrol
    if (username === 'admin' && password === '1234') {
      // Giriş başarılı
      console.log('Login başarılı');
      navigate('/'); // Dashboard sayfasına yönlendir
    } else {
      setError('Kullanıcı adı veya şifre hatalı!');
    }
  };

  return (
    <div className="login-container">
      <h2>Giriş Yap</h2>
      <form onSubmit={handleLogin} className="login-form">
        <label>Kullanıcı Adı</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label>Şifre</label>
<div className="password-field">
  <input
    type={showPassword ? 'text' : 'password'}
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />
  <button
    type="button"
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
    {showPassword ? <BsEyeSlash /> : <BsEye />}
  </button>
</div>


        {error && <div className="error-message">{error}</div>}

        <button type="submit">Giriş Yap</button>
      </form>

      <p>
        Hesabınız yok mu? <Link to="/register">Kayıt Ol</Link>
      </p>
    </div>
  );
};

export default Login;
