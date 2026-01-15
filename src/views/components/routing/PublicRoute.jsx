import React from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function PublicRoute({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (token) {
      // Se estiver autenticado, redireciona para a última página guardada
      const lastPath = sessionStorage.getItem('last_non_login_path');
      if (lastPath && lastPath !== location.pathname) {
        navigate(lastPath, { replace: true });
      } else {
        // Se não houver última página, vai para profile
        navigate('/profile', { replace: true });
      }
    }
  }, [token, navigate, location.pathname]);

  // Se não tiver token, renderiza o componente
  if (!token) {
    return children;
  }

  // Se tiver token, retorna null enquanto redireciona
  return null;
}