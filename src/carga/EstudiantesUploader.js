import React, { useState, useRef } from 'react';
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
  alpha,
  Card,
  ListItemIcon,
  Tooltip,
  IconButton,
  Chip,
  Zoom,
  Link
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Description as DescriptionIcon,
  DeleteOutline as DeleteIcon,
  Check as CheckIcon,
  FileDownload as FileDownloadIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import { uploadEstudiantes, getPlantilla } from './api';

const EstudiantesUploader = ({ setLoading, setResult }) => {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    // Validar que sea un archivo Excel
    const validTypes = ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
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
    
    try {
      // Usar la función API en lugar de implementación directa
      const response = await uploadEstudiantes(file);
      
      setResult({
        success: true,
        message: `Se procesaron ${response.procesados || 0} estudiantes con éxito`,
        details: `Total registros: ${response.procesados || 0}
Exitosos: ${response.resultados?.exitosos || 0}
Fallidos: ${response.resultados?.fallidos || 0}
${response.resultados?.errores?.length > 0 ? '\nErrores:\n' + response.resultados.errores.join('\n') : ''}`
      });
      
      // Limpiar archivo después de cargar
      setFile(null);
    } catch (error) {
      console.error('Error al cargar archivo:', error);
      setResult({
        success: false,
        message: 'Error al procesar el archivo',
        details: error.response?.data?.error || error.message
      });
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

  const handleDownloadTemplate = async () => {
    setDownloadingTemplate(true);
    try {
      // Usar la función de API para descargar plantilla
      await getPlantilla('estudiantes');
      setDownloadingTemplate(false);
    } catch (error) {
      console.error('Error al descargar plantilla:', error);
      setResult({
        success: false,
        message: 'Error al descargar la plantilla',
        details: error.message
      });
      setDownloadingTemplate(false);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        className={`dropzone-container ${dragging ? 'dragging' : ''}`}
        sx={{
          border: (theme) => `2px dashed ${dragging ? theme.palette.primary.main : theme.palette.divider}`,
          borderRadius: 3,
          p: 5,
          textAlign: 'center',
          backgroundColor: (theme) => dragging ? alpha(theme.palette.primary.main, 0.05) : alpha(theme.palette.background.default, 0.6),
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: dragging ? 3 : 0
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
            minHeight: '200px',
          }}
        >
          <UploadFileIcon 
            sx={{ 
              fontSize: 80, 
              color: (theme) => dragging ? theme.palette.primary.main : '#9e9e9e',
              mb: 2,
              transition: 'all 0.3s ease'
            }} 
          />
          <Typography variant="h5" gutterBottom fontWeight="medium">
            Cargar Información de Estudiantes
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            Arrastra y suelta un archivo Excel o haz clic para seleccionarlo
          </Typography>
          
          <Input
            type="file"
            inputRef={fileInputRef}
            sx={{ display: 'none' }}
            inputProps={{ accept: '.xls,.xlsx' }}
            onChange={handleFileChange}
          />
          
          <Chip 
            icon={<DescriptionIcon />} 
            label="Excel (.xls, .xlsx)" 
            variant="outlined" 
            sx={{ mt: 1 }}
          />
        </Box>
      </Paper>
      
      {file && (
        <Zoom in={true}>
          <Card sx={{ mt: 2, borderRadius: 2, boxShadow: 2 }}>
            <List>
              <ListItem
                secondaryAction={
                  <Tooltip title="Eliminar archivo">
                    <IconButton edge="end" onClick={(e) => {
                      e.stopPropagation();
                      clearFile();
                    }}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }
                className="file-list-item"
              >
                <ListItemIcon>
                  <DescriptionIcon color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024).toFixed(2)} KB`}
                />
                <Chip 
                  icon={<CheckIcon />} 
                  label="Listo para procesar" 
                  color="success" 
                  size="small" 
                  variant="outlined"
                  sx={{ mr: 2 }}
                />
              </ListItem>
            </List>
          </Card>
        </Zoom>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
        <Button 
          variant="contained" 
          size="large" 
          onClick={handleUpload} 
          disabled={!file}
          startIcon={<CloudUploadIcon />}
          className="upload-button"
          sx={{
            px: 4,
            py: 1.2,
            borderRadius: 2,
            fontWeight: 'bold'
          }}
        >
          Procesar Archivo
        </Button>
        
        <Button
          variant="outlined"
          size="large"
          onClick={handleDownloadTemplate}
          disabled={downloadingTemplate}
          startIcon={<FileDownloadIcon />}
          sx={{
            borderRadius: 2
          }}
        >
          Descargar Plantilla
        </Button>
      </Box>
      
      <Card sx={{ mt: 4, borderRadius: 2, boxShadow: 2 }}>
        <Box sx={{ 
          p: 2,  
          borderBottom: '1px solid', 
          borderColor: 'divider',
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          display: 'flex',
          alignItems: 'center'
        }}>
          <DescriptionIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" sx={{ fontSize: '1.1rem' }}>
            Formato del Archivo
          </Typography>
        </Box>
        
        <Box sx={{ p: 2 }}>
          <Typography variant="body2" paragraph>
            El archivo Excel debe contener las siguientes columnas en el orden especificado:
          </Typography>
          
          <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
            {[
              { name: 'tipo_documento', desc: '(CC, TI, CE, PA)' },
              { name: 'numero_documento', desc: '' },
              { name: 'nombres', desc: '' },
              { name: 'apellidos', desc: '' },
              { name: 'fecha_nacimiento', desc: '(YYYY-MM-DD)' },
              { name: 'genero', desc: '(M, F, Otro)' },
              { name: 'email', desc: '' },
              { name: 'telefono', desc: '' },
              { name: 'direccion', desc: '' },
              { name: 'ciudad', desc: '' }
            ].map((column, index) => (
              <React.Fragment key={column.name}>
                <ListItem disablePadding>
                  <ListItemText 
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography 
                          component="span" 
                          variant="body2" 
                          sx={{ fontWeight: 'bold', color: 'primary.main', width: '150px' }}
                        >
                          {column.name}
                        </Typography>
                        {column.desc && (
                          <Typography component="span" variant="body2" color="text.secondary">
                            {column.desc}
                          </Typography>
                        )}
                      </Box>
                    }
                    sx={{ p: 1 }}
                  />
                </ListItem>
                {index < 9 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontSize: '0.85rem' }}>
            <strong>Nota:</strong> Para una carga exitosa, asegúrese de que los campos tipo_documento, 
            numero_documento, nombres, apellidos y email estén completos en todos los registros.
          </Typography>
        </Box>
      </Card>
    </Box>
  );
};

export default EstudiantesUploader;
