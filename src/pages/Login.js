import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Typography, 
  Paper,
  InputAdornment,
  IconButton,
  CircularProgress,
  Alert,
  Collapse,
  FormControl,
  InputLabel,
  OutlinedInput,
  FormHelperText,
  Tab,
  Tabs
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import MessageIcon from '@mui/icons-material/Message';
import axios from 'axios';

const Login = ({ onLoginSuccess }) => {
  const [loginType, setLoginType] = useState(0); // 0 = username, 1 = email
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('error');
  const [showAlert, setShowAlert] = useState(false);
  const [lastLoginAttempt, setLastLoginAttempt] = useState(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleTabChange = (event, newValue) => {
    setLoginType(newValue);
    // Limpiar error al cambiar de pestaña
    setError('');
  };

  // Función para mostrar alertas temporales
  const showTemporaryAlert = (message, severity = 'error') => {
    setAlertMessage(message);
    setAlertSeverity(severity);
    setShowAlert(true);
    
    setTimeout(() => {
      setShowAlert(false);
    }, 5000); // La alerta se ocultará después de 5 segundos
  };

  // Función para obtener los roles de Moodle del usuario
  const fetchUserRole = async (username) => {
    try {
      console.log('📚 Obteniendo roles de Moodle para:', username);
      const response = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/moodle/user-role/${username}`);
      
      if (response.data && response.data.success) {
        return response.data.data;
      } else {
        console.warn('⚠️ No se pudieron obtener los roles de Moodle:', response.data);
        return null;
      }
    } catch (error) {
      console.error('❌ Error al obtener roles de Moodle:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Limpiar errores anteriores
    setError('');
    
    // Validación básica según el tipo de login
    if (loginType === 0 && !username) {
      setError('Por favor ingresa tu nombre de usuario');
      return;
    }
    
    if (loginType === 1 && !email) {
      setError('Por favor ingresa tu correo electrónico');
      return;
    }
    
    if (!password) {
      setError('Por favor ingresa tu contraseña');
      return;
    }
    
    // Guardar los datos del intento de login para debuggear
    const loginData = loginType === 0 
      ? { username, password } 
      : { email, password };
    
    setLastLoginAttempt({
      ...loginData,
      password: password ? '********' : '' // No mostrar la contraseña real en la UI
    });
    
    try {
      setLoading(true);
      console.log('Intentando inicio de sesión con:', 
        loginType === 0 ? { username } : { email });
      
      // Prueba directa con credenciales admin (solo para desarrollo y pruebas)
      if ((username === 'admin' || email === 'admin@ecaf.com') && password === 'Ecafadmin2024*') {
        console.log('✅ Usando credenciales admin para login local');
        
        // Simular respuesta exitosa
        const userData = {
          id: 1,
          username: 'admin',
          email: 'admin@ecaf.com',
          firstname: 'Administrador',
          lastname: 'ECAF',
          role: 'admin',
          // Añadir información de roles de Moodle para modo admin
          moodleRoles: [{
            roleId: 1,
            roleName: 'admin'
          }]
        };
        
        // Crear token simple
        const tokenData = {
          userId: userData.id,
          username: userData.username,
          timestamp: Date.now(),
          expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
        };
        
        const token = btoa(JSON.stringify(tokenData));
        
        // Guardar token y datos de usuario
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showTemporaryAlert('Inicio de sesión exitoso (modo admin)', 'success');
        
        setTimeout(() => {
          setLoading(false);
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1000);
        
        return;
      }
      
      // Llamar al endpoint de autenticación en Railway
      const response = await axios.post('https://webhook-ecaf-production.up.railway.app/api/login', loginData);
      
      console.log('Respuesta recibida:', response.status, response.data);
      
      if (response.data && response.data.user) {
        // Procesar respuesta exitosa
        const userData = response.data.user;
        
        // Determinar el nombre de usuario para consultar roles
        const userIdentifier = userData.username || email || username;
        
        // Obtener roles de Moodle
        const moodleUserData = await fetchUserRole(userIdentifier);
        
        if (moodleUserData) {
          console.log('✅ Roles de Moodle obtenidos:', moodleUserData.roles);
          // Añadir información de Moodle al objeto de usuario
          userData.moodleRoles = moodleUserData.roles;
          
          // Determinar el rol principal para mostrar
          if (moodleUserData.roles && moodleUserData.roles.length > 0) {
            // Priorizar roles administrativos
            const adminRoles = ['admin', 'administrator', 'manager'];
            const hasAdminRole = moodleUserData.roles.some(role => 
              adminRoles.includes(role.roleName.toLowerCase())
            );
            
            if (hasAdminRole) {
              userData.role = 'Administrador';
            } else {
              // Usar el primer rol disponible o un rol específico
              const teacherRoles = ['teacher', 'editingteacher'];
              const hasTeacherRole = moodleUserData.roles.some(role => 
                teacherRoles.includes(role.roleName.toLowerCase())
              );
              
              if (hasTeacherRole) {
                userData.role = 'Profesor';
              } else if (moodleUserData.roles.some(role => role.roleName.toLowerCase() === 'student')) {
                userData.role = 'Estudiante';
              } else {
                userData.role = moodleUserData.roles[0].roleName;
              }
            }
          }
        } else {
          console.warn('⚠️ No se pudieron obtener roles de Moodle, usando rol predeterminado');
          // Usar rol predeterminado si no se pudo obtener de Moodle
          userData.role = userData.role || 'Usuario';
        }
        
        // Crear token simple con información del usuario
        const tokenData = {
          userId: userData.id,
          username: userIdentifier,
          timestamp: Date.now(),
          expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
        };
        
        const token = btoa(JSON.stringify(tokenData));
        
        // Guardar datos en localStorage
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        showTemporaryAlert('Inicio de sesión exitoso', 'success');
        
        // Llamar a la función de login exitoso después de un breve retraso
        setTimeout(() => {
          if (onLoginSuccess) {
            onLoginSuccess();
          }
        }, 1000);
      } else {
        setError('Error de autenticación: Respuesta incompleta del servidor');
        console.error('Respuesta incompleta:', response.data);
      }
    } catch (error) {
      console.error('Error de login:', error);
      
      if (error.response) {
        // Respuesta del servidor con error
        if (error.response.status === 401) {
          setError('Usuario o contraseña incorrectos');
        } else {
          setError(error.response.data.error || 'Error de autenticación');
        }
        console.error('Error del servidor:', error.response.data);
      } else if (error.request) {
        // No se recibió respuesta
        setError('No se pudo contactar con el servidor. Verifica tu conexión.');
        console.error('No se recibió respuesta:', error.request);
      } else {
        // Error en la configuración
        setError('Error al procesar la solicitud: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 2
      }}
    >
      <Paper
        elevation={3}
        component="form"
        onSubmit={handleSubmit}
        sx={{
          p: 4,
          borderRadius: '8px',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        }}
      >
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexDirection: 'column',
            mb: 2
          }}
        >
          <MessageIcon 
            sx={{ 
              color: '#CE0A0A', 
              fontSize: 40, 
              mb: 1 
            }} 
          />
          <Typography 
            variant="h5" 
            component="h1" 
            align="center"
            sx={{ 
              fontWeight: 500, 
              color: '#333'
            }}
          >
            Iniciar Sesión
          </Typography>
        </Box>

        <Tabs 
          value={loginType} 
          onChange={handleTabChange} 
          variant="fullWidth"
          sx={{ 
            mb: 3,
            '& .MuiTabs-indicator': {
              backgroundColor: '#CE0A0A'
            },
            '& .Mui-selected': {
              color: '#CE0A0A !important'
            }
          }}
        >
          <Tab 
            label="Usuario" 
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          />
          <Tab 
            label="Correo Electrónico" 
            sx={{
              textTransform: 'none',
              fontWeight: 500
            }}
          />
        </Tabs>

        <Collapse in={showAlert}>
          <Alert 
            severity={alertSeverity}
            sx={{ mb: 2 }}
          >
            {alertMessage}
          </Alert>
        </Collapse>
        
        {error && (
          <Typography 
            color="error" 
            variant="body2" 
            align="center" 
            sx={{ mb: 2 }}
          >
            {error}
          </Typography>
        )}

        {/* Mostrar campo de usuario o email según la pestaña seleccionada */}
        {loginType === 0 ? (
          <TextField
            label="Nombre de Usuario"
            variant="outlined"
            margin="normal"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: '#CE0A0A' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(206, 10, 10, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#CE0A0A',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#CE0A0A',
                }
              }
            }}
          />
        ) : (
          <TextField
            label="Correo Electrónico"
            variant="outlined"
            margin="normal"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: '#CE0A0A' }} />
                </InputAdornment>
              ),
              sx: {
                borderRadius: '8px',
                '& fieldset': {
                  borderColor: 'rgba(206, 10, 10, 0.3)',
                },
                '&:hover fieldset': {
                  borderColor: '#CE0A0A',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#CE0A0A',
                }
              }
            }}
          />
        )}
        
        <TextField
          label="Contraseña"
          variant="outlined"
          margin="normal"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LockOutlinedIcon sx={{ color: '#CE0A0A' }} />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={handleClickShowPassword}
                  edge="end"
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
            sx: {
              borderRadius: '8px',
              '& fieldset': {
                borderColor: 'rgba(206, 10, 10, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: '#CE0A0A',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#CE0A0A',
              }
            }
          }}
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          fullWidth
          disabled={loading}
          sx={{ 
            mt: 3,
            mb: 2,
            backgroundColor: '#CE0A0A',
            borderRadius: '8px',
            padding: '10px 0',
            '&:hover': {
              backgroundColor: '#9B0A0A',
            },
            textTransform: 'none',
            fontWeight: 500
          }}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            'Iniciar Sesión'
          )}
        </Button>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          align="center"
          sx={{ mt: 1 }}
        >
          © {new Date().getFullYear()} ECAF - Todos los derechos reservados
        </Typography>
      </Paper>
    </Box>
  );
};

export default Login;