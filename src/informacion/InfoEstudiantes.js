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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
  // Estados para el modal de detalles
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  // Estado para guardar los datos procesados y agrupados
  const [datosAgrupados, setDatosAgrupados] = useState({});

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
    setDatosAgrupados({});
  };

  // Función para agrupar los datos por programa y módulo
  const procesarDatosEstudiante = (datos) => {
    const programas = {};
    
    datos.forEach(item => {
      const programaKey = item.Nombre_programa;
      const moduloKey = item.Nombre_modulo || 'Sin módulo';
      
      // Si el programa no existe, lo inicializamos
      if (!programas[programaKey]) {
        programas[programaKey] = {};
      }
      
      // Si el módulo no existe en el programa, lo inicializamos
      if (!programas[programaKey][moduloKey]) {
        programas[programaKey][moduloKey] = [];
      }
      
      // Agregamos la asignatura al módulo correspondiente
      programas[programaKey][moduloKey].push({
        nombre: item.Nombre_asignatura,
        nota: Number(item.Nota_Final) // Convertir a número aquí
      });
    });
    
    return programas;
  };

  useEffect(() => {
    if (selectedStudent && openModal) {
      setLoadingDetails(true);
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/estudiantes/${selectedStudent.numero_documento}/asignaciones`)
        .then(res => {
          setStudentDetails(res.data);
          // Procesamos y agrupamos los datos
          const datosProc = procesarDatosEstudiante(res.data);
          setDatosAgrupados(datosProc);
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

  // Función para obtener el color de la nota
  const getNotaColor = (nota) => {
    if (nota >= 4.5) return '#4CAF50'; // Verde
    if (nota >= 3.5) return '#8BC34A'; // Verde claro
    if (nota >= 3.0) return '#FFC107'; // Amarillo
    return '#F44336'; // Rojo
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
                              Ver Detalles
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
      {/* Modal para ver detalles utilizando Accordion de Material UI */}
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
                Asignaciones para: {selectedStudent && `${selectedStudent.nombres} ${selectedStudent.apellidos}`}
              </Typography>
              
              {/* Cabecera para la sección de Programas */}
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
                  Programas
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Haz clic en un programa para ver sus módulos
                </Typography>
              </Box>

              {/* Programas (primer nivel) */}
              {Object.keys(datosAgrupados).map((programa, indexPrograma) => (
                <Accordion key={`programa-${indexPrograma}`} sx={{ mb: 1 }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      bgcolor: 'rgba(206, 10, 10, 0.05)', 
                      '&:hover': { bgcolor: 'rgba(206, 10, 10, 0.1)' },
                      '&.Mui-expanded': { bgcolor: 'rgba(206, 10, 10, 0.1)' }
                    }}
                  >
                    <Typography sx={{ fontWeight: 'bold' }}>{programa}</Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 0, pt: 1 }}>
                    {/* Cabecera para la sección de Módulos */}
                    <Box sx={{ p: 2, bgcolor: 'rgba(206, 10, 10, 0.02)' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#CE0A0A' }}>
                        Módulos
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Haz clic en un módulo para ver sus asignaturas
                      </Typography>
                    </Box>
                    
                    {/* Módulos (segundo nivel) */}
                    {Object.keys(datosAgrupados[programa]).map((modulo, indexModulo) => (
                      <Accordion 
                        key={`modulo-${indexPrograma}-${indexModulo}`} 
                        disableGutters
                        sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}
                      >
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          sx={{ 
                            pl: 3, 
                            bgcolor: 'rgba(206, 10, 10, 0.02)', 
                            '&:hover': { bgcolor: 'rgba(206, 10, 10, 0.05)' },
                            '&.Mui-expanded': { bgcolor: 'rgba(206, 10, 10, 0.05)' }
                          }}
                        >
                          <Typography sx={{ fontWeight: '500' }}>{modulo}</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 0 }}>
                          {/* Tabla de asignaturas y notas */}
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.03)' }}>
                                  <TableCell sx={{ fontWeight: 'bold', pl: 6 }}>Asignatura</TableCell>
                                  <TableCell sx={{ fontWeight: 'bold' }}>Nota Final</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {datosAgrupados[programa][modulo].map((asignatura, indexAsignatura) => (
                                  <TableRow key={`asignatura-${indexPrograma}-${indexModulo}-${indexAsignatura}`} hover>
                                    <TableCell sx={{ pl: 6 }}>{asignatura.nombre}</TableCell>
                                    <TableCell>
                                      <Box 
                                        sx={{ 
                                          display: 'inline-block',
                                          px: 2, 
                                          py: 0.5, 
                                          borderRadius: 1,
                                          fontWeight: 'bold',
                                          bgcolor: getNotaColor(asignatura.nota) + '10', // Agregar transparencia
                                          color: getNotaColor(asignatura.nota),
                                          border: `1px solid ${getNotaColor(asignatura.nota)}30`
                                        }}
                                      >
                                        {asignatura.nota.toFixed(2)}
                                      </Box>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseModal} 
            sx={{ 
              color: '#CE0A0A',
              '&:hover': { bgcolor: 'rgba(206, 10, 10, 0.05)' }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoEstudiantes;