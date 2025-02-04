import { useState } from 'react';
import { Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Iniciar Sesión</h2>
      <input
        type="email"
        placeholder="Correo electrónico"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />
      <div style={styles.passwordContainer}>
        <input
          type={showPassword ? 'text' : 'password'}
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />
        <button 
          onClick={() => setShowPassword(!showPassword)}
          style={styles.showPasswordButton}
        >
          👁️
        </button>
      </div>
      <button style={styles.loginButton}>Ingresar</button>
      <div style={styles.links}>
        <Link to="/recover-password">¿Olvidaste tu contraseña?</Link>
        <Link to="/register">Registrarse</Link>
      </div>
      <div style={styles.socialLogin}>
        <button style={styles.socialButton}>Google</button>
        <button style={styles.socialButton}>Facebook</button>
      </div>
    </div>
  );
};

// Estilos básicos (puedes reemplazar con CSS Modules o Styled Components)
const styles = {
  container: { textAlign: 'center', padding: '20px' },
  input: { margin: '10px', padding: '8px', width: '80%' },
  passwordContainer: { position: 'relative' },
  showPasswordButton: { position: 'absolute', right: '25px', top: '18px' },
  loginButton: { backgroundColor: '#007bff', color: 'white', padding: '10px 20px' },
  links: { margin: '15px', display: 'flex', justifyContent: 'space-around' },
  socialLogin: { marginTop: '30px' },
  socialButton: { margin: '5px', padding: '10px' }
};

export default Login;