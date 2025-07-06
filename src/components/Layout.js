import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CodeIcon from '@mui/icons-material/Code';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ReactComponent as SharkLogo } from '../assets/logo.svg';

const drawerWidth = 250;

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [certificadosOpen, setCertificadosOpen] = useState(
    location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')
  );
  const [cargaOpen, setCargaOpen] = useState(
    location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento')
  );

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
      }
    }
  }, []);

  // Efecto para verificar permisos cuando se carga userData
  useEffect(() => {
    if (userData) {
      // Si el usuario es estudiante y está intentando acceder a rutas no permitidas
      if (isStudent() && (location.pathname === '/' || location.pathname === '/chat')) {
        // Redirigir a la página de certificados
        navigate('/certificados/consultar', { replace: true });
      }
    }
  }, [userData, location.pathname]);

  const handleCertificadosClick = () => {
    setCertificadosOpen(!certificadosOpen);
  };

  const handleCargaClick = () => {
    setCargaOpen(!cargaOpen);
  };

  // Función para determinar si el usuario es estudiante
  const isStudent = () => {
    if (!userData) return false;
    
    // Verificar el rol principal
    const roleLower = userData.role ? userData.role.toLowerCase() : '';
    if (roleLower === 'estudiante' || roleLower === 'student' || roleLower === 'alumno') {
      return true;
    }
    
    // Verificar roles de Moodle
    if (userData.moodleRoles && Array.isArray(userData.moodleRoles)) {
      return userData.moodleRoles.some(role => {
        const roleName = role.roleName.toLowerCase();
        return roleName === 'student' || roleName === 'estudiante' || roleName === 'alumno';
      }) && !isAdmin() && !isTeacher(); // Es estudiante solo si no es admin ni profesor
    }
    
    return false;
  };
  
  // Función para determinar si el usuario es administrador
  const isAdmin = () => {
    if (!userData) return false;
    
    // Verificar el rol principal
    const roleLower = userData.role ? userData.role.toLowerCase() : '';
    if (roleLower === 'administrador' || roleLower === 'admin' || roleLower === 'administrator' || roleLower === 'manager') {
      return true;
    }
    
    // Verificar roles de Moodle
    if (userData.moodleRoles && Array.isArray(userData.moodleRoles)) {
      return userData.moodleRoles.some(role => {
        const roleName = role.roleName.toLowerCase();
        return roleName === 'admin' || roleName === 'administrator' || roleName === 'manager';
      });
    }
    
    return false;
  };
  
  // Función para determinar si el usuario es profesor
  const isTeacher = () => {
    if (!userData) return false;
    
    // Verificar el rol principal
    const roleLower = userData.role ? userData.role.toLowerCase() : '';
    if (roleLower === 'profesor' || roleLower === 'teacher' || roleLower === 'docente' || roleLower === 'instructor') {
      return true;
    }
    
    // Verificar roles de Moodle
    if (userData.moodleRoles && Array.isArray(userData.moodleRoles)) {
      return userData.moodleRoles.some(role => {
        const roleName = role.roleName.toLowerCase();
        return roleName === 'teacher' || roleName === 'profesor' || roleName === 'editingteacher' || roleName === 'instructor';
      });
    }
    
    return false;
  };

  // Definimos estilos específicos para items seleccionados y no seleccionados
  const getListItemStyle = (isSelected) => ({
    margin: '8px 16px',
    borderRadius: '8px',
    backgroundColor: isSelected ? 'rgba(206, 10, 10, 0.9)' : 'transparent',
    color: isSelected ? '#fff' : '#333',
    boxShadow: isSelected ? '0 2px 4px rgba(206, 10, 10, 0.25)' : 'none',
    '&:hover': {
      backgroundColor: isSelected ? 'rgba(206, 10, 10, 0.9)' : 'rgba(206, 10, 10, 0.1)',
    },
    transition: 'all 0.2s ease-in-out'
  });

  // Estilo específico para el submenú
  const getSubItemStyle = (isSelected) => ({
    pl: 4,
    margin: '6px 16px 6px 32px',
    borderRadius: '8px',
    backgroundColor: isSelected ? 'rgba(206, 10, 10, 0.9)' : 'transparent',
    color: isSelected ? '#fff' : '#555',
    boxShadow: isSelected ? '0 2px 4px rgba(206, 10, 10, 0.25)' : 'none',
    '&:hover': {
      backgroundColor: isSelected ? 'rgba(206, 10, 10, 0.9)' : 'rgba(206, 10, 10, 0.1)',
    },
    transition: 'all 0.2s ease-in-out'
  });

  // Determinar si el usuario puede ver la sección de certificados completa
  const canAccessAllCertificates = () => {
    return true; // Ahora todos los usuarios pueden acceder a todas las opciones de certificados
  };

  // Determinar los permisos para generar certificados (ahora todos pueden)
  const canGenerateCertificates = () => {
    return true; // Todos los usuarios, incluidos estudiantes, pueden generar certificados
  };
