// components/LogoutButton.jsx
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { supabase } from '../supabaseClient.jsx';

const LogoutButton = ({ className, children }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (!error) {
        navigate('/'); // Redirección a login
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Opcional: Agregar manejo de errores visual (ej: toast)
    }
  };

  return (
    <button
      onClick={handleLogout}
      className={`cursor-pointer ${className}`}
    >
      {children || 'Cerrar sesión'}
    </button>
  );
};

LogoutButton.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node
};

export default LogoutButton;