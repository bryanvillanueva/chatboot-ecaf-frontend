import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  CircularProgress,
  Tabs,
  Tab,
  Paper,
  Chip,
  Divider,
  Button,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import axios from 'axios';
import {
  Line,
  Bar,
  Pie,
  Doughnut
} from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  Filler
} from 'chart.js';
import Navbar from '../components/Navbar';

// Iconos
import AssignmentIcon from '@mui/icons-material/Assignment';
import MessageIcon from '@mui/icons-material/Message';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CachedIcon from '@mui/icons-material/Cached';
import PersonIcon from '@mui/icons-material/Person';
import SendIcon from '@mui/icons-material/Send';
import MarkUnreadChatAltIcon from '@mui/icons-material/MarkUnreadChatAlt';
import ErrorIcon from '@mui/icons-material/Error';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import PendingIcon from '@mui/icons-material/Pending';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  Filler
);

// Constantes para caché
const MENSAJE_CACHE_KEY = 'dashboardData';
const CERTIFICADO_CACHE_KEY = 'certificadosDashboardData';
const CACHE_EXPIRATION = 5 * 60 * 1000; // 5 minutos

// Colores para estados de certificados
const ESTADO_COLORS = {
  'pendiente': '#FF9800',
  'en_proceso': '#2196F3',
  'completado': '#4CAF50',
  'fallido': '#F44336',
  'otro': '#9E9E9E'
};

const getStatusColor = (status) => {
  // Normalizar el estado
  let estadoNormalizado = status ? status.toLowerCase() : '';
  
  // Mapear los diferentes estados a categorías normalizadas
  if(['pendiente', 'pending', 'en espera', 'waiting', 'pendiente de pago', 'on-hold'].includes(estadoNormalizado)) {
    estadoNormalizado = 'pendiente';
  } else if(['procesando', 'processing'].includes(estadoNormalizado)) {
    estadoNormalizado = 'en_proceso';
  } else if(['completado', 'completed'].includes(estadoNormalizado)) {
    estadoNormalizado = 'completado';
  } else if(['fallido', 'failed', 'cancelado', 'cancelled'].includes(estadoNormalizado)) {
    estadoNormalizado = 'fallido';
  } else {
    estadoNormalizado = 'otro';
  }
  
  return ESTADO_COLORS[estadoNormalizado] || ESTADO_COLORS.otro;
};

// Normalizar el texto del estado para mostrar
const getNormalizedStatusText = (status) => {
  let estadoNormalizado = status ? status.toLowerCase() : '';
  
  if(['pendiente', 'pending', 'en espera', 'waiting', 'pendiente de pago', 'on-hold'].includes(estadoNormalizado)) {
    return 'Pendiente';
  } else if(['procesando', 'processing'].includes(estadoNormalizado)) {
    return 'En Proceso';
  } else if(['completado', 'completed'].includes(estadoNormalizado)) {
    return 'Completado';
  } else if(['fallido', 'failed', 'cancelado', 'cancelled'].includes(estadoNormalizado)) {
    return 'Fallido';
  } else {
    return status || 'Desconocido';
  }
};

// Función para formatear valores monetarios
const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(value);
};

