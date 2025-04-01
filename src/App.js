import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Layout from './components/Layout';
import Login from './pages/Login';
import Generar from './certificados/generar';
import Consultar from './certificados/consultar';
import CargaExcel from './carga';
import EstudiantesPage from './carga/estudiantes';
import ProgramasPage from './carga/programas';

import axios from 'axios';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Comprobar si el usuario ya está autenticado al cargar la aplicación
  useEffect(() => {
    const verifyAuth = async () => {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.log('No se encontró token de autenticación');
        setIsLoading(false);
        return;
      }
      
      try {
        console.log('Verificando token de autenticación...');
        
        // Verificar validez del token localmente
        const isTokenValid = validateLocalToken(token);
        
        if (isTokenValid) {
          console.log('Token válido, autenticación exitosa');
          setIsAuthenticated(true);
        } else {
          console.log('Token inválido o expirado, cerrando sesión');
          // Token inválido o expirado, eliminarlo
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error('Error al verificar autenticación:', error);
        // En caso de error, asumimos que no está autenticado
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
      } finally {
        setIsLoading(false);
      }
    };
    
    // Función para validar el token almacenado localmente
    const validateLocalToken = (token) => {
      try {
        // Decodificar el token (que está en base64)
        const tokenData = JSON.parse(atob(token));
        console.log('Datos del token:', { 
          userId: tokenData.userId,
          username: tokenData.username,
          // Mostrar tiempo de expiración en formato legible
          expiresAt: tokenData.expiresAt ? new Date(tokenData.expiresAt).toLocaleString() : 'No definido'
        });
        
        // Verificar si el token ha expirado
        if (tokenData.expiresAt && tokenData.expiresAt < Date.now()) {
          console.log('Token expirado. Expiró el:', new Date(tokenData.expiresAt).toLocaleString());
          return false;
        }
        
        // Verificar que el token tenga los campos requeridos
        if (!tokenData.userId) {
          console.log('Token incompleto: falta userId');
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Error al validar token:', error);
        return false;
      }
    };
    
    verifyAuth();
  }, []);
  
  // Solicitar permisos de notificación
  useEffect(() => {
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, []);
  
  // Función para manejar el login exitoso
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };
  
  // Función para cerrar sesión
  const handleLogout = () => {
    // Eliminar datos de sesión
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Actualizar estado
    setIsAuthenticated(false);
    
    // Opcional: Notificar al servidor sobre el cierre de sesión
    // axios.post('https://webhook-ecaf-production.up.railway.app/api/logout');
  };
  
  // Si está cargando, mostrar un indicador o página de carga
  if (isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          backgroundColor: '#f5f5f5'
        }}
      >
        <CircularProgress sx={{ color: '#CE0A0A' }} />
      </Box>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Ruta pública - Login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? 
              <Navigate to="/" replace /> : 
              <Login onLoginSuccess={handleLoginSuccess} pageTitle="Iniciar Sesión" />
          } 
        />
        
        {/* Rutas protegidas */}
        <Route 
          path="/*" 
          element={
            isAuthenticated ? (
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard pageTitle="Dashboard"/>} />
                  <Route path="/chat" element={<Chat pageTitle="Chat"/>} />
                  <Route path="/certificados/generar" element={<Generar pageTitle="Generar Certificado"/>} />
                  <Route path="/certificados/consultar" element={<Consultar pageTitle="Consultar Certificados"/>} />
                  <Route path="/carga" element={<CargaExcel pageTitle="Carga de Información"/>} />
                  <Route path="/carga/estudiantes" element={<EstudiantesPage />} />
                  <Route path="/carga/programas" element={<ProgramasPage />} />
                </Routes>
              </Layout>
            ) : (
              <Navigate to="/login" replace />
            )
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;