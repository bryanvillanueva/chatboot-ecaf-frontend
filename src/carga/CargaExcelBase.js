import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  CardHeader, 
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
} from '@mui/icons-material';
import './CargaExcel.css';

const CargaExcelBase = ({ titulo, subtitulo, descripcion, UploaderComponent }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

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
    <Box className="page-header" sx={{ mb: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom className="page-title">
        {titulo}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" sx={{ maxWidth: '700px', mx: 'auto' }}>
        {subtitulo}
      </Typography>
      
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
                <Typography variant="h6" sx={{ color: 'white', fontWeight: 500 }}>
                  {titulo}
                </Typography>
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
                <Fade in={true} timeout={500}>
                  <Box>
                    <UploaderComponent 
                      setLoading={setLoading} 
                      setResult={setResult} 
                    />
                  </Box>
                </Fade>
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
              <Grid item xs={12}>
                <Card elevation={2} sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {descripcion}
                    </Typography>
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
                <strong>¿Necesitas las plantillas?</strong> Puedes descargar las plantillas de Excel utilizando el botón en la sección de carga.
              </Typography>
            </Box>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default CargaExcelBase;