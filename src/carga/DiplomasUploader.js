import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Input,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  Card,
  ListItemIcon,
  Tooltip,
  IconButton,
  Zoom,
  Fade,
  CircularProgress,
  Alert,
  useTheme
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Description as DescriptionIcon,
  DeleteOutline as DeleteIcon,
  FileDownload as FileDownloadIcon,
  UploadFile as UploadFileIcon,
  Warning as WarningIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Info as InfoIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { uploadDiplomas } from './api';

const DiplomasUploader = ({ setLoading, setResult }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('initial'); // 'initial', 'ready', 'processing', 'success'
  const fileInputRef = useRef(null);
  const theme = useTheme();

  useEffect(() => {
    if (file) {
      setUploadStatus('ready');
    } else {
      setUploadStatus('initial');
    }
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // Validar que sea un archivo Excel
    const validTypes = [
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (!validTypes.includes(selectedFile.type)) {
      setResult({
        success: false,
        message: 'Formato de archivo no válido',
        details: 'Por favor, seleccione un archivo Excel (.xls o .xlsx)'
      });
      return;
    }
    setFile(selectedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
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
    if (!file) {
      setResult({
        success: false,
        message: 'No se ha seleccionado ningún archivo',
        details: 'Por favor, seleccione un archivo Excel para continuar'
      });
      return;
    }

    setLoading(true);
    setUploadStatus('processing');
    
    try {
      // Usar la función API de diplomas
      const response = await uploadDiplomas(file);
      
      // Determinar si la operación fue exitosa basándose en los resultados
      const exitosos = response.resultados?.exitosos || 0;
      const fallidos = response.resultados?.fallidos || 0;
      const total = response.procesados || 0;
      
      // Calcular porcentaje de éxito
      const porcentajeExito = total > 0 ? (exitosos / total) * 100 : 0;
      
      // Determinar si es éxito o fallo
      const isSuccess = exitosos > 0 && (porcentajeExito >= 50 || fallidos === 0);
      
      // Generar mensaje apropiado
      let message;
      if (isSuccess) {
        if (fallidos === 0) {
          message = `¡Todos los ${exitosos} diplomas se procesaron correctamente!`;
        } else {
          message = `Se procesaron ${exitosos} de ${total} diplomas correctamente`;
        }
      } else {
        if (exitosos === 0) {
          message = `No se pudo procesar ningún diploma (${fallidos} fallidos)`;
        } else {
          message = `Solo se procesaron ${exitosos} de ${total} diplomas`;
        }
      }
      
      setResult({
        success: isSuccess,
        message: message,
        details: `Total registros: ${total}
✅ Exitosos: ${exitosos}
❌ Fallidos: ${fallidos}
📊 Tasa de éxito: ${porcentajeExito.toFixed(1)}%
${response.resultados?.errores?.length > 0 ? '\n\n🔍 Errores detallados:\n' + response.resultados.errores.join('\n') : ''}`
      });
      
      // Solo marcar como éxito en la UI si realmente fue exitoso
      if (isSuccess) {
        setUploadStatus('success');
        
        // Limpiar archivo después de un tiempo solo si fue exitoso
        setTimeout(() => {
          setFile(null);
          setUploadStatus('initial');
        }, 3000);
      } else {
        // Si falló, volver al estado inicial inmediatamente
        setUploadStatus('initial');
      }
      
    } catch (error) {
      console.error('Error al cargar archivo:', error);
      setResult({
        success: false,
        message: 'Error al procesar el archivo de diplomas',
        details: error.response?.data?.error || error.message
      });
      setUploadStatus('initial');
    } finally {
      setLoading(false);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current.click();
  };

  const clearFile = () => {
    setFile(null);
  };

  const handleDownloadTemplate = () => {
    window.open("https://ecafescuela.com/plantilla_excel/Plantilla_Diplomas.xlsx", "_blank");
  };

  // Renderizar diferentes vistas basadas en el estado
  const renderUploadArea = () => {
    if (uploadStatus === 'initial') {
      return (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="#fff" d="M5 20h14v-2H5v2zm7-18C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zm1 15h-2v-6H8l4-4 4 4h-3v6z"/></svg>}
              href="https://bryanglen.com/ecaf/Plantilla_Diplomas.xlsx"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                bgcolor: '#CE0A0A',
                color: '#fff',
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(206,10,10,0.08)',
                '&:hover': { bgcolor: '#b00909' }
              }}
            >
              Descargar Plantilla
            </Button>
          </Box>

          <Alert 
            severity="info" 
            variant="outlined" 
            icon={<InfoIcon fontSize="inherit" />}
            sx={{ 
              mb: 3, 
              borderRadius: 2,
              border: '1px solid rgba(33, 150, 243, 0.5)',
              boxShadow: '0 2px 8px rgba(33, 150, 243, 0.08)',
              '& .MuiAlert-icon': {
                color: '#2196f3'
              }
            }}
          >
            <Typography variant="body2">
              <strong>Información:</strong> Este módulo permite cargar información de diplomas y certificados otorgados por la institución.
            </Typography>
          </Alert>

          <Paper
            elevation={0}
            className={`dropzone-container ${dragging ? 'dragging' : ''}`}
            sx={{
              border: `2px dashed ${theme.palette.primary.main}`,
              borderRadius: 3,
              p: 3,
              textAlign: 'center',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              height: 300,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              background: dragging ? 'rgba(206, 10, 10, 0.03)' : 'transparent'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={openFileSelector}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SchoolIcon 
                sx={{ 
                  fontSize: 80, 
                  color: dragging ? theme.palette.primary.main : theme.palette.grey[400],
                  mb: 2,
                  animation: dragging ? 'pulse 1.5s infinite' : 'none'
                }} 
              />
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
                Cargar Información de Diplomas
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400, mx: 'auto' }}>
                Arrastra un archivo Excel o haz clic para seleccionarlo
              </Typography>
              
              <Divider sx={{ width: '60%', my: 3 }} />
              
              <Input
                type="file"
                inputRef={fileInputRef}
                sx={{ display: 'none' }}
                inputProps={{ accept: '.xls,.xlsx' }}
                onChange={handleFileChange}
              />
            </Box>
          </Paper>
        </>
      );
    } else if (uploadStatus === 'ready') {
      return (
        <Fade in={true} timeout={500}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Alert 
              severity="info" 
              variant="outlined" 
              icon={<InfoIcon fontSize="inherit" />}
              sx={{ 
                mb: 3, 
                borderRadius: 2,
                border: '1px solid rgba(33, 150, 243, 0.5)',
                boxShadow: '0 2px 8px rgba(33, 150, 243, 0.08)',
                '& .MuiAlert-icon': {
                  color: '#2196f3'
                }
              }}
            >
              <Typography variant="body2">
                <strong>Importante:</strong> Asegúrese de que todos los campos obligatorios estén completos en el archivo Excel.
              </Typography>
            </Alert>
            
            <Card 
              elevation={3} 
              sx={{ 
                borderRadius: 3, 
                overflow: 'hidden', 
                mb: 2,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                }
              }}
            >
              <Box sx={{ 
                p: 2, 
                bgcolor: theme.palette.primary.main, 
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, display: 'flex', alignItems: 'center' }}>
                  <DescriptionIcon sx={{ mr: 1 }} />
                  Archivo Listo para Procesar
                </Typography>
                <Tooltip title="Eliminar archivo">
                  <IconButton size="small" onClick={clearFile} sx={{ color: 'white' }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <List>
                <ListItem>
                  <ListItemIcon>
                    <DescriptionIcon sx={{ color: '#4285F4' }} />
                  </ListItemIcon>
                  <ListItemText 
                    primary={file.name} 
                    secondary={`Tamaño: ${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              </List>
              <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.02)' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Este archivo debe contener la siguiente información:
                </Typography>
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                >
                  <span style={{ fontWeight: 'bold' }}>nombre</span> • 
                  <span style={{ fontWeight: 'bold' }}>apellido</span> • 
                  <span style={{ fontWeight: 'bold' }}>tipo_identificacion</span> • 
                  <span style={{ fontWeight: 'bold' }}>numero_identificacion</span> • 
                  <span style={{ fontWeight: 'bold' }}>tipo_diploma</span> • 
                  <span style={{ fontWeight: 'bold' }}>nombre_tipo_diploma</span> • 
                  <span style={{ fontWeight: 'bold' }}>modalidad</span> • 
                  <span style={{ fontWeight: 'bold' }}>fecha_grado</span> • 
                  <span style={{ fontWeight: 'bold' }}>libro</span> • 
                  <span style={{ fontWeight: 'bold' }}>acta</span> • 
                  <span style={{ fontWeight: 'bold' }}>referencia</span> • 
                  <span style={{ fontWeight: 'bold' }}>telefono</span> • 
                  <span style={{ fontWeight: 'bold' }}>correo</span> • 
                  <span style={{ fontWeight: 'bold' }}>estado</span>
                </Typography>
              </Box>
            </Card>
            
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handleUpload}
              startIcon={<CloudUploadIcon />}
              sx={{
                py: 1.5,
                borderRadius: 2,
                boxShadow: '0 4px 14px rgba(206, 10, 10, 0.4)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(206, 10, 10, 0.6)'
                }
              }}
            >
              Procesar Archivo de Diplomas
            </Button>
          </Box>
        </Fade>
      );
    } else if (uploadStatus === 'processing') {
      return (
        <Fade in={true}>
          <Box sx={{ 
            height: 300, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            p: 4
          }}>
            <CircularProgress size={60} color="primary" sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Procesando Diplomas
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Por favor espere mientras procesamos la información...
            </Typography>
          </Box>
        </Fade>
      );
    } else if (uploadStatus === 'success') {
      return (
        <Fade in={true}>
          <Box sx={{ 
            height: 300, 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'center', 
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.02)',
            borderRadius: 3,
            p: 4
          }}>
            <CheckCircleOutlineIcon color="success" sx={{ fontSize: 80, mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              ¡Diplomas Procesados Correctamente!
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              La información ha sido cargada con éxito.
              Volviendo al formulario de carga...
            </Typography>
          </Box>
        </Fade>
      );
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      {renderUploadArea()}
      
      {uploadStatus === 'initial' && (
        <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="medium"
            onClick={openFileSelector}
            startIcon={<UploadFileIcon />}
            sx={{
              borderRadius: 2,
              px: 3,
              boxShadow: '0 4px 10px rgba(206, 10, 10, 0.3)'
            }}
          >
            Seleccionar Archivo
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default DiplomasUploader;