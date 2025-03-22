import React, { useState } from 'react';
import { Box, CssBaseline, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Divider, Collapse } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ChatIcon from '@mui/icons-material/Chat';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import { Link, useLocation } from 'react-router-dom';

const drawerWidth = 250;

const Layout = ({ children }) => {
  const location = useLocation();
  const [certificadosOpen, setCertificadosOpen] = useState(
    location.pathname.includes('/certificados/generar') || location.pathname.includes('/certificados/consultar')
  );

  const handleCertificadosClick = () => {
    setCertificadosOpen(!certificadosOpen);
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
            borderRight: 'none'
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
          <Typography variant="h6" noWrap sx={{ fontSize: '30px', color: '#CE0A0A', fontWeight: 'bold' }}>
            ECAF
          </Typography>
        </Toolbar>
        
        <Divider sx={{ mx: 2, backgroundColor: 'rgba(0,0,0,0.08)' }} />

        <List sx={{ mt: 2 }}>
          {/* Dashboard */}
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
          
          {/* Chat */}
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
          
          {/* Certificados con submenú */}
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
              {/* Generar Certificados */}
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
              
              {/* Consultar Certificados */}
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
        </List>
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