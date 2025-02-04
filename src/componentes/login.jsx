import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="login-container">
      <h2 className="title">Iniciar Sesión</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="login-input"
      />
      <div className="login-password-container">
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="login-input"
        />
        <button 
          onClick={() => setShowPassword(!showPassword)}
          className="login-show-password-button"
        >
          👁️
        </button>
      </div>
      <button className="login-button">Ingresar</button>
      <div className="login-links">
        <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Registrarse</Link>
      </div>
      <div className="login-social-login">
        <button className="login-social-button">Google</button>
        <button className="login-social-button">Facebook</button>
      </div>
    </div>
  );
};

export default Login;