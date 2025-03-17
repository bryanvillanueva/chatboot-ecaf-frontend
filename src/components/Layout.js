import React from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import DateIcon from '@mui/icons-material/DateRange';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 240;

const Layout = ({ children }) => {
  const location = useLocation();

  return (
    <Box sx={{ display: 'flex' }}>
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
            background: "#ed403d", 
            color: '#fff' 
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
          <Typography variant="h6" noWrap>
            ECAF
          </Typography>
        </Toolbar>

        <List>
        <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", mx: 2, my: 1 }} />
          <ListItem button component={Link} to="/" selected={location.pathname === '/'}>
            <ListItemIcon>
              <DashboardIcon sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: '#fff' }} primary="Dashboard" />
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", mx: 2, my: 1 }} />

          <ListItem button component={Link} to="/chat" selected={location.pathname === '/chat'}>
            <ListItemIcon>
              <ChatIcon sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: '#fff' }} primary="Chat" />
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", mx: 2, my: 1 }} />

          <ListItem button component={Link} to="/appointments" selected={location.pathname === '/appointments'}>
            <ListItemIcon>
              <DateIcon sx={{ color: '#fff' }} />
            </ListItemIcon>
            <ListItemText sx={{ color: '#fff' }} primary="Appointments" />
          </ListItem>
          <Divider sx={{ bgcolor: "rgba(255,255,255,0.3)", mx: 2, my: 1 }} />  {/* Línea agregada al final */}
        </List>
      </Drawer>

      {/* Contenido Principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
