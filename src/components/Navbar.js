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
  ListItemText,
  Paper,
  Button
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import axios from 'axios';
import io from 'socket.io-client';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// Definir URL de la API
const API_URL = 'https://webhook-ecaf-production.up.railway.app'; // Ajusta esto a la URL de tu API

const Navbar = ({ pageTitle }) => {
  // Estados para el menú de perfil
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Estados para el sistema de notificaciones
  const [notificationCount, setNotificationCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
  const notificationsOpen = Boolean(notificationAnchorEl);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
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
    
  // Cargar contador de notificaciones iniciales
  fetchNotificationCount();
  
  // Conectar a Socket.IO para notificaciones en tiempo real con opciones adicionales
  const socket = io(API_URL, {
    transports: ['websocket', 'polling'], // Intenta primero WebSocket, luego polling como fallback
    reconnectionAttempts: 5, // Número de intentos de reconexión
    reconnectionDelay: 1000, // Tiempo entre intentos de reconexión (ms)
    timeout: 20000, // Timeout para la conexión inicial (ms)
    path: '/socket.io/', // Asegúrate de que coincida con la configuración del servidor
  });
  
  // Añade log cuando socket está intentando conectar
  console.log('Intentando conectar a Socket.IO...', API_URL);
  
  socket.on('connect', () => {
    console.log('✅ Conectado a Socket.IO para notificaciones, socket ID:', socket.id);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Error de conexión Socket.IO:', error);
  });
  
  socket.on('certificateStatusChanged', (notification) => {
    console.log('🔔 Notificación recibida:', notification);
    
    // Incrementar el contador de notificaciones
    setNotificationCount(prev => prev + 1);
    
    // Agregar la nueva notificación a la lista si está abierta
    setNotifications(prev => [notification, ...prev]);
    
    // Mostrar una notificación toast estilizada
    toast.info(
      <div>
        <div style={{ 
          fontWeight: 600, 
          marginBottom: '4px', 
          color: '#CE0A0A',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <WorkspacePremiumIcon fontSize="small" /> 
          Certificado Actualizado
        </div>
        <div style={{ color: '#333' }}>
          {notification.clientName ? (
            <>El certificado de <strong>{notification.clientName}</strong> </>
          ) : (
            <>El certificado #{notification.certificate_id} </>
          )}
          cambió a <span style={{ fontWeight: 600, color: '#CE0A0A' }}>
            {translateStatus(notification.newStatus)}
          </span>
        </div>
      </div>, 
      {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        style: {
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          borderLeft: '4px solid #CE0A0A'
        },
        progressStyle: {
          background: 'linear-gradient(to right, #CE0A0A, #e74c3c)'
        }
      }
    );
  });
  
  socket.on('disconnect', (reason) => {
    console.log('⚠️ Desconectado de Socket.IO, razón:', reason);
  });
  
  // Limpiar Socket.IO al desmontar
  return () => {
    console.log('Desconectando socket...');
    socket.disconnect();
  };
}, []);
  
  // Función para obtener el contador de notificaciones
  const fetchNotificationCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/certificados/notificaciones/contador`);
      setNotificationCount(response.data.count);
      console.log('📊 Contador de notificaciones:', response.data.count);
    } catch (error) {
      console.error('❌ Error al obtener contador de notificaciones:', error);
    }
  };
  
  const fetchNotifications = async () => {
    try {
      setIsLoadingNotifications(true);
      const response = await axios.get(`${API_URL}/api/certificados/notificaciones?limit=10`);
      setNotifications(response.data);
      console.log('📋 Notificaciones cargadas:', response.data.length);
      setIsLoadingNotifications(false);
    } catch (error) {
      console.error('❌ Error al obtener notificaciones:', error);
      setIsLoadingNotifications(false);
    }
  };
  
  // Función para marcar notificaciones como leídas
  const markAsRead = async (ids) => {
    if (!ids || ids.length === 0) return;
    
    try {
      await axios.put(`${API_URL}/api/certificados/notificaciones/marcar-leidas`, { ids });
      
      // Actualizar la UI
      setNotifications(prev => 
        prev.map(notif => 
          ids.includes(notif.id) ? {...notif, read_status: true} : notif
        )
      );
      
      // Actualizar el contador
      fetchNotificationCount();
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
    }
  };
  
  // Función para marcar todas como leídas
  const markAllAsRead = async () => {
    const unreadIds = notifications
      .filter(notif => !notif.read_status)
      .map(notif => notif.id);
      
    if (unreadIds.length > 0) {
      await markAsRead(unreadIds);
    }
  };
  
  // Función para traducir estados de certificados
  const translateStatus = (status) => {
    const statusMap = {
      'pending': 'Pendiente',
      'processing': 'En proceso',
      'completed': 'Completado',
      'rejected': 'Rechazado',
      'approved': 'Aprobado',
      'cancelled': 'Cancelado'
      // Añadir más estados según tus necesidades
    };
    
    return statusMap[status] || status;
  };
  
  // Abrir menú de notificaciones
  const handleNotificationClick = (event) => {
    setNotificationAnchorEl(event.currentTarget);
    // Cargar notificaciones al abrir
    fetchNotifications();
  };
  
  // Cerrar menú de notificaciones
  const handleNotificationClose = () => {
    setNotificationAnchorEl(null);
  };
  
  // Manejar clic en una notificación
  const handleNotificationItemClick = (notification) => {
    // Si no está leída, márcarla como leída
    if (!notification.read_status) {
      markAsRead([notification.id]);
    }
    
    // Aquí puedes añadir navegación a la página de detalles si es necesario
    // Por ejemplo: navigate(`/certificados/${notification.certificate_id}`);
  };
  
  // Formatear fecha para las notificaciones
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    if (diffDays < 7) return `Hace ${diffDays} días`;
    
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Manejo del menú de usuario
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
      
      {/* Contenedor de Toast para notificaciones emergentes */}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      
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
          
          {/* Tooltip para notificaciones - SISTEMA ACTUALIZADO */}
          <Tooltip title="Notificaciones de certificados">
            <IconButton 
              onClick={handleNotificationClick}
              sx={{ 
                color: notificationsOpen ? '#CE0A0A' : '#666', 
                backgroundColor: notificationsOpen ? 'rgba(206, 10, 10, 0.08)' : 'transparent',
                '&:hover': { 
                  color: '#CE0A0A',
                  backgroundColor: 'rgba(206, 10, 10, 0.08)'
                },
                transition: 'all 0.2s'
              }}
            >
              <Badge 
                badgeContent={notificationCount} 
                color="error" 
                sx={{ 
                  '& .MuiBadge-badge': { 
                    backgroundColor: '#CE0A0A',
                    fontWeight: 'bold'
                  } 
                }}
              >
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* Menú de notificaciones */}
          <Menu
            anchorEl={notificationAnchorEl}
            open={notificationsOpen}
            onClose={handleNotificationClose}
            PaperProps={{
              elevation: 2,
              sx: {
                width: 360,
                maxHeight: 500,
                borderRadius: 2,
                mt: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
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
            {/* Encabezado del menú de notificaciones */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              px: 2, 
              py: 1.5,
              borderBottom: '1px solid rgba(0,0,0,0.08)' 
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#333' }}>
                Notificaciones
              </Typography>
              
              {notificationCount > 0 && (
                <Button 
                  size="small" 
                  startIcon={<DoneAllIcon fontSize="small" />}
                  onClick={markAllAsRead}
                  sx={{ 
                    textTransform: 'none', 
                    color: '#CE0A0A',
                    '&:hover': { backgroundColor: 'rgba(206,10,10,0.08)' }
                  }}
                >
                  Marcar todas como leídas
                </Button>
              )}
            </Box>
            
            {/* Lista de notificaciones */}
            <Box sx={{ overflow: 'auto', maxHeight: 380 }}>
              {isLoadingNotifications ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress size={30} sx={{ color: '#CE0A0A' }} />
                </Box>
              ) : notifications.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay notificaciones
                  </Typography>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {notifications.map((notification) => (
                    <ListItem 
                      key={notification.id}
                      alignItems="flex-start"
                      sx={{ 
                        px: 2, 
                        py: 1.5,
                        backgroundColor: notification.read_status ? 'transparent' : 'rgba(206,10,10,0.04)',
                        borderBottom: '1px solid rgba(0,0,0,0.06)',
                        cursor: 'pointer',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' }
                      }}
                      onClick={() => handleNotificationItemClick(notification)}
                    >
                      <Box sx={{ display: 'flex', width: '100%' }}>
                        <ListItemIcon sx={{ minWidth: 40 }}>
                          {!notification.read_status ? (
                            <FiberNewIcon sx={{ color: '#CE0A0A' }} />
                          ) : (
                            <NotificationsIcon sx={{ color: '#999' }} />
                          )}
                        </ListItemIcon>
                        
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
                            Certificado #{notification.certificate_id}
                            {notification.nombre && notification.apellido && (
                              <Typography component="span" variant="body2" sx={{ ml: 0.5 }}>
                                - {notification.nombre} {notification.apellido}
                              </Typography>
                            )}
                          </Typography>
                          
                          <Typography variant="body2" color="text.secondary">
                            Estado cambiado de{' '}
                            <Typography component="span" variant="body2" sx={{ fontWeight: 500 }}>
                              {translateStatus(notification.old_status || 'nuevo')}
                            </Typography>
                            {' '}a{' '}
                            <Typography 
                              component="span" 
                              variant="body2" 
                              sx={{ 
                                fontWeight: 600, 
                                color: '#CE0A0A'
                              }}
                            >
                              {translateStatus(notification.new_status)}
                            </Typography>
                          </Typography>
                          
                          <Typography 
                            variant="caption" 
                            color="text.secondary"
                            sx={{ display: 'block', mt: 0.5 }}
                          >
                            {formatDate(notification.created_at)}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
            
            {/* Pie del menú de notificaciones */}
            <Box sx={{ p: 1.5, borderTop: '1px solid rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <Button 
                fullWidth 
                size="small"
                onClick={() => {
                  handleNotificationClose();
                  navigate('/certificados/consultar');
                }}
                sx={{ 
                  textTransform: 'none', 
                  color: '#CE0A0A',
                  '&:hover': { backgroundColor: 'rgba(206,10,10,0.08)' }
                }}
              >
                Ver todos los certificados
              </Button>
            </Box>
          </Menu>
          
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