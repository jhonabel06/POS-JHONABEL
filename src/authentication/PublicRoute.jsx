// PublicRoute.jsx
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { supabase }  from '/src/supabaseClient.jsx'; 

export const PublicRoute = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription?.unsubscribe();
  }, []);

  if (loading) return <div>Cargando...</div>;
  return !session ? children : <Navigate to="/dashboard" state={{ from: location }} replace />;

};

PublicRoute.propTypes = {
  children: PropTypes.node.isRequired,
};


