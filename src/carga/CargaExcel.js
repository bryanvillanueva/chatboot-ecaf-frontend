import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Card, 
  CardContent, 
  Typography,
  Tabs,
  Tab,
  Fade,
  Alert,
  LinearProgress,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  WorkspacePremium as WorkspacePremiumIcon,
  HelpOutline as HelpIcon,
  FileDownload as FileDownloadIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import EstudiantesUploader from './EstudiantesUploader';
import NotasUploader from './NotasUploader';
import DiplomasUploader from './DiplomasUploader';
import Navbar from '../components/Navbar';

const CargaExcel = ({ pageTitle }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setResult(null); // Limpiar resultados al cambiar tab
  };

  // Información simplificada de las pestañas
  const tabsInfo = [
    {
      id: 0,
      label: 'Estudiantes',
      icon: <SchoolIcon />,
      description: 'Cargar información personal de estudiantes',
      fields: ['Documento', 'Nombres', 'Apellidos', 'Email'],
      templateUrl: 'https://ecafescuela.com/plantilla_excel/Plantilla_Estudiantes.xlsx',
      color: '#2196F3'
    },
    {
      id: 1,
      label: 'Programas y Notas',
      icon: <MenuBookIcon />,
      description: 'Cargar programas académicos, módulos y calificaciones',
      fields: ['Estudiante', 'Programa', 'Módulo', 'Asignatura', 'Nota'],
      templateUrl: 'https://ecafescuela.com/plantilla_excel/Plantilla_Programas.xlsx',
      color: '#FF9800'
    },
    {
      id: 2,
      label: 'Diplomas',
      icon: <WorkspacePremiumIcon />,
      description: 'Cargar registro y gestión de diplomas académicos',
      fields: ['ID', 'Graduado', 'Tipo Diploma', 'Modalidad', 'Fecha Grado'],
      templateUrl: 'https://ecafescuela.com/plantilla_excel/Plantilla_Diplomas.xlsx',
      color: '#9C27B0'
    }
  ];

  const currentTab = tabsInfo[activeTab];

  // Renderizar resultado con estilo moderno
  const renderResult = () => {
    if (!result) return null;

    return (
      <Fade in={true}>
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          onClose={() => setResult(null)}
          icon={result.success ? <CheckCircleIcon /> : <WarningIcon />}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {result.success ? '¡Perfecto!' : 'Algo salió mal'}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            {result.message}
          </Typography>
          {result.details && (
            <Typography variant="caption" display="block" sx={{ mt: 1, opacity: 0.8 }}>
              {result.details}
            </Typography>
          )}
        </Alert>
      </Fade>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Navbar pageTitle={pageTitle || "Carga de Datos"} />
      
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header moderno y limpio */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight={700}
            sx={{ 
              background: 'linear-gradient(45deg, #CE0A0A 30%, #FF6B6B 90%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            Importar Datos
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Carga información académica de forma rápida y sencilla
          </Typography>
        </Box>

        {/* Tabs modernos */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                minHeight: 80,
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: currentTab.color,
                  fontWeight: 600
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: currentTab.color,
                height: 3
              }
            }}
          >
            {tabsInfo.map((tab) => (
              <Tab
                key={tab.id}
                icon={tab.icon}
                label={tab.label}
                iconPosition="start"
                sx={{
                  '& .MuiSvgIcon-root': {
                    color: activeTab === tab.id ? tab.color : 'text.secondary'
                  }
                }}
              />
            ))}
          </Tabs>
        </Card>

        {/* Información contextual de la pestaña activa */}
        <Fade in={true} key={activeTab}>
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid', 
              borderColor: 'divider',
              borderLeftColor: currentTab.color,
              borderLeftWidth: 4,
              mb: 3 
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    bgcolor: `${currentTab.color}15`,
                    color: currentTab.color 
                  }}
                >
                  {currentTab.icon}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {currentTab.description}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={1} flexWrap="wrap">
                    {currentTab.fields.map((field, index) => (
                      <Chip 
                        key={index}
                        label={field} 
                        size="small" 
                        variant="outlined"
                        sx={{ 
                          borderColor: currentTab.color + '40',
                          color: currentTab.color,
                          fontSize: '0.75rem'
                        }}
                      />
                    ))}
                  </Stack>
                </Box>
                <Box>
                  <Tooltip title="Descargar plantilla Excel">
                    <Button
                      variant="outlined"
                      startIcon={<FileDownloadIcon />}
                      href={currentTab.templateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        borderColor: currentTab.color,
                        color: currentTab.color,
                        '&:hover': {
                          borderColor: currentTab.color,
                          bgcolor: currentTab.color + '08'
                        }
                      }}
                    >
                      Plantilla
                    </Button>
                  </Tooltip>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Área principal de contenido */}
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          {loading && (
            <LinearProgress 
              sx={{ 
                height: 3,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: currentTab.color
                }
              }} 
            />
          )}

          <CardContent sx={{ p: 0 }}>
            {/* Mostrar resultado si existe */}
            {result && (
              <Box sx={{ p: 3, pb: 0 }}>
                {renderResult()}
              </Box>
            )}

            {/* Contenido de la pestaña */}
            <Box sx={{ p: 3 }}>
              <Fade in={true} timeout={300} key={activeTab}>
                <Box>
                  {activeTab === 0 ? (
                    <EstudiantesUploader 
                      setLoading={setLoading} 
                      setResult={setResult} 
                    />
                  ) : activeTab === 1 ? (
                    <NotasUploader 
                      setLoading={setLoading} 
                      setResult={setResult} 
                    />
                  ) : (
                    <DiplomasUploader 
                      setLoading={setLoading} 
                      setResult={setResult} 
                    />
                  )}
                </Box>
              </Fade>
            </Box>
          </CardContent>
        </Card>

        {/* Tips rápidos - Información mínima y útil */}
        <Card 
          elevation={0} 
          sx={{ 
            mt: 3, 
            bgcolor: 'primary.main', 
            color: 'white',
            background: 'linear-gradient(135deg, #CE0A0A 0%, #FF6B6B 100%)'
          }}
        >
          <CardContent>
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={2} 
              alignItems="center"
            >
              <InfoIcon sx={{ fontSize: 28 }} />
              <Box flex={1}>
                <Typography variant="subtitle1" fontWeight={600}>
                  ¿Primera vez usando el sistema?
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Descarga la plantilla, complétala con tus datos y súbela aquí. ¡Es así de simple!
                </Typography>
              </Box>
              <Button
                variant="contained"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(10px)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.3)'
                  }
                }}
                startIcon={<HelpIcon />}
              >
                Ver Ayuda
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default CargaExcel;