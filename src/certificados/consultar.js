import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Divider,
  Alert,
  Tooltip,
  CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import DownloadIcon from '@mui/icons-material/Download';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import FilterListIcon from '@mui/icons-material/FilterList';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import Navbar from '../components/Navbar';

const ConsultarCertificados = ({ pageTitle }) => {
  // Estado para almacenar la lista de certificados
  const [certificados, setCertificados] = useState([]);
  const [allCertificados, setAllCertificados] = useState([]); // Todos los certificados sin filtrar por usuario
  
  // Estado para el filtrado y la búsqueda
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipoId, setFiltroTipoId] = useState('todos');
  const [filtroTipoCert, setFiltroTipoCert] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [certificadosFiltrados, setCertificadosFiltrados] = useState([]);
  
  // Estado para almacenar datos del usuario
  const [userData, setUserData] = useState(null);
  
  // Estado para la paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  
  // Estado para el modal de pago
  const [openPagoDialog, setOpenPagoDialog] = useState(false);
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null);
  
  // Estado para mostrar carga
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Formatear precio en pesos colombianos
  const formatoPesosColombiano = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Cargar datos del usuario
  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedUserData = JSON.parse(storedUserData);
        setUserData(parsedUserData);
      } catch (error) {
        console.error('Error al analizar los datos del usuario:', error);
      }
    }
  }, []);

  // Verificar si el usuario es administrador o profesor
  const isAdminOrTeacher = () => {
    if (!userData) return false;
    
    // Verificar el rol principal
    const roleLower = userData.role ? userData.role.toLowerCase() : '';
    if (roleLower === 'administrador' || roleLower === 'admin' || 
        roleLower === 'profesor' || roleLower === 'teacher') {
      return true;
    }
    
    // Verificar roles de Moodle
    if (userData.moodleRoles && Array.isArray(userData.moodleRoles)) {
      return userData.moodleRoles.some(role => {
        const roleName = role.roleName.toLowerCase();
        return roleName === 'admin' || roleName === 'administrator' || 
               roleName === 'manager' || roleName === 'teacher' || 
               roleName === 'editingteacher' || roleName === 'profesor';
      });
    }
    
    return false;
  };

  // Obtener certificados de la API
  useEffect(() => {
    const fetchCertificados = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://webhook-ecaf-production.up.railway.app/api/certificados');
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setAllCertificados(data); // Guardar todos los certificados
        
        // Filtrar por email del usuario si no es admin/profesor
        if (userData && userData.email && !isAdminOrTeacher()) {
          console.log('Filtrando certificados por email:', userData.email);
          const userCertificados = data.filter(cert => 
            cert.correo && cert.correo.toLowerCase() === userData.email.toLowerCase()
          );
          setCertificados(userCertificados);
          setCertificadosFiltrados(userCertificados);
        } else {
          setCertificados(data);
          setCertificadosFiltrados(data);
        }
      } catch (err) {
        console.error('Error al obtener certificados:', err);
        setError('No se pudieron cargar los certificados. Por favor, intente nuevamente.');
      } finally {
        setLoading(false);
      }
    };

    if (userData) { // Solo cargar certificados cuando tengamos datos del usuario
      fetchCertificados();
    }
  }, [userData]);

  // Actualizar la lista filtrada cuando cambien los filtros o la búsqueda
  useEffect(() => {
    if (!certificados.length) return;
    
    let resultado = [...certificados];
    
    // Aplicar filtro por estado si no es "todos"
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(cert => cert.estado === filtroEstado);
    }
    
    // Aplicar filtro por tipo de identificación si no es "todos"
    if (filtroTipoId !== 'todos') {
      resultado = resultado.filter(cert => cert.tipo_identificacion === filtroTipoId);
    }
    
    // Aplicar filtro por tipo de certificado si no es "todos"
    if (filtroTipoCert !== 'todos') {
      resultado = resultado.filter(cert => cert.tipo_certificado === filtroTipoCert);
    }
    
    // Aplicar búsqueda (nombre, número de identificación o referencia)
    if (busqueda.trim()) {
      const busquedaLower = busqueda.toLowerCase().trim();
      resultado = resultado.filter(cert => 
        (cert.nombre && cert.nombre.toLowerCase().includes(busquedaLower)) ||
        (cert.apellido && cert.apellido.toLowerCase().includes(busquedaLower)) ||
        (cert.numero_identificacion && cert.numero_identificacion.toLowerCase().includes(busquedaLower)) ||
        (cert.correo && cert.correo.toLowerCase().includes(busquedaLower)) ||
        (cert.id && cert.id.toString().includes(busquedaLower))
      );
    }
    
    setCertificadosFiltrados(resultado);
    setPage(0); // Regresar a la primera página cuando cambian los filtros
  }, [certificados, filtroEstado, filtroTipoId, filtroTipoCert, busqueda]);

  // Funciones para manejar cambios en la paginación
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Funciones para el modal de pago
  const handleOpenPagoDialog = (certificado) => {
    setCertificadoSeleccionado(certificado);
    setOpenPagoDialog(true);
  };

  const handleClosePagoDialog = () => {
    setOpenPagoDialog(false);
  };

  // Obtener color del chip según el estado
  const getEstadoChipColor = (estado) => {
    switch (estado) {
      case 'pendiente':
        return 'warning';
      case 'pagado':
        return 'success';
      case 'procesando':
        return 'info';
      case 'error':
        return 'error';
      case 'rechazado':
        return 'error';
      default:
        return 'default';
    }
  };

  // Obtener precios según el tipo de certificado
  const getPrecioCertificado = (tipoCertificado) => {
    switch (tipoCertificado) {
      case 'Certificado de Notas':
      case 'Certificado de notas':
        return 10000;
      case 'Certificado de Asistencia':
      case 'Certificado de asistencia':
        return 12000;
      case 'Certificado General':
      case 'Certificado general':
        return 20000;
      default:
        return 10000;
    }
  };
  
  // Obtener listas de valores únicos para filtros
  const estados = certificados.length 
    ? ['todos', ...new Set(certificados.map(cert => cert.estado).filter(Boolean))]
    : ['todos'];
    
  const tiposIdentificacion = certificados.length 
    ? ['todos', ...new Set(certificados.map(cert => cert.tipo_identificacion).filter(Boolean))]
    : ['todos'];
    
  const tiposCertificado = certificados.length 
    ? ['todos', ...new Set(certificados.map(cert => cert.tipo_certificado).filter(Boolean))]
    : ['todos'];

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Navbar pageTitle={pageTitle || "Consultar Certificados"} />
      <Container maxWidth="xl">
        <Box p={3} sx={{ marginTop: '20px' }}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography 
                variant="h5" 
                sx={{ 
                  color: '#CE0A0A', 
                  fontWeight: 600,
                }}
              >
                Consulta de Certificados
              </Typography>
              
              {/* Indicador de filtro por email para usuarios no admin */}
              {userData && userData.email && !isAdminOrTeacher() && (
                <Chip
                  icon={<EmailIcon />}
                  label={`Mostrando certificados para: ${userData.email}`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderColor: '#CE0A0A',
                    color: '#CE0A0A',
                    '& .MuiChip-icon': {
                      color: '#CE0A0A'
                    }
                  }}
                />
              )}
            </Box>
            
            {/* Mensaje para admins que ven todos los certificados */}
            {userData && isAdminOrTeacher() && (
              <Alert 
                severity="info" 
                icon={<InfoIcon />}
                sx={{ 
                  mb: 3, 
                  backgroundColor: alpha('#CE0A0A', 0.05),
                  color: '#CE0A0A',
                  '& .MuiAlert-icon': {
                    color: '#CE0A0A'
                  }
                }}
              >
                <Typography variant="body2">
                  Como administrador o profesor, puede ver todos los certificados en el sistema, independientemente del correo electrónico asociado.
                </Typography>
              </Alert>
            )}
            
            <Divider sx={{ mb: 4 }} />
            
            {/* Herramientas de búsqueda y filtrado */}
            <Grid container spacing={2} mb={4} alignItems="flex-start">
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  placeholder="Buscar por nombre, documento o número de referencia"
                  variant="outlined"
                  
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    )
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" >
                      <InputLabel>Filtrar por Estado</InputLabel>
                      <Select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        label="Filtrar por Estado"
                      >
                        {estados.map((estado) => (
                          <MenuItem key={estado} value={estado}>
                            {estado === 'todos' ? 'Todos los estados' : estado}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" >
                      <InputLabel>Filtrar por tipo de ID</InputLabel>
                      <Select
                        value={filtroTipoId}
                        onChange={(e) => setFiltroTipoId(e.target.value)}
                        label="Filtrar por tipo de ID"
                      >
                        {tiposIdentificacion.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo === 'todos' ? 'Todos los tipos' : tipo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <FormControl fullWidth variant="outlined" >
                      <InputLabel>Filtrar por Tipo de Certificado</InputLabel>
                      <Select
                        value={filtroTipoCert}
                        onChange={(e) => setFiltroTipoCert(e.target.value)}
                        label="Filtrar por Tipo de Certificado"
                      >
                        {tiposCertificado.map((tipo) => (
                          <MenuItem key={tipo} value={tipo}>
                            {tipo === 'todos' ? 'Todos los certificados' : tipo}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<SearchIcon />}
                  sx={{ 
                    bgcolor: '#CE0A0A',
                    borderRadius: 2,
                    py: 1.5,
                    mt: 2,
                    '&:hover': {
                      bgcolor: '#b00909',
                    }
                  }}
                >
                  Buscar
                </Button>
              </Grid>
            </Grid>
            
            {/* Mensaje de error */}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            
            {/* Contenido principal */}
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress sx={{ color: '#CE0A0A' }} />
              </Box>
            ) : certificadosFiltrados.length === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                {userData && !isAdminOrTeacher() 
                  ? `No se encontraron certificados asociados a su correo electrónico (${userData.email}).`
                  : 'No se encontraron certificados que coincidan con su búsqueda.'}
              </Alert>
            ) : (
              <>
                {/* Tabla de certificados */}
                <TableContainer>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: alpha('#CE0A0A', 0.05) }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Identificación</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Número de Identificación</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Tipo de Certificado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Referencia</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Fecha</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Valor</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {certificadosFiltrados
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((certificado) => (
                          <TableRow key={certificado.id} hover>
                            <TableCell>{`${certificado.nombre} ${certificado.apellido}`}</TableCell>
                            <TableCell>{certificado.tipo_identificacion}</TableCell>
                            <TableCell>{certificado.numero_identificacion}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <EmailIcon fontSize="small" sx={{ mr: 0.5, color: '#CE0A0A', opacity: 0.7 }} />
                                {certificado.correo}
                              </Box>
                            </TableCell>
                            <TableCell>{certificado.tipo_certificado}</TableCell>
                            <TableCell>{`#${certificado.id}`}</TableCell>
                            <TableCell>
                              {new Date(certificado.created_at).toLocaleDateString('es-ES')}
                            </TableCell>
                            <TableCell>
                              <Chip 
                                label={certificado.estado || "pendiente"} 
                                color={getEstadoChipColor(certificado.estado || "pendiente")} 
                                size="small"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 'medium', color: '#CE0A0A' }}>
                                {formatoPesosColombiano(getPrecioCertificado(certificado.tipo_certificado))}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                {(!certificado.estado || certificado.estado === 'pendiente') && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AttachMoneyIcon />}
                                    onClick={() => handleOpenPagoDialog(certificado)}
                                    sx={{ 
                                      bgcolor: '#4CAF50',
                                      '&:hover': {
                                        bgcolor: '#388E3C',
                                      }
                                    }}
                                  >
                                    Pagar
                                  </Button>
                                )}
                                
                                {certificado.estado === 'pagado' && (
                                  <Tooltip title="Descargar certificado">
                                    <IconButton size="small" color="primary">
                                      <DownloadIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                
                {/* Paginación */}
                <TablePagination
                  rowsPerPageOptions={[15, 30, 45]}
                  component="div"
                  count={certificadosFiltrados.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                  labelRowsPerPage="Filas por página:"
                  labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                />
              </>
            )}
          </Paper>
        </Box>
      </Container>

      {/* Modal de Pago */}
      <Dialog
        open={openPagoDialog}
        onClose={handleClosePagoDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { 
            borderRadius: 2,
          }
        }}
      >
        <DialogTitle sx={{ bgcolor: alpha('#CE0A0A', 0.05), pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#CE0A0A' }}>
            <CreditCardIcon sx={{ mr: 1 }} />
            Realizar Pago
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          {certificadoSeleccionado && (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Está a punto de realizar el pago del siguiente certificado:
              </DialogContentText>
              
              <Box sx={{ backgroundColor: alpha('#CE0A0A', 0.03), p: 2, borderRadius: 1, mb: 3 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Referencia:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  #{certificadoSeleccionado.id}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Tipo de certificado:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {certificadoSeleccionado.tipo_certificado}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Solicitante:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {`${certificadoSeleccionado.nombre} ${certificadoSeleccionado.apellido}`}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Email:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {certificadoSeleccionado.correo}
                </Typography>
                
                <Typography variant="subtitle2" color="textSecondary">
                  Valor a pagar:
                </Typography>
                <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
                  {formatoPesosColombiano(getPrecioCertificado(certificadoSeleccionado.tipo_certificado))}
                </Typography>
              </Box>
              
              <DialogContentText>
                En este espacio se implementará el formulario de pago donde podrá ingresar los datos de su tarjeta u otros medios de pago disponibles.
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={handleClosePagoDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
            }}
          >
            Cancelar
          </Button>
          <Button 
            variant="contained"
            sx={{ 
              bgcolor: '#CE0A0A',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#b00909',
              }
            }}
          >
            Continuar con el Pago
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ConsultarCertificados;