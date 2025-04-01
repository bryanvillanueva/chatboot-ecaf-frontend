import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CargaExcel from './CargaExcel';

const CargaIndex = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Si estamos en la ruta principal de carga, redireccionamos a estudiantes
  useEffect(() => {
    if (location.pathname === '/carga') {
      navigate('/carga/estudiantes', { replace: true });
    }
  }, [location.pathname, navigate]);

  return <CargaExcel />;
};

export default CargaIndex;