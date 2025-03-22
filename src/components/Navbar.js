import React, { useState } from 'react';
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
  Chip
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import EventNoteIcon from '@mui/icons-material/EventNote';
import ChatIcon from '@mui/icons-material/Chat';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

const Navbar = ({ pageTitle }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
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
              <PersonIcon />
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
                  Usuario Prueba
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
                <Chip 
                  label="Administrador" 
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
              </Box>
            </Box>
          </Box>
          
          {/* Menú de usuario */}
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            onClick={handleClose}
            PaperProps={{
              elevation: 2,
              sx: {
                minWidth: 200,
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
            <MenuItem sx={{ py: 1.5 }}>
              <ListItemIcon>
                <PersonIcon fontSize="small" sx={{ color: '#555' }} />
              </ListItemIcon>
              <Typography variant="body2">Mi Perfil</Typography>
            </MenuItem>
            <MenuItem sx={{ py: 1.5 }}>
              <ListItemIcon>
                <SettingsIcon fontSize="small" sx={{ color: '#555' }} />
              </ListItemIcon>
              <Typography variant="body2">Configuración</Typography>
            </MenuItem>
            <Divider />
            <MenuItem sx={{ py: 1.5, color: '#CE0A0A' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: '#CE0A0A' }} />
              </ListItemIcon>
              <Typography variant="body2">Cerrar Sesión</Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;