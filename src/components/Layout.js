import React from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import DateIcon from '@mui/icons-material/DateRange';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 250;

const Layout = ({ children }) => {
  const location = useLocation();

  // Definimos estilos específicos para items seleccionados y no seleccionados
  const getListItemStyle = (isSelected) => ({
    margin: '8px 16px',
    borderRadius: '4px',
    backgroundColor: isSelected ? '#fff' : 'transparent',
    color: isSelected ? '#CE0A0A' : '#fff',
    border: isSelected ? '1.5px solid #54595F' : 'none',
    '&:hover': {
      backgroundColor: isSelected ? '#fff' : 'rgba(255, 255, 255, 0.1)',
    }
  });

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
            background: "#CE0A0A", 
            color: '#fff',
            overflowX: 'hidden' // Prevenir overflow horizontal en el drawer
          },
        }}
      >
        <Toolbar 
          sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            width: "100%", 
            py: 2
          }}
        >
          <Typography variant="h6" noWrap sx={{ fontSize: '30px' }}>
            ECAF
          </Typography>
        </Toolbar>

        <List sx={{ mt: 2 }}>
          {/* Dashboard */}
          <Box sx={{ textDecoration: 'none' }} component={Link} to="/">
            <ListItem 
              button 
              disableRipple
              sx={getListItemStyle(location.pathname === '/')}
            >
              <ListItemIcon>
                <DashboardIcon sx={{ color: location.pathname === '/' ? '#CE0A0A' : '#fff' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Dashboard" 
                primaryTypographyProps={{
                  sx: { color: location.pathname === '/' ? '#CE0A0A' : '#fff' }
                }}
              />
            </ListItem>
          </Box>
          
          {/* Chat */}
          <Box sx={{ textDecoration: 'none' }} component={Link} to="/chat">
            <ListItem 
              button 
              disableRipple
              sx={getListItemStyle(location.pathname === '/chat')}
            >
              <ListItemIcon>
                <ChatIcon sx={{ color: location.pathname === '/chat' ? '#CE0A0A' : '#fff' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Chat" 
                primaryTypographyProps={{
                  sx: { color: location.pathname === '/chat' ? '#CE0A0A' : '#fff' }
                }}
              />
            </ListItem>
          </Box>
          
          {/* Appointments */}
          <Box sx={{ textDecoration: 'none' }} component={Link} to="/appointments">
            <ListItem 
              button 
              disableRipple
              sx={getListItemStyle(location.pathname === '/appointments')}
            >
              <ListItemIcon>
                <DateIcon sx={{ color: location.pathname === '/appointments' ? '#CE0A0A' : '#fff' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Appointments" 
                primaryTypographyProps={{
                  sx: { color: location.pathname === '/appointments' ? '#CE0A0A' : '#fff' }
                }}
              />
            </ListItem>
          </Box>
        </List>
      </Drawer>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          overflow: 'auto', // Permitir scroll vertical, pero no horizontal
          overflowX: 'hidden'
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;