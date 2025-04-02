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
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Navbar from '../components/Navbar';

const InfoEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  // Paginación
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  // Snackbar para errores
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });
  // Estados para el modal de detalles (programas, materias y notas)
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://webhook-ecaf-production.up.railway.app/api/estudiantes');
      setEstudiantes(res.data);
    } catch (err) {
      console.error('❌ Error al obtener estudiantes:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar estudiantes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Funciones para el modal de detalles del estudiante
  const handleOpenModal = (student) => {
    setSelectedStudent(student);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedStudent(null);
    setStudentDetails([]);
  };

  useEffect(() => {
    if (selectedStudent && openModal) {
      setLoadingDetails(true);
      // Se utiliza el número de documento del estudiante para obtener los detalles.
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/estudiantes/${selectedStudent.numero_documento}/notas`)
        .then(res => {
          setStudentDetails(res.data);
          setLoadingDetails(false);
        })
        .catch(err => {
          console.error('❌ Error al obtener detalles del estudiante:', err);
          setLoadingDetails(false);
          setSnackbar({
            open: true,
            message: 'Error al cargar detalles del estudiante',
            severity: 'error'
          });
        });
    }
  }, [selectedStudent, openModal]);

  // Función para formatear fechas
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 3 }}>
      {/* Navbar */}
      <Navbar pageTitle="Información de Estudiantes" />
      <Container maxWidth="xl">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            borderRadius: 2,
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}
        >
          <Typography variant="h5" sx={{ color: '#CE0A0A', fontWeight: 600, mb: 3 }}>
            Información de Estudiantes
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : estudiantes.length === 0 ? (
            <Alert severity="info">No se encontraron estudiantes.</Alert>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 1000 }}>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tipo Documento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Número Documento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nombres</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Apellidos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Fecha Nacimiento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Género</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Teléfono</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Dirección</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Ciudad</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {estudiantes
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((est) => (
                        <TableRow key={est.id_estudiante} hover>
                          <TableCell>{est.id_estudiante}</TableCell>
                          <TableCell>{est.tipo_documento}</TableCell>
                          <TableCell>{est.numero_documento}</TableCell>
                          <TableCell>{est.nombres}</TableCell>
                          <TableCell>{est.apellidos}</TableCell>
                          <TableCell>{formatDate(est.fecha_nacimiento)}</TableCell>
                          <TableCell>{est.genero}</TableCell>
                          <TableCell>{est.email}</TableCell>
                          <TableCell>{est.telefono}</TableCell>
                          <TableCell>{est.direccion}</TableCell>
                          <TableCell>{est.ciudad}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              size="small"
                              onClick={() => handleOpenModal(est)}
                              sx={{
                                bgcolor: '#CE0A0A',
                                '&:hover': { bgcolor: '#b00909' }
                              }}
                            >
                              Ver Programas
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                rowsPerPageOptions={[15, 30, 45]}
                component="div"
                count={estudiantes.length}
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
      </Container>
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
      {/* Modal para ver detalles (Programas, Materias y Notas) */}
      <Dialog
        open={openModal}
        onClose={handleCloseModal}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ bgcolor: 'rgba(206, 10, 10, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
            Detalles del Estudiante
          </Typography>
          <IconButton onClick={handleCloseModal} sx={{ color: '#CE0A0A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : studentDetails.length === 0 ? (
            <Alert severity="info">No se encontraron detalles para este estudiante.</Alert>
          ) : (
            <>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold', color: '#CE0A0A' }}>
                Programas, Materias y Notas para: {selectedStudent && `${selectedStudent.nombres} ${selectedStudent.apellidos}`}
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Programa</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Materia</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Nota</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Periodo</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {studentDetails.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>{item.programa}</TableCell>
                        <TableCell>{item.materia}</TableCell>
                        <TableCell>{item.nota}</TableCell>
                        <TableCell>{item.periodo}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseModal} sx={{ color: '#CE0A0A' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoEstudiantes;
