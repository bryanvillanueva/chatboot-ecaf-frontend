import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
  Tabs, 
  Tab, 
  Alert, 
  AlertTitle, 
  LinearProgress, 
  Typography,
  Paper,
  Fade,
  Zoom,
  Grid
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  InsertDriveFile as InsertDriveFileIcon, 
  CheckCircle as CheckCircleIcon, 
  Warning as WarningIcon,
  Backup as BackupIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import EstudiantesUploader from './EstudiantesUploader';
import NotasUploader from './NotasUploader';
import Navbar from '../components/Navbar';
import './CargaExcel.css';

const CargaExcel = ({ pageTitle }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Función para mostrar la notificación de resultado
  const renderResult = () => {
    if (!result) return null;

    return (
      <Zoom in={true}>
        <Alert 
          severity={result.success ? 'success' : 'error'} 
          className="result-alert"
          onClose={() => setResult(null)} 
          sx={{ 
            mt: 2, 
            mb: 2,
            boxShadow: 3,
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              backgroundColor: result.success ? 'success.main' : 'error.main'
            }
          }}
          icon={result.success ? <CheckCircleIcon fontSize="inherit" /> : <WarningIcon fontSize="inherit" />}
        >
          <AlertTitle sx={{ fontWeight: 'bold' }}>
            {result.success ? 'Operación Exitosa' : 'Error'}
          </AlertTitle>
          <Typography>{result.message}</Typography>
          {result.details && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {result.details}
            </Typography>
          )}
        </Alert>
      </Zoom>
    );
  };

  return (
    <Box>
      <Navbar pageTitle={pageTitle || "Carga de Información"} />
      
      <Box sx={{ pt: 8, px: 2 }}>
        <Box className="page-header" sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom className="page-title">
            Carga de Información Académica
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
            Este módulo permite importar información académica a la base de datos utilizando archivos Excel.
          </Typography>
        </Box>
        
        <Fade in={true}>
          <Box>          
            {renderResult()}
            
            <Card 
              elevation={3} 
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: theme => `0 6px 16px ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'}`
              }}
            >
              <CardHeader 
                sx={{ backgroundColor: theme => theme.palette.primary.main, color: 'white' }}
                title={
                  <Tabs 
                    value={activeTab} 
                    onChange={handleTabChange} 
                    indicatorColor="secondary"
                    textColor="inherit"
                    variant="fullWidth"
                    sx={{
                      '& .MuiTab-root': {
                        color: 'rgba(255, 255, 255, 0.7)',
                        '&.Mui-selected': {
                          color: 'white'
                        }
                      }
                    }}
                  >
                    <Tab 
                      icon={<SchoolIcon />} 
                      label="Información de Estudiantes" 
                      iconPosition="start"
                    />
                    <Tab 
                      icon={<MenuBookIcon />} 
                      label="Programas, Materias y Notas" 
                      iconPosition="start"
                    />
                  </Tabs>
                }
              />
              <CardContent sx={{ p: 0 }}>
                {loading && (
                  <Box sx={{ width: '100%' }}>
                    <LinearProgress 
                      sx={{ 
                        height: 6, 
                        '& .MuiLinearProgress-bar': {
                          transition: 'transform 0.4s linear'
                        }
                      }} 
                    />
                    <Typography align="center" sx={{ mt: 1, mb: 2, fontWeight: 'medium' }}>
                      Procesando archivo... Por favor espere.
                    </Typography>
                  </Box>
                )}

                <Box sx={{ p: 3 }}>
                  {activeTab === 0 ? (
                    <Fade in={activeTab === 0} timeout={500}>
                      <Box>
                        <EstudiantesUploader 
                          setLoading={setLoading} 
                          setResult={setResult} 
                        />
                      </Box>
                    </Fade>
                  ) : (
                    <Fade in={activeTab === 1} timeout={500}>
                      <Box>
                        <NotasUploader 
                          setLoading={setLoading} 
                          setResult={setResult} 
                        />
                      </Box>
                    </Fade>
                  )}
                </Box>
              </CardContent>
            </Card>

            <Paper 
              elevation={3} 
              sx={{ 
                mt: 4, 
                p: 3,
                borderRadius: 2,
                background: 'linear-gradient(to right bottom, #ffffff, #f9f9f9)',
                border: '1px solid #f0f0f0'
              }} 
              className="info-section"
            >
              <Typography variant="h6" gutterBottom sx={{ 
                display: 'flex', 
                alignItems: 'center',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}>
                <InsertDriveFileIcon sx={{ mr: 1 }} color="primary" />
                Información sobre la Carga de Datos
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 2 }}>
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: '100%' }}>
                    <CardHeader
                      title="Información de Estudiantes"
                      avatar={<SchoolIcon color="primary" />}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Utilice este módulo para cargar datos personales de los estudiantes:
                      </Typography>
                      <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                        <li>Información básica (nombres, apellidos)</li>
                        <li>Documentos de identidad</li>
                        <li>Información de contacto</li>
                        <li>Datos demográficos</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Card elevation={2} sx={{ height: '100%' }}>
                    <CardHeader
                      title="Programas, Materias y Notas"
                      avatar={<MenuBookIcon color="primary" />}
                      sx={{ pb: 0 }}
                    />
                    <CardContent>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Utilice este módulo para cargar:
                      </Typography>
                      <ul style={{ paddingLeft: '20px', marginTop: 0 }}>
                        <li>Programas académicos</li>
                        <li>Materias asociadas a programas</li>
                        <li>Notas de estudiantes en materias</li>
                        <li>Información académica periódica</li>
                      </ul>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Box 
                sx={{ 
                  mt: 3, 
                  p: 2, 
                  backgroundColor: 'info.light', 
                  color: 'info.contrastText',
                  borderRadius: 1,
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <CloudUploadIcon sx={{ mr: 2 }} />
                <Typography variant="body2">
                  <strong>¿Necesitas las plantillas?</strong> Puedes descargar las plantillas de Excel desde la sección de cada tipo de carga.
                </Typography>
              </Box>
            </Paper>
          </Box>
        </Fade>
      </Box>
    </Box>
  );
};

export default CargaExcel;
