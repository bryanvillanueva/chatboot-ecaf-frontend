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
  CircularProgress,
  Snackbar
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import PaymentIcon from '@mui/icons-material/Payment';
import DownloadIcon from '@mui/icons-material/Download';
import CloseIcon from '@mui/icons-material/Close';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import EmailIcon from '@mui/icons-material/Email';
import InfoIcon from '@mui/icons-material/Info';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PrintIcon from '@mui/icons-material/Print';
import Navbar from '../components/Navbar';
import certificateService from '../services/certificateService';

const ConsultarCertificados = ({ pageTitle }) => {
  // Estados
  const [certificados, setCertificados] = useState([]);
  const [allCertificados, setAllCertificados] = useState([]);
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [filtroTipoId, setFiltroTipoId] = useState('todos');
  const [filtroTipoCert, setFiltroTipoCert] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [certificadosFiltrados, setCertificadosFiltrados] = useState([]);
  const [userData, setUserData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [openPagoDialog, setOpenPagoDialog] = useState(false);
  const [certificadoSeleccionado, setCertificadoSeleccionado] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [loadingPdf, setLoadingPdf] = useState(false);

  // Función para traducir estados
  const traducirEstado = (estado) => {
    if (!estado) return 'Pendiente';
    const estadoLower = estado.toLowerCase();
    switch (estadoLower) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      case 'processing': return 'Procesando';
      case 'failed': return 'Fallido';
      case 'cancelled': return 'Cancelado';
      case 'on-hold':
      case 'pendiente de pago': return 'Pendiente de pago';
      case 'waiting': return 'En espera';
      case 'default': return 'Pendiente';
      case 'pendiente':
      case 'completado':
      case 'procesando':
      case 'fallido':
      case 'cancelado':
      case 'en espera': return estado.charAt(0).toUpperCase() + estado.slice(1);
      default: return 'Pendiente';
    }
  };

  // Formatear precios en pesos colombianos
  const formatoPesosColombiano = (valor) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(valor);
  };

  // Cargar datos del usuario desde localStorage
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
    const roleLower = userData.role ? userData.role.toLowerCase() : '';
    if (roleLower === 'administrador' || roleLower === 'admin' ||
      roleLower === 'profesor' || roleLower === 'teacher') {
      return true;
    }
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
        setAllCertificados(data);
        if (userData && userData.email && !isAdminOrTeacher()) {
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
    if (userData) {
      fetchCertificados();
    }
  }, [userData]);

  // Aplicar filtros y búsqueda
  useEffect(() => {
    if (!certificados.length) return;
    let resultado = [...certificados];
    if (filtroEstado !== 'todos') {
      resultado = resultado.filter(cert => {
        const estadoTraducido = traducirEstado(cert.estado);
        return estadoTraducido === filtroEstado || cert.estado === filtroEstado;
      });
    }
    if (filtroTipoId !== 'todos') {
      resultado = resultado.filter(cert => cert.tipo_identificacion === filtroTipoId);
    }
    if (filtroTipoCert !== 'todos') {
      resultado = resultado.filter(cert => cert.tipo_certificado === filtroTipoCert);
    }
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
    setPage(0);
  }, [certificados, filtroEstado, filtroTipoId, filtroTipoCert, busqueda]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenPagoDialog = (certificado) => {
    setCertificadoSeleccionado(certificado);
    setOpenPagoDialog(true);
  };

  const handleClosePagoDialog = () => {
    setOpenPagoDialog(false);
  };

  // Verificar si el certificado está completado
  const isCertificadoCompletado = (certificado) => {
    if (!certificado || !certificado.estado) return false;
    const estado = certificado.estado.toLowerCase();
    return estado === 'completado' || estado === 'completed';
  };

  const handleDownloadCertificado = async (certificado) => {
    if (!certificado) return;
    try {
      setLoadingPdf(true);
      await certificateService.descargarCertificado(certificado);
      setSnackbar({
        open: true,
        message: 'Certificado descargado con éxito',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error al descargar certificado:', error);
      setSnackbar({
        open: true,
        message: 'Error al descargar el certificado. Inténtelo de nuevo más tarde.',
        severity: 'error'
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleViewCertificado = async (certificado) => {
    if (!certificado) return;
    try {
      setLoadingPdf(true);
      await certificateService.verCertificado(certificado);
    } catch (error) {
      console.error('Error al ver certificado:', error);
      setSnackbar({
        open: true,
        message: 'Error al visualizar el certificado. Inténtelo de nuevo más tarde.',
        severity: 'error'
      });
    } finally {
      setLoadingPdf(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  const getEstadoChipColor = (estado) => {
    const estadoTraducido = traducirEstado(estado);
    switch (estadoTraducido) {
      case 'Pendiente':
      case 'Pendiente de pago':
      case 'En espera': return 'warning';
      case 'Completado': return 'success';
      case 'Procesando': return 'info';
      case 'Fallido':
      case 'Cancelado': return 'error';
      default: return 'default';
    }
  };

  const getPrecioCertificado = (tipoCertificado) => {
    switch (tipoCertificado) {
      case 'Certificado de Notas':
      case 'Certificado de notas': return 10000;
      case 'Certificado de Asistencia':
      case 'Certificado de asistencia': return 12000;
      case 'Certificado General':
      case 'Certificado general': return 20000;
      default: return 10000;
    }
  };

  const getCertificadoPaymentLink = (tipoCertificado) => {
    let url = '', label = '';
    const tipo = tipoCertificado.toLowerCase();
    if (tipo.includes('asistencia')) {
      url = 'http://certificados.ecafescuela.com/producto/certificado-de-conducta/';
      label = 'Pagar Certificado de Conducta';
    } else if (tipo.includes('basico') || tipo.includes('general')) {
      url = 'http://certificados.ecafescuela.com/producto/certificado-basico/';
      label = 'Pagar Certificado Básico';
    } else if (tipo.includes('notas')) {
      url = 'http://certificados.ecafescuela.com/producto/certificado-de-notas/';
      label = 'Pagar Certificado de Notas';
    } else {
      url = 'http://certificados.ecafescuela.com/tienda/';
      label = 'Ir a la Tienda de Certificados';
    }
    return (
      <Button
        variant="contained"
        fullWidth
        startIcon={<PaymentIcon />}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          bgcolor: '#CE0A0A',
          borderRadius: 2,
          py: 1.5,
          '&:hover': { bgcolor: '#b00909' }
        }}
      >
        {label}
      </Button>
    );
  };

  // Listas para filtros
  const estados = certificados.length
    ? ['todos', ...new Set(certificados.map(cert => traducirEstado(cert.estado)).filter(Boolean))]
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
              <Typography variant="h5" sx={{ color: '#CE0A0A', fontWeight: 600 }}>
                Consulta de Certificados
              </Typography>
              {userData && userData.email && !isAdminOrTeacher() && (
                <Chip
                  icon={<EmailIcon />}
                  label={`Mostrando certificados para: ${userData.email}`}
                  color="primary"
                  variant="outlined"
                  sx={{
                    borderColor: '#CE0A0A',
                    color: '#CE0A0A',
                    '& .MuiChip-icon': { color: '#CE0A0A' }
                  }}
                />
              )}
            </Box>
            {userData && isAdminOrTeacher() && (
              <Alert
                severity="info"
                icon={<InfoIcon />}
                sx={{
                  mb: 3,
                  backgroundColor: alpha('#CE0A0A', 0.05),
                  color: '#CE0A0A',
                  '& .MuiAlert-icon': { color: '#CE0A0A' }
                }}
              >
                <Typography variant="body2">
                  Como administrador o profesor, puede ver todos los certificados en el sistema, independientemente del correo electrónico asociado.
                </Typography>
              </Alert>
            )}
            <Divider sx={{ mb: 4 }} />
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
                    <FormControl fullWidth variant="outlined">
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
                    <FormControl fullWidth variant="outlined">
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
                    <FormControl fullWidth variant="outlined">
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
                    '&:hover': { bgcolor: '#b00909' }
                  }}
                >
                  Buscar
                </Button>
              </Grid>
            </Grid>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
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
                            <TableCell>{new Date(certificado.created_at).toLocaleDateString('es-ES')}</TableCell>
                            <TableCell>
                              <Chip
                                label={traducirEstado(certificado.estado)}
                                color={getEstadoChipColor(certificado.estado)}
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
                                {(!certificado.estado ||
                                  traducirEstado(certificado.estado).toLowerCase() === 'pendiente' ||
                                  traducirEstado(certificado.estado).toLowerCase() === 'pendiente de pago') && (
                                  <Button
                                    variant="contained"
                                    size="small"
                                    startIcon={<AttachMoneyIcon />}
                                    onClick={() => handleOpenPagoDialog(certificado)}
                                    sx={{
                                      bgcolor: '#4CAF50',
                                      '&:hover': { bgcolor: '#388E3C' }
                                    }}
                                  >
                                    Pagar
                                  </Button>
                                )}
                                {isCertificadoCompletado(certificado) && (
                                  <>
                                    <Tooltip title="Ver certificado">
                                      <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleViewCertificado(certificado)}
                                      >
                                        <VisibilityIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Descargar certificado">
                                      <IconButton
                                        size="small"
                                        color="success"
                                        onClick={() => handleDownloadCertificado(certificado)}
                                      >
                                        <DownloadIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Imprimir certificado">
                                      <IconButton
                                        size="small"
                                        color="default"
                                        onClick={() => window.print()}
                                      >
                                        <PrintIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
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
      <Dialog
        open={openPagoDialog}
        onClose={handleClosePagoDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 2 } }}
      >
        <DialogTitle
          sx={{
            bgcolor: alpha('#CE0A0A', 0.05),
            pb: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#CE0A0A' }}>
            <CreditCardIcon sx={{ mr: 1 }} />
            Realizar Pago
          </Box>
          <IconButton
            aria-label="close"
            onClick={handleClosePagoDialog}
            sx={{ color: '#CE0A0A', '&:hover': { bgcolor: alpha('#CE0A0A', 0.1) } }}
          >
            <CloseIcon />
          </IconButton>
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
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body1" sx={{ mr: 2 }}>
                    #{certificadoSeleccionado.id}
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    sx={{
                      borderRadius: 1,
                      fontSize: '0.7rem',
                      borderColor: '#CE0A0A',
                      color: '#CE0A0A',
                      '&:hover': { borderColor: '#b00909', bgcolor: alpha('#CE0A0A', 0.05) }
                    }}
                    onClick={() => {
                      navigator.clipboard.writeText(`#${certificadoSeleccionado.id}`);
                      setSnackbar({
                        open: true,
                        message: 'Referencia copiada al portapapeles',
                        severity: 'success'
                      });
                    }}
                  >
                    Copiar referencia
                  </Button>
                </Box>
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
                  Estado:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {traducirEstado(certificadoSeleccionado.estado)}
                </Typography>
                <Typography variant="subtitle2" color="textSecondary">
                  Valor a pagar:
                </Typography>
                <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
                  {formatoPesosColombiano(getPrecioCertificado(certificadoSeleccionado.tipo_certificado))}
                </Typography>
              </Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  IMPORTANTE:
                </Typography>
                <Typography variant="body2">
                  - Es <strong>obligatorio</strong> ingresar el número de referencia (#{certificadoSeleccionado.id}) en el formulario de pago.
                </Typography>
                <Typography variant="body2">
                  - Utilice exactamente la misma información personal que ingresó aquí (nombre, apellido, correo, etc.).
                </Typography>
              </Alert>
              <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 2 }}>
                Seleccione el enlace de pago correspondiente:
              </Typography>
              {getCertificadoPaymentLink(certificadoSeleccionado.tipo_certificado)}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        action={
          <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      {loadingPdf && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress sx={{ color: '#fff' }} />
          <Typography variant="body1" sx={{ color: '#fff', fontWeight: 'medium' }}>
            Generando certificado...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default ConsultarCertificados;
