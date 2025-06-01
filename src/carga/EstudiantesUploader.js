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
  useTheme
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon,
  Description as DescriptionIcon,
  DeleteOutline as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Upload as UploadIcon,
  InsertDriveFile as FileIcon
} from '@mui/icons-material';
import { uploadEstudiantes } from './api';

const EstudiantesUploader = ({ setLoading, setResult }) => {
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

    // Validar tamaño (máximo 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setResult({
        success: false,
        message: 'Archivo demasiado grande',
        details: 'El archivo no puede superar los 10MB'
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
      const response = await uploadEstudiantes(file);
      
const exitosos = response.resultados?.exitosos || 0;
const fallidos = response.resultados?.fallidos || 0;
const isSuccess = exitosos > 0 && exitosos >= fallidos;

setResult({
  success: isSuccess,
  message: isSuccess 
    ? `¡Excelente! Se procesaron ${exitosos} estudiantes correctamente${fallidos > 0 ? ` (${fallidos} con errores)` : ''}` 
    : `No se pudo procesar la información${fallidos > 0 ? ` - ${fallidos} estudiantes con errores` : ''}`,
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
        details: error.response?.data?.error || 'Verifique el formato del archivo'
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
            o haz clic para seleccionar desde tu computador
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

        {/* Información rápida */}
        <Card elevation={0} sx={{ mt: 3, bgcolor: 'info.50' }}>
          <CardContent sx={{ py: 2 }}>
            <Typography variant="body2" color="info.main" fontWeight={500}>
              💡 Tu archivo debe contener: Tipo documento, Número documento, Nombres, Apellidos, Email
            </Typography>
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
              '&:hover': {
                boxShadow: 6,
                transform: 'translateY(-2px)'
              },
              transition: 'all 0.3s ease'
            }}
          >
            Procesar Estudiantes
          </Button>
        </Box>
      </Fade>
    );
  }

  // Estado: Subiendo
  if (uploadStatus === 'uploading') {
    return (
      <Box textAlign="center" py={6}>
        <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
        <Typography variant="h6" gutterBottom>
          Procesando archivo...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Esto puede tomar unos momentos
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
            ¡Archivo procesado con éxito!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Los datos se han importado correctamente
          </Typography>
        </Box>
      </Fade>
    );
  }

  return null;
};

export default EstudiantesUploader;