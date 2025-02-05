import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';



const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError('Error al iniciar sesión');
      console.error('Error al iniciar sesión:', error.message);
    } else {
      console.log('Usuario autenticado:', data);
      // Redirigir al usuario después del inicio de sesión
      window.location.href = '/dashboard';
    }
  };

  return (
    <div className="login-container mx-70 my-50  border-blue-500 border-y-4 border-x">
      <h2 className="title">Iniciar Sesión</h2>
      {error && <p className="error-message">{error}</p>}
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
          className="login-show-password-button "
        >
          👁️
        </button>
      </div>
      <button className="login-button" onClick={handleLogin}>
        Ingresar
        </button>
      <div className="login-links">
        <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Registrarse</Link>
      </div>
      {/* <div className="login-social-login">
        <button className="login-social-button">Google</button>
        <button className="login-social-button">Facebook</button>
      </div> */}
    </div>
  );
};

export default Login;