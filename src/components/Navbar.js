import React, { useState, useEffect } from 'react';
import { 
  AppBar, 
  Toolbar, 
  Box, 
  IconButton, 
  Avatar, 
  Typography, 
  Badge,
  Divider,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip,
  Chip,
  CircularProgress,
  Backdrop,
  Stack,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

const Navbar = ({ pageTitle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
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
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Función mejorada para cerrar sesión con loader
  const handleLogout = () => {
    // Mostrar loader
    setIsLoggingOut(true);
    
    // Cerrar el menú
    handleClose();
    
    // Simulamos un pequeño retraso para que el usuario vea el loader
    // Este retraso puede ser sustituido por una llamada a la API real para cerrar sesión
    setTimeout(() => {
      // Eliminar datos de autenticación del localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      
      // Redirigir al usuario a la página de login
      navigate('/login', { replace: true });
      
      // Forzar una recarga completa para asegurar que la aplicación
      // se reinicia en un estado limpio
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 800); // Mostramos el loader por al menos 800ms
  };

  // Determinar el nombre de usuario y rol para mostrar
  const displayName = userData ? 
    (userData.firstname && userData.lastname ? 
      `${userData.firstname} ${userData.lastname}` : 
      userData.username || userData.email || 'Usuario') : 
    'Usuario';
    
  // Obtener el rol principal y los roles adicionales de Moodle
  const userRole = userData ? 
    (userData.role || 'Usuario') : 
    'Usuario';

  // Obtener todos los roles de Moodle si existen
  const moodleRoles = userData && userData.moodleRoles ? userData.moodleRoles : [];
  
  // Función para obtener el icono apropiado según el rol
  const getRoleIcon = (role) => {
    if (!role) return <PersonIcon fontSize="small" />;
    
    const roleLower = typeof role === 'string' ? role.toLowerCase() : '';
    
    if (roleLower.includes('admin') || roleLower === 'administrator' || roleLower === 'manager') {
      return <AdminPanelSettingsIcon fontSize="small" />;
    } else if (roleLower.includes('teach') || roleLower === 'professor' || roleLower === 'instructor') {
      return <SupervisorAccountIcon fontSize="small" />;
    } else if (roleLower === 'student' || roleLower === 'estudiante' || roleLower === 'alumno') {
      return <SchoolIcon fontSize="small" />;
    } else {
      return <PersonIcon fontSize="small" />;
    }
  };

  return (
    <>
      {/* Backdrop con loader para el cierre de sesión */}
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: 9999,
          flexDirection: 'column',
          gap: 2
        }}
        open={isLoggingOut}
      >
        <CircularProgress 
          color="inherit" 
          sx={{ 
            '& .MuiCircularProgress-circle': { 
              color: '#CE0A0A' 
            } 
          }} 
        />
        <Typography variant="body1" color="#fff" fontWeight={500}>
          Cerrando sesión...
        </Typography>
      </Backdrop>
      
      <AppBar 
        position="fixed" 
        elevation={0} 
        sx={{ 
          top: 0, 
          zIndex: 1100, 
          padding: '0px', 
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', 
          width: 'calc(100% - 250px)', 
          left: '250px',
          bgcolor: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
        }}
      >
      <Toolbar sx={{ display: 'flex', alignItems: 'center', minHeight: '64px' }}>
        {/* Título de la página */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: '#333',
              position: 'relative',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: -6,
                left: 0,
                width: '40px',
                height: '3px',
                backgroundColor: '#CE0A0A',
                borderRadius: '2px'
              }
            }}
          >
            {pageTitle}
          </Typography>
        </Box>

        {/* Iconos y perfil */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>
          {/* Tooltip para agenda */}
          <Tooltip title="Agenda">
            <IconButton 
              sx={{ 
                color: '#666', 
                '&:hover': { 
                  color: '#CE0A0A',
                  backgroundColor: 'rgba(206, 10, 10, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <EventNoteIcon />
            </IconButton>
          </Tooltip>
          
          {/* Tooltip para notificaciones */}
          <Tooltip title="Notificaciones">
            <IconButton 
              sx={{ 
                color: '#666', 
                '&:hover': { 
                  color: '#CE0A0A',
                  backgroundColor: 'rgba(206, 10, 10, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Badge badgeContent={3} color="error" variant="dot">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Tooltip para chat */}
          <Tooltip title="Chat">
            <IconButton 
              sx={{ 
                color: '#666', 
                '&:hover': { 
                  color: '#CE0A0A',
                  backgroundColor: 'rgba(206, 10, 10, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Badge badgeContent={5} color="primary" sx={{ '& .MuiBadge-badge': { bgcolor: '#CE0A0A' } }}>
                <ChatIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          <Divider orientation="vertical" flexItem sx={{ mx: 1, my: 1 }} />
          
          {/* Perfil de usuario */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1, 
              pl: 1,
              cursor: 'pointer',
              '&:hover': {
                '& .perfil-usuario-nombre': {
                  color: '#CE0A0A'
                }
              }
            }}
            onClick={handleClick}
          >
            <Avatar 
              sx={{ 
                bgcolor: '#f5f5f5', 
                color: '#CE0A0A',
                border: '2px solid #CE0A0A',
                width: 38,
                height: 38
              }}
            >
              {displayName.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ mr: 0.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  className="perfil-usuario-nombre"
                  sx={{ 
                    fontWeight: 600, 
                    color: '#333',
                    transition: 'color 0.2s'
                  }}
                >
                  {displayName}
                </Typography>
                <KeyboardArrowDownIcon 
                  fontSize="small" 
                  sx={{ 
                    color: open ? '#CE0A0A' : '#666',
                    transition: 'transform 0.2s',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
                  }} 
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {/* Chip del rol principal */}
                <Chip 
                  icon={getRoleIcon(userRole)}
                  label={userRole.charAt(0).toUpperCase() + userRole.slice(1)} 
                  size="small" 
                  sx={{ 
                    height: 18,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                    bgcolor: 'rgba(206, 10, 10, 0.1)',
                    color: '#CE0A0A',
                    borderRadius: 1
                  }} 
                />
                
                {/* Si hay más de un rol, mostrar un indicador */}
                {moodleRoles.length > 1 && (
                  <Chip
                    label={`+${moodleRoles.length - 1}`}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: '0.65rem',
                      fontWeight: 600,
                      bgcolor: 'rgba(0, 0, 0, 0.05)',
                      color: '#666',
                      borderRadius: 1
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>
          
          {/* Menú de usuario */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            PaperProps={{
              elevation: 2,
              sx: {
                width: 240, // Ancho fijo para el menú
                borderRadius: 2,
                mt: 1.5,
                overflow: 'visible',
                filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                '&:before': {
                  content: '""',
                  display: 'block',
                  position: 'absolute',
                  top: 0,
                  right: 14,
                  width: 10,
                  height: 10,
                  bgcolor: 'background.paper',
                  transform: 'translateY(-50%) rotate(45deg)',
                  zIndex: 0,
                },
              },
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            {/* Sección de roles de Moodle en el menú - Mejorada */}
            {moodleRoles.length > 0 && (
              <>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    display: 'block',
                    color: '#666',
                    px: 2,
                    pt: 1,
                    pb: 0.5
                  }}
                >
                  Tus roles en la plataforma
                </Typography>
                
                {/* Lista de roles en formato compacto */}
                <Box 
                  sx={{ 
                    maxHeight: 140, // Altura máxima para la lista de roles
                    overflowY: 'auto', // Scroll vertical si hay muchos roles
                    mb: 1,
                    mx: 1,
                    '&::-webkit-scrollbar': {
                      width: '6px',
                    },
                    '&::-webkit-scrollbar-thumb': {
                      backgroundColor: 'rgba(0,0,0,0.2)',
                      borderRadius: '3px',
                    }
                  }}
                >
                  <List dense disablePadding>
                    {moodleRoles.map((role, index) => (
                      <ListItem 
                        key={index} 
                        disablePadding 
                        sx={{ 
                          py: 0.25,
                          px: 1,
                          borderRadius: 1,
                          mb: 0.5,
                          bgcolor: 'rgba(206, 10, 10, 0.04)',
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 30 }}>
                          {getRoleIcon(role.roleName)}
                        </ListItemIcon>
                        <ListItemText 
                          primary={role.roleName} 
                          primaryTypographyProps={{
                            sx: { 
                              fontSize: '0.75rem',
                              color: '#CE0A0A',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
                <Divider sx={{ mx: 1 }} />
              </>
            )}
            
            <MenuItem sx={{ py: 1.5 }} onClick={handleClose}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#555' }} />
              </ListItemIcon>
              <Typography variant="body2">Mi Perfil</Typography>
            </MenuItem>
            <MenuItem sx={{ py: 1.5 }} onClick={handleClose}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#555' }} />
              </ListItemIcon>
              <Typography variant="body2">Configuración</Typography>
            </MenuItem>
            <Divider />
            <MenuItem 
              sx={{ py: 1.5, color: '#CE0A0A' }}
              onClick={handleLogout}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#CE0A0A' }} />
              </ListItemIcon>
              <Typography variant="body2">Cerrar Sesión</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
    </>
  );
};

export default Navbar;