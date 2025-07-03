import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Paper,
  Typography,
  CircularProgress,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Button,
  TextField,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TablePagination,
  Chip,
  Card,
  CardContent,
  Divider,
  Stack,
  Fade,
  Zoom
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SearchIcon from '@mui/icons-material/Search';
import WarningIcon from '@mui/icons-material/Warning';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Navbar from '../components/Navbar';

const BASE_URL = 'https://webhook-ecaf-production.up.railway.app';

const VectorStoreManager = () => {
  const [files, setFiles] = useState([]);
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fetchFiles = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${BASE_URL}/vectors/files`);
      setFiles(response.data.data || []);
    } catch (err) {
      console.error('Error listando archivos del vector store:', err);
      setError('No se pudo listar archivos. Revisa la consola.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar archivos basado en el término de búsqueda
  useEffect(() => {
    const filtered = files.filter(file => {
      const filename = file.filename || file.attributes?.filename || '';
      return filename.toLowerCase().includes(searchTerm.toLowerCase());
    });
    setFilteredFiles(filtered);
    setPage(0); // Resetear a la primera página cuando se busca
  }, [files, searchTerm]);

  const handleDelete = async (fileId) => {
    setLoading(true);
    setError('');
    try {
      await axios.delete(`${BASE_URL}/vectors/files/${fileId}`);
      await fetchFiles();
      setDeleteDialogOpen(false);
      setFileToDelete(null);
    } catch (err) {
      console.error('Error eliminando archivo:', err);
      setError('No se pudo eliminar el archivo.');
      setLoading(false);
    }
  };

  const handleDeleteClick = (file) => {
    setFileToDelete(file);
    setDeleteDialogOpen(true);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Selecciona un archivo primero.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      // Envío multipart/form-data al POST /vectors/files
      const formData = new FormData();
      formData.append('file', selectedFile);
      await axios.post(
        `${BASE_URL}/vectors/files`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' }
        }
      );
      setSelectedFile(null);
      await fetchFiles();
    } catch (err) {
      console.error('Error subiendo archivo:', err);
      setError('No se pudo subir el archivo.');
    } finally {
      setUploading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calcular archivos para la página actual
  const paginatedFiles = filteredFiles.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <>
      <Navbar pageTitle="Entrenamiento del Bot" />
      <Box sx={{ mt: 8, p: 3, backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
        {/* Header moderno y centrado */}
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
            Entrenamiento del Bot
          </Typography>
          <Typography variant="h6" color="text.secondary" fontWeight={400}>
            Gestiona los archivos que alimentan la inteligencia artificial del chatbot de ECAF
          </Typography>
        </Box>

        {/* Card de sección con icono y descripción */}
        <Fade in timeout={800}>
          <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', mb: 3, borderLeft: '4px solid #CE0A0A' }}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" mb={1}>
                <Box 
                  sx={{ 
                    p: 1, 
                    borderRadius: '50%', 
                    bgcolor: '#CE0A0A22',
                    color: '#CE0A0A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 32
                  }}
                >
                  <CloudUploadIcon sx={{ fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={600} color="#CE0A0A">Entrenamiento del Bot</Typography>
                  <Typography variant="body2" color="text.secondary">Sube, gestiona y elimina archivos que alimentan la IA del chatbot institucional.</Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Fade>

        {/* Área de Carga de Archivos - Mejorada */}
        <Zoom in timeout={1000}>
          <Card elevation={3} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              {/* Header del área de carga */}
              <Box sx={{ 
                p: 3, 
                background: 'linear-gradient(45deg, #f8f9fa 0%, #e9ecef 100%)',
                borderBottom: '1px solid #dee2e6'
              }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <CloudUploadIcon sx={{ color: '#CE0A0A', fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#333' }}>
                      Subir Archivo de Entrenamiento
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Arrastra y suelta tu archivo aquí o haz clic para seleccionar
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              {/* Área de drag & drop */}
              <Box
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                sx={{
                  p: 4,
                  border: '2px dashed',
                  borderColor: dragActive ? '#CE0A0A' : selectedFile ? '#28a745' : '#dee2e6',
                  borderRadius: 2,
                  m: 3,
                  backgroundColor: dragActive ? 'rgba(206, 10, 10, 0.05)' : 
                                 selectedFile ? 'rgba(40, 167, 69, 0.05)' : 'transparent',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  textAlign: 'center',
                  '&:hover': {
                    borderColor: '#CE0A0A',
                    backgroundColor: 'rgba(206, 10, 10, 0.05)'
                  }
                }}
                onClick={() => document.getElementById('file-input').click()}
              >
                {selectedFile ? (
                  <Fade in timeout={300}>
                    <Box>
                      <CheckCircleIcon sx={{ fontSize: 48, color: '#28a745', mb: 2 }} />
                      <Typography variant="h6" sx={{ color: '#28a745', fontWeight: 'bold', mb: 1 }}>
                        Archivo Seleccionado
                      </Typography>
                      <Typography variant="body1" sx={{ color: '#666', mb: 2 }}>
                        {selectedFile.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </Typography>
                    </Box>
                  </Fade>
                ) : (
                  <Box>
                    <FileUploadIcon sx={{ fontSize: 64, color: '#CE0A0A', mb: 2, opacity: 0.7 }} />
                    <Typography variant="h6" sx={{ color: '#333', fontWeight: 'bold', mb: 1 }}>
                      Selecciona un archivo
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Arrastra y suelta tu archivo aquí o haz clic para explorar
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<UploadFileIcon />}
                      sx={{ 
                        bgcolor: '#CE0A0A', 
                        '&:hover': { bgcolor: '#b00909' },
                        px: 3,
                        py: 1.5
                      }}
                    >
                      Explorar Archivos
                    </Button>
                  </Box>
                )}
                
                <input
                  id="file-input"
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.txt"
                />
              </Box>

              {/* Botones de acción */}
              {selectedFile && (
                <Fade in timeout={300}>
                  <Box sx={{ p: 3, pt: 0 }}>
                    <Stack direction="row" spacing={2} justifyContent="center">
                      <Button
                        variant="outlined"
                        onClick={() => setSelectedFile(null)}
                        disabled={uploading}
                        sx={{ px: 3 }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        variant="contained"
                        onClick={handleUpload}
                        disabled={uploading}
                        startIcon={uploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
                        sx={{ 
                          bgcolor: '#CE0A0A', 
                          '&:hover': { bgcolor: '#b00909' },
                          px: 4,
                          py: 1.5
                        }}
                      >
                        {uploading ? 'Subiendo...' : 'Subir Archivo'}
                      </Button>
                    </Stack>
                  </Box>
                </Fade>
              )}
            </CardContent>
          </Card>
        </Zoom>

        {/* Advertencia */}
        <Fade in timeout={1200}>
          <Alert 
            severity="warning" 
            icon={<WarningIcon />}
            sx={{ 
              mb: 3,
              borderRadius: 2,
              border: '1px solid #ff9800',
              '& .MuiAlert-message': { fontWeight: 500 }
            }}
          >
            <Typography variant="body1" sx={{ fontWeight: 500, mb: 1 }}>
              ⚠️ Importante: Los archivos que subas aquí se utilizan para entrenar al chatbot.
            </Typography>
            <Typography variant="body2">
              Asegúrate de que el contenido sea correcto y actualizado, ya que archivos incorrectos 
              pueden causar que el bot proporcione información errónea o confusa a los usuarios.
            </Typography>
          </Alert>
        </Fade>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {/* Campo de búsqueda */}
        <Fade in timeout={1400}>
          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 3 }}>
            <TextField
              fullWidth
              placeholder="🔍 Buscar por nombre de archivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                sx: { borderRadius: 2 }
              }}
              sx={{ mb: 2 }}
            />
            
            <Typography variant="body2" color="text.secondary">
              Mostrando {filteredFiles.length} de {files.length} archivos
            </Typography>
          </Paper>
        </Fade>

        {/* Tabla de archivos */}
        {loading && !uploading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress size={60} sx={{ color: '#CE0A0A' }} />
          </Box>
        ) : (
          <Fade in timeout={1600}>
            <Paper elevation={3} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ p: 3, borderBottom: '1px solid #dee2e6' }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                  Archivos de Entrenamiento ({filteredFiles.length})
                </Typography>
              </Box>
              
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f8f9fa' }}>
                    <TableCell width="50" sx={{ fontWeight: 'bold' }}>#</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Archivo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Tamaño</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fecha de Creación</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedFiles.map((file, index) => (
                    <TableRow key={file.id} sx={{ '&:hover': { backgroundColor: '#f8f9fa' } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: '#CE0A0A' }}>
                          {page * rowsPerPage + index + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {file.filename || file.attributes?.filename || '(sin nombre)'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={file.id} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={file.status} 
                          size="small"
                          color={file.status === 'ready' ? 'success' : 'warning'}
                          sx={{ fontWeight: 'bold' }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {(file.usage_bytes / 1024 / 1024).toFixed(2)} MB
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {new Date(file.created_at * 1000).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteClick(file)}
                          disabled={loading}
                          title="Eliminar archivo"
                          sx={{ 
                            '&:hover': { 
                              backgroundColor: 'rgba(244, 67, 54, 0.1)',
                              transform: 'scale(1.1)'
                            },
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Paginación */}
              <TablePagination
                component="div"
                count={filteredFiles.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[5, 10, 15, 25]}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => 
                  `${from}-${to} de ${count !== -1 ? count : `más de ${to}`}`
                }
              />
            </Paper>
          </Fade>
        )}
      </Box>
    </>
  );
};

export default VectorStoreManager;