import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Login.css'; // Aynı css dosyasını kullanabilirsin
import { BsEye, BsEyeSlash } from 'react-icons/bs';


const Register: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !username || !password) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    // Basit simülasyon → kayıt verisi yazdır
    console.log('Yeni kullanıcı:', { email, username, password });

    // Kayıt başarılı → login sayfasına yönlendir
    navigate('/login');
  };

  return (
    <div className="login-container">
      <h2>Kayıt Ol</h2>
      <form onSubmit={handleRegister} className="login-form">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

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

        <button type="submit">Kayıt Ol</button>
      </form>

      <p>
        Hesabınız var mı? <Link to="/login">Giriş Yap</Link>
      </p>
    </div>
  );
};

export default Register;
