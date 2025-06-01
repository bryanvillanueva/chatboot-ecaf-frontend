import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Alert, 
  LinearProgress, 
  Typography,
  Container,
  Fade,
  Stack,
  Button
} from '@mui/material';
import { 
  CheckCircle as CheckCircleIcon, 
  Warning as WarningIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

const CargaExcelBase = ({ 
  titulo, 
  subtitulo, 
  descripcion, 
  UploaderComponent,
  gradientColors = ['#CE0A0A', '#FF6B6B'],
  accentColor = '#CE0A0A'
}) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Función para mostrar la notificación de resultado
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
            boxShadow: 2,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Stack spacing={1}>
            <Typography variant="subtitle1" fontWeight={600}>
              {result.success ? '¡Operación exitosa!' : 'Ocurrió un problema'}
            </Typography>
            <Typography variant="body2">
              {result.message}
            </Typography>
            {result.details && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {result.details}
              </Typography>
            )}
          </Stack>
        </Alert>
      </Fade>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa' }}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header moderno */}
        <Box textAlign="center" mb={4}>
          <Typography 
            variant="h3" 
            component="h1" 
            fontWeight={700}
            sx={{ 
              background: `linear-gradient(45deg, ${gradientColors[0]} 30%, ${gradientColors[1]} 90%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              color: 'transparent',
              mb: 1
            }}
          >
            {titulo}
          </Typography>
          {subtitulo && (
            <Typography variant="h6" color="text.secondary" fontWeight={400}>
              {subtitulo}
            </Typography>
          )}
        </Box>

        {/* Tarjeta principal */}
        <Card 
          elevation={2} 
          sx={{ 
            borderRadius: 3, 
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {/* Indicador de carga */}
          {loading && (
            <LinearProgress 
              sx={{ 
                height: 3,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: accentColor
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

            {/* Contenido principal */}
            <Box sx={{ p: 3 }}>
              <UploaderComponent 
                setLoading={setLoading} 
                setResult={setResult} 
              />
            </Box>
          </CardContent>
        </Card>

        {/* Descripción en tarjeta inferior */}
        {descripcion && (
          <Card 
            elevation={0} 
            sx={{ 
              mt: 3, 
              bgcolor: `${accentColor}08`,
              border: '1px solid',
              borderColor: `${accentColor}20`
            }}
          >
            <CardContent>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ textAlign: 'center', lineHeight: 1.6 }}
              >
                {descripcion}
              </Typography>
            </CardContent>
          </Card>
        )}

        {/* Footer con acciones adicionales */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            alignItems="center"
          >
            <Typography variant="body2" color="text.secondary">
              ¿Necesitas ayuda? Consulta la documentación o contacta soporte
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => window.location.reload()}
              sx={{
                borderColor: accentColor,
                color: accentColor,
                '&:hover': {
                  borderColor: accentColor,
                  bgcolor: `${accentColor}08`
                }
              }}
            >
              Recargar página
            </Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default CargaExcelBase;