const Dashboard = ({ pageTitle }) => {
  const theme = useTheme();
  
  // Estados para almacenar datos
  const [mensajesData, setMensajesData] = useState(null);
  const [certificadosData, setCertificadosData] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  
  // Función para cargar datos de mensajes
  const fetchMensajesData = async (force = false) => {
    try {
      // Verificar caché si no es una actualización forzada
      if (!force) {
        const cached = localStorage.getItem(MENSAJE_CACHE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (Date.now() - parsedCache.timestamp < CACHE_EXPIRATION) {
            setMensajesData(parsedCache.data);
            return parsedCache.data;
          }
        }
      }
      
      // Cargar datos frescos
      const response = await axios.get('https://webhook-ecaf-production.up.railway.app/api/dashboard-info');
      const data = response.data;
      
      // Guardar en el estado y en caché
      setMensajesData(data);
      localStorage.setItem(MENSAJE_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      return data;
      
    } catch (err) {
      console.error('Error fetching mensajes dashboard info:', err);
      setError('No se pudo cargar la información de mensajes. Por favor, intenta de nuevo más tarde.');
      return null;
    }
  };
  
  // Función para cargar datos de certificados
  const fetchCertificadosData = async (force = false) => {
    try {
      // Verificar caché si no es una actualización forzada
      if (!force) {
        const cached = localStorage.getItem(CERTIFICADO_CACHE_KEY);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (Date.now() - parsedCache.timestamp < CACHE_EXPIRATION) {
            setCertificadosData(parsedCache.data);
            return parsedCache.data;
          }
        }
      }
      
      // Cargar datos frescos
      const response = await axios.get('https://webhook-ecaf-production.up.railway.app/api/dashboard-certificados');
      const data = response.data;
      
      // Guardar en el estado y en caché
      setCertificadosData(data);
      localStorage.setItem(CERTIFICADO_CACHE_KEY, JSON.stringify({ timestamp: Date.now(), data }));
      return data;
      
    } catch (err) {
      console.error('Error fetching certificados dashboard info:', err);
      
      // Manejo especial del error relacionado con updated_at
      if(err.response && err.response.data && err.response.data.details && 
         err.response.data.details.includes('updated_at')) {
        setError('No se pudo calcular algunas métricas de certificados. El administrador debe actualizar la estructura de la base de datos.');
      } else {
        setError('No se pudo cargar la información de certificados. Por favor, intenta de nuevo más tarde.');
      }
      
      return null;
    }
  };
  
  // Cargar todos los datos al inicio
  const loadAllData = async (force = false) => {
    setLoading(true);
    setRefreshing(force);
    try {
      await Promise.all([
        fetchMensajesData(force),
        fetchCertificadosData(force)
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Cargar datos al montar el componente
  useEffect(() => {
    loadAllData();
  }, []);
  
  // Manejar el cambio de pestaña
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Manejar la actualización de datos
  const handleRefresh = () => {
    loadAllData(true);
  };
  
  // Mostrar indicador de carga si no hay datos
  if (loading && (!mensajesData && !certificadosData)) {
    return (
      <Box>
        <Navbar pageTitle={pageTitle || "Dashboard"} />
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <Card sx={{ minWidth: 300, textAlign: 'center', padding: 4 }}>
            <CircularProgress color="primary" size={60} thickness={4} />
            <Typography variant="h6" sx={{ mt: 2 }}>
              Cargando información del dashboard...
            </Typography>
          </Card>
        </Box>
      </Box>
    );
  }
  
  // Mostrar mensaje de error si hay algún problema
  if (error && (!mensajesData && !certificadosData)) {
    return (
      <Box>
        <Navbar pageTitle={pageTitle || "Dashboard"} />
        <Box p={3} sx={{ marginTop: '10px' }}>
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#ffebee' }}>
            <Typography variant="h6" color="error">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleRefresh}
              startIcon={<CachedIcon />}
              sx={{ mt: 2 }}
            >
              Reintentar
            </Button>
          </Paper>
        </Box>
      </Box>
    );
  }
  
  // Procesar datos de mensajes
  const total_mensajes = mensajesData?.total_mensajes || 0;
  const mensajes_Ecaf = mensajesData?.mensajes_Ecaf || 0;
  const total_usuarios = mensajesData?.total_usuarios || 0;
  const mensajes_pendientes = mensajesData?.mensajes_pendientes || 0;
  const timeline = mensajesData?.timeline || [];
  
  const mensajesEnviados = mensajes_Ecaf;
  const mensajesRecibidos = total_mensajes - mensajes_Ecaf;
  
  // Procesar datos de certificados
  const totalCertificados = certificadosData?.totalCertificados?.total || 0;
  
  // Certificados por estado
  const certificadosPorEstado = certificadosData?.certificadosPorEstado || [];
  const pendientes = certificadosPorEstado.find(item => item.estado_normalizado === 'pendiente')?.cantidad || 0;
  const enProceso = certificadosPorEstado.find(item => item.estado_normalizado === 'en_proceso')?.cantidad || 0;
  const completados = certificadosPorEstado.find(item => item.estado_normalizado === 'completado')?.cantidad || 0;
  const fallidos = certificadosPorEstado.find(item => item.estado_normalizado === 'fallido')?.cantidad || 0;
  
  // Información financiera (usando los nuevos campos del backend)
  const resumenFinanciero = certificadosData?.resumenFinanciero || {};
  const gananciasRealizadas = resumenFinanciero.total_ingresos_realizados || 0;
  const gananciasEsperadas = resumenFinanciero.total_ingresos_esperados || 0;
  const gananciasPerdidas = resumenFinanciero.total_ingresos_perdidos || 0;
  const totalGanancias = gananciasRealizadas + gananciasEsperadas;
  const certificadosCompletadosTotal = resumenFinanciero.certificados_completados || 0;
  const ingresoPromedioPorCertificado = resumenFinanciero.valor_promedio_certificado || 0;
  
  // Ingresos por tipo (para el gráfico de barras)
  const ingresosPorTipo = certificadosData?.ingresosPorTipo || [];
  const ingresosPorTipoData = {
    labels: ingresosPorTipo.map(item => item.tipo_certificado),
    datasets: [
      {
        label: 'Ingresos realizados por tipo de certificado',
        data: ingresosPorTipo.map(item => item.ingresos_realizados),
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',   // Azul
          'rgba(75, 192, 192, 0.7)',    // Turquesa
          'rgba(255, 159, 64, 0.7)',    // Naranja
          'rgba(153, 102, 255, 0.7)'    // Morado
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
          'rgba(153, 102, 255, 1)'
        ],
        borderWidth: 1,
      }
    ]
  };
  
  // Porcentaje de completados
  const porcentajeCompletados = totalCertificados > 0 
    ? ((completados / totalCertificados) * 100).toFixed(1) 
    : 0;
  
  // Datos para gráficos de certificados
  const estadoLabels = certificadosPorEstado.map(item => {
    if (item.estado_normalizado === 'pendiente') return 'Pendiente';
    if (item.estado_normalizado === 'en_proceso') return 'En Proceso';
    if (item.estado_normalizado === 'completado') return 'Completado';
    if (item.estado_normalizado === 'fallido') return 'Fallido';
    return item.estado_normalizado || 'Desconocido';
  });
  const estadoCounts = certificadosPorEstado.map(item => item.cantidad);
  const estadoColors = certificadosPorEstado.map(item => getStatusColor(item.estado_normalizado));
  
  // Datos para el timeline de mensajes
  const chartData = {
    labels: timeline.map(item => item.date),
    datasets: [
      {
        label: 'Mensajes recibidos',
        data: timeline.map(item => item.count),
        borderColor: '#ed403d',
        backgroundColor: '#ed403dad',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Datos para el timeline de certificados
  const timelineCertificados = certificadosData?.timelineCertificados || [];
  const certificadosLineData = {
    labels: timelineCertificados.map(item => item.fecha),
    datasets: [
      {
        label: 'Certificados creados',
        data: timelineCertificados.map(item => item.cantidad),
        borderColor: '#2196F3',
        backgroundColor: '#2196F333',
        tension: 0.4,
        fill: true,
      },
    ],
  };
  
  // Corregir datos para gráfico circular de certificados por tipo
  const certificadosPorTipo = certificadosData?.certificadosPorTipo || [];
  const tipoLabels = certificadosPorTipo.map(item => item.tipo_certificado || 'Desconocido');
  const tipoCounts = certificadosPorTipo.map(item => item.cantidad);

  const pieDataTipo = {
    labels: tipoLabels,
    datasets: [
      {
        data: tipoCounts,
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
          'rgba(153, 102, 255, 0.7)'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Datos para gráfico circular de certificados por estado
  const pieDataEstado = {
    labels: estadoLabels,
    datasets: [
      {
        data: estadoCounts,
        backgroundColor: estadoColors,
        borderWidth: 1,
      },
    ],
  };
  
  // Datos para gráfico de distribución de ingresos por estado
  const ingresosPorEstadoData = {
    labels: ['Realizados', 'Esperados', 'No Realizados'],
    datasets: [
      {
        data: [gananciasRealizadas, gananciasEsperadas, gananciasPerdidas],
        backgroundColor: [
          'rgba(76, 175, 80, 0.7)',
          'rgba(33, 150, 243, 0.7)',
          'rgba(244, 67, 54, 0.7)'
        ],
        borderWidth: 1,
      }
    ]
  };
  
  // Opciones para gráficos circulares
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          boxWidth: 12,
          padding: 15
        }
      }
    }
  };

  // Tarjetas de estadísticas (combinadas)
  const mensajesCards = [
    { 
      label: 'Mensajes Enviados',
      value: mensajesEnviados,
      icon: <SendIcon fontSize="large" />,
      color: theme.palette.primary.main,
      bgColor: `${theme.palette.primary.main}15`
    },
    { 
      label: 'Mensajes Recibidos',
      value: mensajesRecibidos,
      icon: <MarkUnreadChatAltIcon fontSize="large" />,
      color: '#ed403d',
      bgColor: '#ed403d15'
    },
    { 
      label: 'Mensajes Pendientes',
      value: mensajes_pendientes,
      icon: <PendingActionsIcon fontSize="large" />,
      color: '#FF9800',
      bgColor: '#FF980015'
    },
    { 
      label: 'Usuarios Activos',
      value: total_usuarios,
      icon: <PersonIcon fontSize="large" />,
      color: '#4CAF50',
      bgColor: '#4CAF5015'
    }
  ];
  
  const certificadosCards = [
    { 
      label: 'Total Certificados',
      value: totalCertificados,
      icon: <AssignmentIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      bgColor: `${theme.palette.secondary.main}15`
    },
    { 
      label: 'Certificados Completados',
      value: completados,
      subtext: `${porcentajeCompletados}% del total`,
      icon: <AssignmentTurnedInIcon fontSize="large" />,
      color: '#4CAF50',
      bgColor: '#4CAF5015'
    },
    { 
      label: 'Certificados En Proceso',
      value: enProceso,
      icon: <CachedIcon fontSize="large" />,
      color: '#2196F3',
      bgColor: '#2196F315'
    },
    { 
      label: 'Certificados Pendientes',
      value: pendientes,
      icon: <PendingActionsIcon fontSize="large" />,
      color: '#FF9800',
      bgColor: '#FF980015'
    }
  ];
  
  const financierasCards = [
    { 
      label: 'Ingresos Realizados',
      value: formatCurrency(gananciasRealizadas),
      subtext: 'De certificados completados',
      icon: <AttachMoneyIcon fontSize="large" />,
      color: '#4CAF50',
      bgColor: '#4CAF5015'
    },
    { 
      label: 'Ingresos Esperados',
      value: formatCurrency(gananciasEsperadas),
      subtext: 'De certificados pendientes y en proceso',
      icon: <PendingIcon fontSize="large" />,
      color: '#2196F3',
      bgColor: '#2196F315'
    },
    { 
      label: 'Ingresos No Realizados',
      value: formatCurrency(gananciasPerdidas),
      subtext: 'De certificados fallidos o cancelados',
      icon: <MoneyOffIcon fontSize="large" />,
      color: '#F44336',
      bgColor: '#F4433615'
    },
    { 
      label: 'Total de Ingresos Estimados',
      value: formatCurrency(totalGanancias),
      subtext: 'Realizados + Esperados',
      icon: <MonetizationOnIcon fontSize="large" />,
      color: theme.palette.secondary.main,
      bgColor: `${theme.palette.secondary.main}15`
    }
  ];

  return (
    <Box>
      <Navbar pageTitle={pageTitle || "Dashboard"} />
      
      {/* Cabecera con acciones */}
      <Box 
        p={2} 
        mb={1} 
        display="flex" 
        justifyContent="space-between" 
        alignItems="center"
        flexWrap="wrap"
        gap={1}
      >
        <Typography variant="h5" fontWeight="medium" color="primary">
          Panel de Control
        </Typography>
        
        <Tooltip title="Actualizar datos">
          <IconButton 
            onClick={handleRefresh} 
            color="primary" 
            disabled={refreshing}
          >
            <CachedIcon />
          </IconButton>
        </Tooltip>
      </Box>
      
      {/* Indicador de actualización */}
      {refreshing && (
        <LinearProgress 
          sx={{ 
            height: '2px', 
            width: '100%',
            marginBottom: '16px' 
          }} 
        />
      )}
      
      {/* Mensaje de error parcial (si existe) */}
      {error && (mensajesData || certificadosData) && (
        <Box px={2} mb={2}>
          <Paper sx={{ p: 2, backgroundColor: '#fff3e0', display: 'flex', alignItems: 'center' }}>
            <ErrorIcon color="warning" sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.secondary">
              {error}
            </Typography>
          </Paper>
        </Box>
      )}
      
      {/* Sección de Chat */}
      <Box p={2}>
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ 
            pb: 1, 
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MessageIcon sx={{ mr: 1 }} /> Información de Chat
        </Typography>
        
        <Grid container spacing={2}>
          {mensajesCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                      {stat.subtext && (
                        <Typography variant="caption" color="text.secondary">
                          {stat.subtext}
                        </Typography>
                      )}
                    </Box>
                    <Box 
                      sx={{ 
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                        borderRadius: '50%',
                        p: 1
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Sección de Certificados */}
      <Box p={2}>
        <Typography 
          variant="h6" 
          color="secondary" 
          sx={{ 
            pb: 1, 
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <AssignmentIcon sx={{ mr: 1 }} /> Información de Certificados
        </Typography>
        
        <Grid container spacing={2}>
          {certificadosCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stat.value.toLocaleString()}
                      </Typography>
                      {stat.subtext && (
                        <Typography variant="caption" color="text.secondary">
                          {stat.subtext}
                        </Typography>
                      )}
                    </Box>
                    <Box 
                      sx={{ 
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                        borderRadius: '50%',
                        p: 1
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Sección financiera */}
      <Box p={2}>
        <Typography 
          variant="h6" 
          color="secondary" 
          sx={{ 
            pb: 1, 
            mb: 2,
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <MonetizationOnIcon sx={{ mr: 1 }} /> Información Financiera
        </Typography>
        
        <Grid container spacing={2}>
          {financierasCards.map((stat, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card 
                elevation={1}
                sx={{ 
                  height: '100%',
                  position: 'relative',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
              >
                <CardContent>
                  <Box 
                    display="flex" 
                    justifyContent="space-between" 
                    alignItems="flex-start"
                  >
                    <Box>
                      <Typography color="text.secondary" variant="body2">
                        {stat.label}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 'bold', my: 1 }}>
                        {stat.value}
                      </Typography>
                      {stat.subtext && (
                        <Typography variant="caption" color="text.secondary">
                          {stat.subtext}
                        </Typography>
                      )}
                    </Box>
                    <Box 
                      sx={{ 
                        backgroundColor: stat.bgColor,
                        color: stat.color,
                        borderRadius: '50%',
                        p: 1
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      {/* Espacio de separación entre tarjetas y gráficos */}
      <Box mt={5}></Box>
      
      {/* Pestañas para diferentes secciones */}
      <Box p={2}>
        <Paper elevation={1}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab icon={<MessageIcon />} label="Mensajes" />
            <Tab icon={<AssignmentIcon />} label="Certificados" />
            <Tab icon={<AccountBalanceIcon />} label="Financiera" />
          </Tabs>
          
          {/* Contenido de la pestaña Mensajes */}
          {activeTab === 0 && (
            <Box p={2}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Timeline global de mensajes recibidos
                      </Typography>
                      <Box height={300}>
                        <Line 
                          data={chartData} 
                          options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { 
                              legend: { position: 'top' } 
                            } 
                          }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                

                
                <Grid item xs={12} md={12}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Tasa de Respuesta
                      </Typography>
                      <Box textAlign="center" p={3}>
                        <Typography variant="h3" color="primary" fontWeight="bold">
                          {mensajes_pendientes > 0 && total_mensajes > 0
                            ? ((1 - mensajes_pendientes / total_mensajes) * 100).toFixed(1)
                            : '100'}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          de mensajes respondidos
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Contenido de la pestaña Certificados */}
          {activeTab === 1 && (
            <Box p={2}>
              <Grid container spacing={2}>
                {/* Timeline de certificados */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Certificados Creados (Tendencia)
                      </Typography>
                      <Box height={300}>
                        <Line 
                          data={certificadosLineData} 
                          options={{ 
                            responsive: true, 
                            maintainAspectRatio: false,
                            plugins: { 
                              legend: { position: 'top' } 
                            } 
                          }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Gráfico de distribución por tipo */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Distribución por Tipo
                      </Typography>
                      <Box height={300}>
                        <Pie data={pieDataTipo} options={pieOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Gráfico de distribución por estado */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Distribución por Estado
                      </Typography>
                      <Box height={300}>
                        <Doughnut data={pieDataEstado} options={pieOptions} />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Lista de certificados recientes */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Certificados Recientes
                      </Typography>
                      <Divider sx={{ mb: 2 }} />
                      
                      {certificadosData?.certificadosRecientes?.length > 0 ? (
                        <Box>
                          {certificadosData.certificadosRecientes.slice(0, 5).map((cert) => (
                            <Paper
                              key={cert.id}
                              elevation={0}
                              sx={{ 
                                p: 2, 
                                mb: 1,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                '&:hover': {
                                  backgroundColor: 'action.hover'
                                }
                              }}
                            >
                              <Grid container spacing={2} alignItems="center">
                                <Grid item xs={12} sm={6}>
                                  <Typography variant="subtitle1">
                                    {cert.nombre} {cert.apellido}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Ref: {cert.referencia}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    Valor: {formatCurrency(cert.valor)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                  <Typography variant="body2">
                                    {new Date(cert.created_at).toLocaleDateString()}
                                  </Typography>
                                  <Chip 
                                    label={cert.tipo_certificado || 'General'} 
                                    size="small"
                                    sx={{ mt: 0.5 }}
                                  />
                                </Grid>
                                <Grid item xs={6} sm={3} sx={{ textAlign: 'right' }}>
                                  <Chip 
                                    label={getNormalizedStatusText(cert.estado)} 
                                    size="small"
                                    sx={{ 
                                      backgroundColor: getStatusColor(cert.estado),
                                      color: 'white'
                                    }}
                                  />
                                </Grid>
                              </Grid>
                            </Paper>
                          ))}
                        </Box>
                      ) : (
                        <Box textAlign="center" py={4}>
                          <Typography variant="body1" color="text.secondary">
                            No hay certificados recientes para mostrar
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
          
          {/* Nueva pestaña Financiera */}
          {activeTab === 2 && (
            <Box p={2}>
              <Grid container spacing={2}>
                {/* Gráfico de ingresos realizados por tipo de certificado */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Ingresos Realizados por Tipo de Certificado
                      </Typography>
                      <Box height={300}>
                        <Bar 
                          data={ingresosPorTipoData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: { display: false },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return formatCurrency(context.parsed.y);
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                ticks: {
                                  callback: function(value) {
                                    return formatCurrency(value);
                                  }
                                }
                              }
                            }
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                        *Solo muestra ingresos de certificados completados/pagados
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Gráfico de distribución de ingresos por estado */}
                <Grid item xs={12} md={6}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Distribución de Ingresos por Estado
                      </Typography>
                      <Box height={300}>
                        <Doughnut 
                          data={ingresosPorEstadoData} 
                          options={{
                            ...pieOptions,
                            plugins: {
                              ...pieOptions.plugins,
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    const label = context.label || '';
                                    const value = context.raw || 0;
                                    const formattedValue = formatCurrency(value);
                                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return `${label}: ${formattedValue} (${percentage}%)`;
                                  }
                                }
                              }
                            }
                          }} 
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
                
                {/* Indicadores financieros clave */}
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Resumen Financiero
                      </Typography>
                      <Grid container spacing={3} mt={1}>
                        {/* Tasa de eficiencia financiera (Completados/Total) */}
                        <Grid item xs={12} md={4}>
                          <Box textAlign="center">
                            <Typography color="text.secondary" gutterBottom>
                              Eficiencia Financiera
                            </Typography>
                            <Box position="relative" display="inline-flex" mb={1}>
                              <CircularProgress 
                                variant="determinate" 
                                value={totalGanancias > 0 ? (gananciasRealizadas / totalGanancias) * 100 : 0} 
                                size={120}
                                thickness={6}
                                sx={{ color: '#4CAF50' }}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="h5" component="div">
                                  {totalGanancias > 0 ? ((gananciasRealizadas / totalGanancias) * 100).toFixed(0) : 0}%
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Ingresos realizados vs. potenciales
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* Ingreso promedio por certificado completado */}
                        <Grid item xs={12} md={4}>
                          <Box textAlign="center">
                            <Typography color="text.secondary" gutterBottom>
                              Ingreso Promedio por Certificado
                            </Typography>
                            <Typography variant="h4" color="primary" fontWeight="bold">
                              {formatCurrency(ingresoPromedioPorCertificado)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={1}>
                              Basado en {certificadosCompletadosTotal} certificados completados
                            </Typography>
                          </Box>
                        </Grid>
                        
                        {/* Pérdida financiera */}
                        <Grid item xs={12} md={4}>
                          <Box textAlign="center">
                            <Typography color="text.secondary" gutterBottom>
                              Tasa de Pérdida
                            </Typography>
                            <Box position="relative" display="inline-flex" mb={1}>
                              <CircularProgress 
                                variant="determinate" 
                                value={totalGanancias > 0 ? (gananciasPerdidas / (gananciasRealizadas + gananciasEsperadas + gananciasPerdidas)) * 100 : 0} 
                                size={120}
                                thickness={6}
                                sx={{ color: '#F44336' }}
                              />
                              <Box
                                sx={{
                                  top: 0,
                                  left: 0,
                                  bottom: 0,
                                  right: 0,
                                  position: 'absolute',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                              >
                                <Typography variant="h5" component="div">
                                  {totalGanancias > 0 ? ((gananciasPerdidas / (gananciasRealizadas + gananciasEsperadas + gananciasPerdidas)) * 100).toFixed(0) : 0}%
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              Ingresos no realizados por cancelaciones
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default Dashboard;