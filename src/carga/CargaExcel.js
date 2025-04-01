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
  Grid,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  InsertDriveFile as InsertDriveFileIcon, 
  CheckCircle as CheckCircleIcon, 
  Warning as WarningIcon,
  Backup as BackupIcon,
  Description as DescriptionIcon,
  School as SchoolIcon,
  MenuBook as MenuBookIcon,
  HelpOutline as HelpIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import EstudiantesUploader from './EstudiantesUploader';
import NotasUploader from './NotasUploader';
import Navbar from '../components/Navbar';
import './CargaExcel.css';

const CargaExcel = ({ pageTitle }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenHelp = () => {
    setHelpOpen(true);
  };

  const handleCloseHelp = () => {
    setHelpOpen(false);
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
              elevation={4} 
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(206, 10, 10, 0.12)',
                border: '1px solid rgba(206, 10, 10, 0.08)'
              }}
            >
              <CardHeader 
                sx={{ 
                  background: 'linear-gradient(45deg, #CE0A0A 30%, #ed403d 90%)', 
                  color: 'white',
                  position: 'relative'
                }}
                title={
                  <Box sx={{ position: 'relative' }}>
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
                            color: 'white',
                            fontWeight: 'bold'
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
                    <IconButton 
                      sx={{ 
                        position: 'absolute', 
                        right: -12, 
                        top: '50%', 
                        transform: 'translateY(-50%)',
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        }
                      }}
                      onClick={handleOpenHelp}
                      aria-label="Ayuda"
                      size="small"
                    >
                      <HelpIcon fontSize="small" />
                    </IconButton>
                  </Box>
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
                borderRadius: 3,
                background: 'linear-gradient(to right bottom, #ffffff, #f9f9f9)',
                border: '1px solid #f0f0f0',
                opacity: 0,
                animation: 'fadeIn 0.8s forwards',
                animationDelay: '0.3s'
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
                  <Card elevation={2} sx={{ 
                    height: '100%', 
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
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
                  <Card elevation={2} sx={{ 
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}>
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
                  backgroundColor: 'rgba(206, 10, 10, 0.06)', 
                  color: 'primary.main',
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid rgba(206, 10, 10, 0.2)'
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

      {/* Diálogo de ayuda con pasos */}
      <Dialog 
        open={helpOpen} 
        onClose={handleCloseHelp}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: theme.palette.primary.main, 
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <HelpIcon sx={{ mr: 1 }} />
            Guía de Carga de Datos
          </Box>
          <IconButton onClick={handleCloseHelp} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 4 }}>
          <Stepper orientation="vertical" sx={{ mt: 2 }}>
            <Step active completed={false}>
              <StepLabel StepIconProps={{ 
                sx: { color: theme.palette.primary.main }
              }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Paso 1: Descarga la plantilla correcta
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  Descarga la plantilla adecuada según el tipo de información que deseas cargar:
                </Typography>
                <ul>
                  <li><Typography variant="body2">Estudiantes: información básica de los estudiantes</Typography></li>
                  <li><Typography variant="body2">Programas y Notas: información académica</Typography></li>
                </ul>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(33, 150, 243, 0.08)', 
                  borderRadius: 1,
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}>
                  <Typography variant="body2">
                    <strong>Para estudiantes, necesitarás:</strong> tipo_documento, numero_documento, nombres, apellidos, email
                  </Typography>
                </Box>
                <Box sx={{ 
                  mt: 2, 
                  p: 2, 
                  backgroundColor: 'rgba(33, 150, 243, 0.08)', 
                  borderRadius: 1,
                  border: '1px solid rgba(33, 150, 243, 0.2)'
                }}>
                  <Typography variant="body2">
                    <strong>Para notas, necesitarás:</strong> tipo_documento, numero_documento, nombre_programa, tipo_programa, estado_programa, materia, nota, periodo
                  </Typography>
                </Box>
              </StepContent>
            </Step>
            
            <Step active completed={false}>
              <StepLabel StepIconProps={{ 
                sx: { color: theme.palette.primary.main }
              }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Paso 2: Completa la información en la plantilla
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  Llena todos los campos requeridos en la plantilla Excel descargada:
                </Typography>
                <ul>
                  <li><Typography variant="body2">No cambies el nombre de las columnas</Typography></li>
                  <li><Typography variant="body2">Mantén los formatos de datos correctos</Typography></li>
                  <li><Typography variant="body2">Asegúrate de que todos los campos requeridos estén completos</Typography></li>
                </ul>
                <Typography variant="body2" paragraph sx={{ color: 'error.main', mt: 1 }}>
                  Los tipos de documento válidos son: CC, TI, CE, PA (Cédula, Tarjeta, Extranjería, Pasaporte)
                </Typography>
              </StepContent>
            </Step>
            
            <Step active completed={false}>
              <StepLabel StepIconProps={{ 
                sx: { color: theme.palette.primary.main }
              }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Paso 3: Sube el archivo
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  Arrastra el archivo Excel a la zona indicada o haz clic para seleccionarlo del explorador de archivos.
                </Typography>
                <Typography variant="body2" paragraph>
                  Una vez subido, verás el nombre del archivo confirmando que está listo para procesar.
                </Typography>
              </StepContent>
            </Step>
            
            <Step active completed={false}>
              <StepLabel StepIconProps={{ 
                sx: { color: theme.palette.primary.main }
              }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Paso 4: Procesa la información
                </Typography>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" paragraph>
                  Haz clic en el botón "Procesar" para iniciar la carga de datos.
                </Typography>
                <Typography variant="body2" paragraph>
                  Se mostrará una barra de progreso mientras se procesa la información.
                </Typography>
                <Typography variant="body2" paragraph>
                  Al finalizar, verás un mensaje de éxito o error con los detalles del proceso.
                </Typography>
              </StepContent>
            </Step>
          </Stepper>
          
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CargaExcel;