// Funcion para submenu de informacion de estudiantes y programas
  const [infoOpen, setInfoOpen] = useState(
    location.pathname.includes('/informacion/estudiantes') || location.pathname.includes('/informacion/programas')
  );

  return (
    <Box 
      sx={{ 
        display: 'flex',
        overflow: 'hidden' // Prevenir overflow en el contenedor principal
      }}
    >
      <CssBaseline />
      
      {/* Menú Lateral */}
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { 
            width: drawerWidth, 
            boxSizing: 'border-box', 
            background: "#fff", 
            color: '#333',
            overflowX: 'hidden', // Prevenir overflow horizontal en el drawer
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minHeight: '100vh'
          },
        }}
      >
        {/* Header con título ECAF - Espaciado reducido */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          py: 1.5, // Padding vertical reducido
          px: 2,
          minHeight: '56px' // Altura mínima específica
        }}>
          <Typography 
            variant="h6" 
            noWrap 
            sx={{ 
              fontSize: '30px', 
              color: '#CE0A0A', 
              fontWeight: 'bold',
              lineHeight: 1 // Eliminar espacio extra del line-height
            }}
          >
            ECAF
          </Typography>
        </Box>
        
        {/* Divider con margen reducido */}
        <Divider sx={{ mx: 0, backgroundColor: 'rgba(0,0,0,0.08)', mb: 1 }} />

        {/* Lista de menú con padding superior reducido */}
        <List sx={{ pt: 0, flexGrow: 1 }}>
          {/* Dashboard - Solo para administradores y profesores */}
          {(!isStudent() || isAdmin() || isTeacher()) && (
            <Box sx={{ textDecoration: 'none' }} component={Link} to="/">
              <ListItem 
                button 
                disableRipple
                sx={getListItemStyle(location.pathname === '/')}
              >
                <ListItemIcon>
                  <DashboardIcon sx={{ 
                    color: location.pathname === '/' ? '#fff' : '#CE0A0A',
                    transition: 'all 0.2s ease-in-out'
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Dashboard" 
                  primaryTypographyProps={{
                    sx: { 
                      color: location.pathname === '/' ? '#fff' : '#333',
                      fontWeight: location.pathname === '/' ? 500 : 400,
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                />
              </ListItem>
            </Box>
          )}
          
          {/* Chat - Solo para administradores y profesores */}
          {(!isStudent() || isAdmin() || isTeacher()) && (
            <Box sx={{ textDecoration: 'none' }} component={Link} to="/chat">
              <ListItem 
                button 
                disableRipple
                sx={getListItemStyle(location.pathname === '/chat')}
              >
                <ListItemIcon>
                  <ChatIcon sx={{ 
                    color: location.pathname === '/chat' ? '#fff' : '#CE0A0A',
                    transition: 'all 0.2s ease-in-out'
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Chat" 
                  primaryTypographyProps={{
                    sx: { 
                      color: location.pathname === '/chat' ? '#fff' : '#333',
                      fontWeight: location.pathname === '/chat' ? 500 : 400,
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                />
              </ListItem>
            </Box>
          )}
          
          {/* Certificados con submenú - Accesible para todos */}
          <ListItem 
            button 
            onClick={handleCertificadosClick}
            disableRipple
            sx={{
              margin: '8px 16px',
              borderRadius: '8px',
              backgroundColor: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                ? 'rgba(206, 10, 10, 0.9)' 
                : 'transparent',
              color: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                ? '#fff' 
                : '#333',
              boxShadow: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar'))
                ? '0 2px 4px rgba(206, 10, 10, 0.25)'
                : 'none',
              '&:hover': {
                backgroundColor: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                  ? 'rgba(206, 10, 10, 0.9)' 
                  : 'rgba(206, 10, 10, 0.1)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
          >
            <ListItemIcon>
              <WorkspacePremiumIcon sx={{ 
                color: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                  ? '#fff' 
                  : '#CE0A0A',
                transition: 'all 0.2s ease-in-out'
              }} />
            </ListItemIcon>
            <ListItemText 
              primary="Certificados" 
              primaryTypographyProps={{
                sx: { 
                  color: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                    ? '#fff' 
                    : '#333',
                  fontWeight: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                    ? 500 
                    : 400,
                  transition: 'all 0.2s ease-in-out'
                }
              }}
            />
            {/* Mostrar el expandir/colapsar para todos los usuarios */}
            {certificadosOpen ? 
              <ExpandLess sx={{ 
                color: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                  ? '#fff' 
                  : '#555',
                transition: 'all 0.2s ease-in-out'
              }} /> : 
              <ExpandMore sx={{ 
                color: (location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')) 
                  ? '#fff' 
                  : '#555',
                transition: 'all 0.2s ease-in-out'
              }} />
            }
          </ListItem>
          
          {/* Submenú de Certificados */}
          <Collapse in={certificadosOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {/* Generar Certificados - Ahora accesible para todos, incluidos estudiantes */}
              <Box sx={{ textDecoration: 'none' }} component={Link} to="/certificados/generar">
                <ListItem 
                  button 
                  disableRipple
                  sx={getSubItemStyle(location.pathname === '/certificados/generar')}
                >
                  <ListItemIcon>
                    <AddIcon sx={{ 
                      color: location.pathname === '/certificados/generar' ? '#fff' : '#CE0A0A',
                      fontSize: '1.2rem',
                      transition: 'all 0.2s ease-in-out'
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Generar" 
                    primaryTypographyProps={{
                      sx: { 
                        color: location.pathname === '/certificados/generar' ? '#fff' : '#555',
                        fontSize: '0.9rem',
                        fontWeight: location.pathname === '/certificados/generar' ? 500 : 400,
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                </ListItem>
              </Box>
              
              {/* Consultar Certificados - Accesible para todos */}
              <Box sx={{ textDecoration: 'none' }} component={Link} to="/certificados/consultar">
                <ListItem 
                  button 
                  disableRipple
                  sx={getSubItemStyle(location.pathname === '/certificados/consultar')}
                >
                  <ListItemIcon>
                    <SearchIcon sx={{ 
                      color: location.pathname === '/certificados/consultar' ? '#fff' : '#CE0A0A',
                      fontSize: '1.2rem',
                      transition: 'all 0.2s ease-in-out'
                    }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Consultar" 
                    primaryTypographyProps={{
                      sx: { 
                        color: location.pathname === '/certificados/consultar' ? '#fff' : '#555',
                        fontSize: '0.9rem',
                        fontWeight: location.pathname === '/certificados/consultar' ? 500 : 400,
                        transition: 'all 0.2s ease-in-out'
                      }
                    }}
                  />
                </ListItem>
              </Box>
            </List>
          </Collapse>
          {/* Información con submenú - Visible solo para administradores y profesores */}
{(isAdmin() || isTeacher()) && (
  <>
    <ListItem 
      button 
      onClick={() => setInfoOpen(prev => !prev)}
      disableRipple
      sx={{
        margin: '8px 16px',
        borderRadius: '8px',
        backgroundColor: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas') 
          ? 'rgba(206, 10, 10, 0.9)' 
          : 'transparent',
        color: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas') 
          ? '#fff' 
          : '#333',
        boxShadow: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas')
          ? '0 2px 4px rgba(206, 10, 10, 0.25)'
          : 'none',
        '&:hover': {
          backgroundColor: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas') 
            ? 'rgba(206, 10, 10, 0.9)' 
            : 'rgba(206, 10, 10, 0.1)',
        },
        transition: 'all 0.2s ease-in-out'
      }}
    >
      <ListItemIcon>
        <MenuBookIcon sx={{
          color: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas') 
            ? '#fff' 
            : '#CE0A0A',
          transition: 'all 0.2s ease-in-out'
        }} />
      </ListItemIcon>
      <ListItemText 
        primary="Información" 
        primaryTypographyProps={{
          sx: { 
            color: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas') 
              ? '#fff' 
              : '#333',
            fontWeight: (location.pathname === '/informacion/estudiantes' || location.pathname === '/informacion/programas') 
              ? 500 
              : 400,
            transition: 'all 0.2s ease-in-out'
          }
        }}
      />
      {infoOpen ? <ExpandLess sx={{ color: '#555' }} /> : <ExpandMore sx={{ color: '#555' }} />}
    </ListItem>

    <Collapse in={infoOpen} timeout="auto" unmountOnExit>
      <List component="div" disablePadding>
        {/* Ver estudiantes */}
        <Box sx={{ textDecoration: 'none' }} component={Link} to="/informacion/estudiantes">
          <ListItem button disableRipple sx={getSubItemStyle(location.pathname === '/informacion/estudiantes')}>
            <ListItemIcon>
              <SchoolIcon sx={{ color: location.pathname === '/informacion/estudiantes' ? '#fff' : '#CE0A0A', fontSize: '1.2rem' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Ver Estudiantes" 
              primaryTypographyProps={{ 
                sx: { 
                  fontSize: '0.9rem',
                  color: location.pathname === '/informacion/estudiantes' ? '#fff' : '#555'
                } 
              }} 
            />
          </ListItem>
        </Box>

        {/* Ver Programas y Notas */}
        <Box sx={{ textDecoration: 'none' }} component={Link} to="/informacion/programas">
          <ListItem button disableRipple sx={getSubItemStyle(location.pathname === '/informacion/programas')}>
            <ListItemIcon>
              <MenuBookIcon sx={{ color: location.pathname === '/informacion/programas' ? '#fff' : '#CE0A0A', fontSize: '1.2rem' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Ver Programas y Notas" 
              primaryTypographyProps={{ 
                sx: { 
                  fontSize: '0.9rem',
                  color: location.pathname === '/informacion/programas' ? '#fff' : '#555'
                } 
              }} 
            />
          </ListItem>
        </Box>

        {/* Ver Diplomas */}
        <Box sx={{ textDecoration: 'none' }} component={Link} to="/informacion/diplomas">
          <ListItem button disableRipple sx={getSubItemStyle(location.pathname === '/informacion/diplomas')}>
            <ListItemIcon>
              <WorkspacePremiumIcon sx={{ color: location.pathname === '/informacion/diplomas' ? '#fff' : '#CE0A0A', fontSize: '1.2rem' }} />
            </ListItemIcon>
            <ListItemText 
              primary="Ver Diplomas" 
              primaryTypographyProps={{ 
                sx: { 
                  fontSize: '0.9rem',
                  color: location.pathname === '/informacion/diplomas' ? '#fff' : '#555'
                } 
              }} 
            />
          </ListItem>
        </Box>
      </List>
    </Collapse>
  </>
)}

          
          {/* Carga de Excel con submenú - Solo para administradores */}
          {isAdmin() && (
            <>
              <ListItem 
                button 
                onClick={handleCargaClick}
                disableRipple
                sx={{
                  margin: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                    ? 'rgba(206, 10, 10, 0.9)' 
                    : 'transparent',
                  color: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                    ? '#fff' 
                    : '#333',
                  boxShadow: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga')
                    ? '0 2px 4px rgba(206, 10, 10, 0.25)'
                    : 'none',
                  '&:hover': {
                    backgroundColor: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                      ? 'rgba(206, 10, 10, 0.9)' 
                      : 'rgba(206, 10, 10, 0.1)',
                  },
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                <ListItemIcon>
                  <UploadFileIcon sx={{ 
                    color: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                      ? '#fff' 
                      : '#CE0A0A',
                    transition: 'all 0.2s ease-in-out'
                  }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Carga de Datos" 
                  primaryTypographyProps={{
                    sx: { 
                      color: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                        ? '#fff' 
                        : '#333',
                      fontWeight: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                        ? 500 
                        : 400,
                      transition: 'all 0.2s ease-in-out'
                    }
                  }}
                />
                {cargaOpen ? 
                  <ExpandLess sx={{ 
                    color: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                      ? '#fff' 
                      : '#555',
                    transition: 'all 0.2s ease-in-out'
                  }} /> : 
                  <ExpandMore sx={{ 
                    color: (location.pathname.includes('/carga/estudiantes') || location.pathname.includes('/carga/programas') || location.pathname.includes('/carga/diplomas') || location.pathname.includes('/carga/entrenamiento') || location.pathname === '/carga') 
                      ? '#fff' 
                      : '#555',
                    transition: 'all 0.2s ease-in-out'
                  }} />
                }
              </ListItem>
              
              {/* Submenú de Carga de Datos */}
              <Collapse in={cargaOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {/* Información de Estudiantes */}
                  <Box sx={{ textDecoration: 'none' }} component={Link} to="/carga/estudiantes">
                    <ListItem 
                      button 
                      disableRipple
                      sx={getSubItemStyle(location.pathname === '/carga/estudiantes')}
                    >
                      <ListItemIcon>
                        <SchoolIcon sx={{ 
                          color: location.pathname === '/carga/estudiantes' ? '#fff' : '#CE0A0A',
                          fontSize: '1.2rem',
                          transition: 'all 0.2s ease-in-out'
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Información de Estudiantes" 
                        primaryTypographyProps={{
                          sx: { 
                            color: location.pathname === '/carga/estudiantes' ? '#fff' : '#555',
                            fontSize: '0.9rem',
                            fontWeight: location.pathname === '/carga/estudiantes' ? 500 : 400,
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      />
                    </ListItem>
                  </Box>
                  
                  {/* Programas, Materias y Notas */}
                  <Box sx={{ textDecoration: 'none' }} component={Link} to="/carga/programas">
                    <ListItem 
                      button 
                      disableRipple
                      sx={getSubItemStyle(location.pathname === '/carga/programas')}
                    >
                      <ListItemIcon>
                        <MenuBookIcon sx={{ 
                          color: location.pathname === '/carga/programas' ? '#fff' : '#CE0A0A',
                          fontSize: '1.2rem',
                          transition: 'all 0.2s ease-in-out'
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Programas y Notas" 
                        primaryTypographyProps={{
                          sx: { 
                            color: location.pathname === '/carga/programas' ? '#fff' : '#555',
                            fontSize: '0.9rem',
                            fontWeight: location.pathname === '/carga/programas' ? 500 : 400,
                            transition: 'all 0.2s ease-in-out'
                          }
                        }}
                      />
                    </ListItem>
                  </Box>
                  
                  {/* Diplomas */}
                  <Box sx={{ textDecoration: 'none' }} component={Link} to="/carga/diplomas">
                    <ListItem button disableRipple sx={getSubItemStyle(location.pathname === '/carga/diplomas')}>
                      <ListItemIcon>
                        <WorkspacePremiumIcon sx={{ 
                          color: location.pathname === '/carga/diplomas' ? '#fff' : '#CE0A0A',
                          fontSize: '1.2rem'
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Diplomas" 
                        primaryTypographyProps={{
                          sx: { 
                            color: location.pathname === '/carga/diplomas' ? '#fff' : '#555',
                            fontSize: '0.9rem',
                            fontWeight: location.pathname === '/carga/diplomas' ? 500 : 400
                          }
                        }}
                      />
                    </ListItem>
                  </Box>
                  
                  {/* Entrenamiento - Vector Store Manager */}
                  <Box sx={{ textDecoration: 'none' }} component={Link} to="/carga/entrenamiento">
                    <ListItem button disableRipple sx={getSubItemStyle(location.pathname === '/carga/entrenamiento')}>
                      <ListItemIcon>
                        <CodeIcon sx={{ 
                          color: location.pathname === '/carga/entrenamiento' ? '#fff' : '#CE0A0A',
                          fontSize: '1.2rem'
                        }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary="Entrenamiento" 
                        primaryTypographyProps={{
                          sx: { 
                            color: location.pathname === '/carga/entrenamiento' ? '#fff' : '#555',
                            fontSize: '0.9rem',
                            fontWeight: location.pathname === '/carga/entrenamiento' ? 500 : 400
                          }
                        }}
                      />
                    </ListItem>
                  </Box>
                </List>
              </Collapse>
            </>
          )}
        </List>
        
        {/* Footer Made with Love */}
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          mt: 'auto', // Empuja el footer hacia abajo
          mb: 1 
        }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontSize: '1rem', 
            display: 'flex', 
            alignItems: 'center' 
          }}>
            Hecho con <span style={{ color: '#e25555', margin: '0 4px' }}>❤️</span> por
          </Typography>
          <Box component="a" href="https://sharkagency.co/" target="_blank" sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mt: 1 
          }}>
            <SharkLogo style={{ height: 30 }} />
          </Box>
        </Box>
      </Drawer>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto', // Permitir scroll vertical, pero no horizontal
          overflowX: 'hidden',
          backgroundColor: '#fafafa'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;