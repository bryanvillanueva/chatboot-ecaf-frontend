import React, { useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Paper,
  Card,
  CardContent,
  LinearProgress,
  IconButton,
  Stack,
  Chip,
  Fade,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
  InsertDriveFile as FileIcon,
  Warning as WarningIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { uploadNotas } from './api';

const NotasUploader = ({ setLoading, setResult }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, ready, uploading, success
  const fileInputRef = useRef(null);
  const theme = useTheme();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    
    if (!validTypes.includes(selectedFile.type)) {
      setResult({
        success: false,
        message: 'Formato no válido',
        details: 'Solo se permiten archivos Excel (.xls o .xlsx)'
      });
      return;
    }

    // Validar tamaño (máximo 15MB para archivos de notas que pueden ser más grandes)
    if (selectedFile.size > 15 * 1024 * 1024) {
      setResult({
        success: false,
        message: 'Archivo demasiado grande',
        details: 'El archivo no puede superar los 15MB'
      });
      return;
    }

    setFile(selectedFile);
    setUploadStatus('ready');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    setUploadStatus('uploading');
    
    try {
      const response = await uploadNotas(file);
      
const exitosos = response.resultados?.exitosos || 0;
const fallidos = response.resultados?.fallidos || 0;
const isSuccess = exitosos > 0 && exitosos >= fallidos;

setResult({
  success: isSuccess,
  message: isSuccess 
    ? `¡Excelente! Se procesaron ${exitosos} registros de notas correctamente${fallidos > 0 ? ` (${fallidos} con errores)` : ''}` 
    : `No se pudo procesar la información${fallidos > 0 ? ` - ${fallidos} registros con errores` : ''}`,
  details: `✅ Exitosos: ${exitosos}\n❌ Fallidos: ${fallidos}${response.resultados?.errores?.length > 0 ? '\n\nErrores:\n' + response.resultados.errores.join('\n') : ''}`
});

      
      setUploadStatus('success');
      
      // Limpiar después de éxito
      setTimeout(() => {
        setFile(null);
        setUploadStatus('idle');
      }, 3000);
      
    } catch (error) {
      console.error('Error al cargar archivo:', error);
      setResult({
        success: false,
        message: 'Error al procesar el archivo',
        details: error.response?.data?.error || 'Verifique el formato y que los estudiantes existan'
      });
      setUploadStatus('ready');
    } finally {
      setLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setUploadStatus('idle');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Estado: Sin archivo
  if (uploadStatus === 'idle') {
    return (
      <Box sx={{ textAlign: 'center' }}>
        {/* Alerta importante pero discreta */}
        <Alert 
          severity="info" 
          icon={<SchoolIcon />}
          sx={{ 
            mb: 3, 
            borderRadius: 2,
            bgcolor: 'info.50',
            border: '1px solid',
            borderColor: 'info.200'
          }}
        >
          <Typography variant="body2" fontWeight={500}>
            Los estudiantes deben estar registrados previamente en el sistema
          </Typography>
        </Alert>

        {/* Zona de drop principal */}
        <Paper
          elevation={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={openFileSelector}
          sx={{
            border: `2px dashed ${dragging ? theme.palette.primary.main : '#ddd'}`,
            borderRadius: 3,
            py: 8,
            px: 4,
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            bgcolor: dragging ? 'primary.50' : 'grey.50',
            '&:hover': {
              borderColor: theme.palette.primary.main,
              bgcolor: 'primary.50'
            }
          }}
        >
          <CloudUploadIcon 
            sx={{ 
              fontSize: 64, 
              color: dragging ? 'primary.main' : 'grey.400',
              mb: 2,
              transition: 'color 0.3s ease'
            }} 
          />
          
          <Typography variant="h5" gutterBottom fontWeight={600}>
            {dragging ? '¡Suelta tu archivo aquí!' : 'Arrastra tu archivo Excel'}
          </Typography>
          
          <Typography variant="body1" color="text.secondary" mb={3}>
            con información de programas, módulos y calificaciones
          </Typography>

          <Button
            variant="contained"
            startIcon={<FileIcon />}
            sx={{ borderRadius: 2 }}
          >
            Seleccionar Archivo
          </Button>
        </Paper>

        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".xls,.xlsx"
          onChange={handleFileChange}
        />

        {/* Información de campos requeridos */}
        <Card elevation={0} sx={{ mt: 3, bgcolor: 'warning.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" color="warning.dark" fontWeight={500} mb={1}>
              📋 Campos requeridos en tu archivo:
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent="center">
              {[
                'Documento', 'Programa', 'Tipo formación', 'Módulo', 
                'Asignatura', 'Nota', 'Fechas'
              ].map((field, index) => (
                <Chip 
                  key={index}
                  label={field} 
                  size="small" 
                  variant="outlined"
                  sx={{ 
                    borderColor: 'warning.main',
                    color: 'warning.dark',
                    fontSize: '0.75rem',
                    mb: 0.5
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // Estado: Archivo listo para subir
  if (uploadStatus === 'ready') {
    return (
      <Fade in={true}>
        <Box>
          {/* Alerta recordatorio */}
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              bgcolor: 'warning.50'
            }}
          >
            <Typography variant="body2">
              <strong>Recuerda:</strong> Los estudiantes deben existir en el sistema antes de cargar sus notas
            </Typography>
          </Alert>

          {/* Información del archivo */}
          <Card elevation={1} sx={{ mb: 3 }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center">
                <Box 
                  sx={{ 
                    p: 1.5, 
                    bgcolor: 'success.50', 
                    borderRadius: 2,
                    color: 'success.main'
                  }}
                >
                  <DescriptionIcon />
                </Box>
                
                <Box flex={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {file.name}
                  </Typography>
                  <Stack direction="row" spacing={1} mt={0.5}>
                    <Chip 
                      label={formatFileSize(file.size)} 
                      size="small" 
                      color="primary" 
                      variant="outlined" 
                    />
                    <Chip 
                      label="Excel válido" 
                      size="small" 
                      color="success" 
                    />
                  </Stack>
                </Box>

                <IconButton 
                  onClick={clearFile}
                  color="error"
                  sx={{ 
                    bgcolor: 'error.50',
                    '&:hover': { bgcolor: 'error.100' }
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Stack>
            </CardContent>
          </Card>

          {/* Botón de subida principal */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleUpload}
            startIcon={<UploadIcon />}
            sx={{
              py: 2,
              borderRadius: 2,
              fontSize: '1.1rem',
              fontWeight: 600,
              boxShadow: 3,
              bgcolor: 'warning.main',
              '&:hover': {
                bgcolor: 'warning.dark',
                boxShadow: 6,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Procesar Programas y Notas
          </Button>
        </Box>
      </Fade>
    );
  }

  // Estado: Subiendo
  if (uploadStatus === 'uploading') {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3, color: 'warning.main' }} />
        <Typography variant="h6" gutterBottom>
          Procesando archivo académico...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Validando estudiantes y registrando calificaciones
        </Typography>
        <LinearProgress sx={{ mt: 3, borderRadius: 1 }} />
      </Box>
    );
  }

  // Estado: Éxito
  if (uploadStatus === 'success') {
    return (
      <Fade in={true}>
        <Box textAlign="center" py={6}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main', 
              mb: 2 
            }} 
          />
          <Typography variant="h5" gutterBottom fontWeight={600}>
            ¡Datos académicos procesados!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Programas, módulos y calificaciones importados correctamente
          </Typography>
        </Box>
      </Fade>
    );
  }

  return null;
};

export default NotasUploader;