import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  TablePagination,
  Alert,
  IconButton,
  Snackbar,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  Stack,
  useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import Navbar from '../components/Navbar';

const InfoDiplomas = () => {
  const [diplomas, setDiplomas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [selectedDiploma, setSelectedDiploma] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    fetchDiplomas();
  }, []);

  const fetchDiplomas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://webhook-ecaf-production.up.railway.app/api/diplomas');
      setDiplomas(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al cargar diplomas', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false });

  const handleRowClick = async (id) => {
    setModalLoading(true);
    setModalOpen(true);
    try {
      const res = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/diplomas/${id}`);
      setSelectedDiploma(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al cargar información del diploma', severity: 'error' });
      setSelectedDiploma(null);
    } finally {
      setModalLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDiploma(null);
  };

  // Helpers para chips y colores
  const getTipoDiplomaColor = (tipo) => {
    if (!tipo) return 'default';
    if (tipo.toLowerCase().includes('especial')) return 'secondary';
    if (tipo.toLowerCase().includes('honor')) return 'success';
    return 'primary';
  };
  const getEstadoColor = (estado) => {
    if (!estado) return 'default';
    if (estado.toLowerCase() === 'habilitado') return 'success';
    if (estado.toLowerCase() === 'pendiente') return 'warning';
    if (estado.toLowerCase() === 'anulado') return 'error';
    return 'info';
  };

  return (
    <Box sx={{ bgcolor: '#f6f7fb', minHeight: '100vh', py: 3 }}>
      <Navbar pageTitle="Diplomas" />
      <Container maxWidth="xl">
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: '#CE0A0A', width: 48, height: 48, mr: 2 }}>
              <WorkspacePremiumIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: '#CE0A0A', fontWeight: 700 }}>
                Diplomas habilitados
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Consulta los estudiantes habilitados y la información de sus diplomas
              </Typography>
            </Box>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : diplomas.length === 0 ? (
            <Alert severity="info">No se encontraron diplomas.</Alert>
          ) : (
            <>
              <TableContainer sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(206,10,10,0.04)' }}>
                <Table size="small" sx={{ minWidth: 900 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.07)' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Referencia</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Nombre</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Apellido</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Tipo Identificación</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Número Identificación</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Tipo de Diploma</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Nombre Tipo Diploma</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Estado</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }} align="center">Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {diplomas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((diploma, idx) => (
                      <TableRow
                        key={diploma.id}
                        hover
                        sx={{
                          backgroundColor: idx % 2 === 0 ? '#fff' : 'rgba(206,10,10,0.025)',
                          transition: 'background 0.2s',
                          '&:hover': {
                            backgroundColor: 'rgba(206,10,10,0.09)'
                          }
                        }}
                      >
                        <TableCell>{diploma.referencia}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{diploma.nombre}</TableCell>
                        <TableCell>{diploma.apellido}</TableCell>
                        <TableCell>{diploma.tipo_identificacion}</TableCell>
                        <TableCell>{diploma.numero_identificacion}</TableCell>
                        <TableCell>
                          <Chip
                            label={diploma.tipo_diploma}
                            color={getTipoDiplomaColor(diploma.tipo_diploma)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.85rem', bgcolor: '#FDEAEA', color: '#CE0A0A' }}
                          />
                        </TableCell>
                        <TableCell>{diploma.nombre_tipo_diploma}</TableCell>
                        <TableCell>
                          <Chip
                            label={diploma.estado || 'Desconocido'}
                            color={getEstadoColor(diploma.estado)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleRowClick(diploma.id)}
                            sx={{
                              bgcolor: '#CE0A0A',
                              color: '#fff',
                              fontWeight: 600,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(206,10,10,0.08)',
                              '&:hover': { bgcolor: '#b00909' }
                            }}
                          >
                            Ver Detalles
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={diplomas.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                sx={{ mt: 2 }}
              />
            </>
          )}
        </Paper>
      </Container>
      {/* Snackbar para notificaciones */}
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
      {/* Modal para información completa del diploma */}
      <Dialog open={modalOpen} onClose={handleCloseModal} fullWidth maxWidth="md" TransitionProps={{ appear: true }}>
        <DialogTitle sx={{
          bgcolor: 'rgba(206, 10, 10, 0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 0
        }}>
          <Avatar sx={{ bgcolor: '#CE0A0A', width: 44, height: 44 }}>
            <WorkspacePremiumIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold', lineHeight: 1.2 }}>
              {selectedDiploma?.nombre} {selectedDiploma?.apellido}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {selectedDiploma?.tipo_diploma && (
                <Chip
                  label={selectedDiploma.tipo_diploma}
                  color={getTipoDiplomaColor(selectedDiploma.tipo_diploma)}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                />
              )}
              {selectedDiploma?.estado && (
                <Chip
                  label={selectedDiploma.estado}
                  color={getEstadoColor(selectedDiploma.estado)}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                />
              )}
              {selectedDiploma?.modalidad && (
                <Chip
                  label={selectedDiploma.modalidad}
                  color="info"
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                />
              )}
            </Stack>
          </Box>
          <Box flex={1} />
          <IconButton onClick={handleCloseModal} sx={{ color: '#CE0A0A', ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ bgcolor: '#f9f9fb', p: { xs: 2, md: 4 } }}>
          {modalLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : selectedDiploma ? (
            <Box>
              <TableContainer sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(206,10,10,0.04)' }}>
                <Table size="small">
                  <TableBody>
                    {Object.entries(selectedDiploma).map(([key, value], idx) => (
                      key !== 'valor' && key !== 'valor_cop' && key !== 'nombre' && key !== 'apellido' && key !== 'tipo_diploma' && key !== 'estado' && key !== 'modalidad' && (
                        <TableRow
                          key={key}
                          sx={{
                            backgroundColor: idx % 2 === 0 ? '#fff' : 'rgba(206,10,10,0.025)',
                            '&:last-child td': { borderBottom: 0 }
                          }}
                        >
                          <TableCell sx={{ fontWeight: 'bold', textTransform: 'capitalize', width: 180 }}>
                            {key.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>{String(value)}</TableCell>
                        </TableRow>
                      )
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Alert severity="info">No se pudo cargar la información del diploma.</Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#f9f9fb', p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#CE0A0A', fontWeight: 600, borderRadius: 2, px: 3, py: 1 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoDiplomas; 