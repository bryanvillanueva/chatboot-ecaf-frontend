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
  Collapse,
  Divider
} from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp, Close as CloseIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';

const InfoProgramas = () => {
  // Estados principales
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Estado para expandir/collapse de asignaturas en cada programa
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [asignaturasByProgram, setAsignaturasByProgram] = useState({});

  // Modal para estudiantes a nivel de programa (agrupados)
  const [openProgramModal, setOpenProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programStudents, setProgramStudents] = useState([]);

  // Modal para estudiantes de una asignatura específica (con notas)
  const [openAsignaturaModal, setOpenAsignaturaModal] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [asignaturaStudents, setAsignaturaStudents] = useState([]);
  const [loadingAsignaturaStudents, setLoadingAsignaturaStudents] = useState(false);

  useEffect(() => {
    fetchProgramas();
  }, []);

  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://webhook-ecaf-production.up.railway.app/api/programas');
      setProgramas(res.data);
    } catch (err) {
      console.error('❌ Error al obtener programas:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar programas',
        severity: 'error'
      });
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

  // Toggle expand/collapse para asignaturas de un programa
  const toggleExpandProgram = async (programId) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
    // Si se expande y no se han cargado las asignaturas, hacer la consulta
    if (!expandedPrograms[programId] && !asignaturasByProgram[programId]) {
      try {
        const res = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${programId}/asignaturas`);
        setAsignaturasByProgram(prev => ({ ...prev, [programId]: res.data }));
      } catch (err) {
        console.error('❌ Error al obtener asignaturas para el programa:', err);
        setSnackbar({ open: true, message: 'Error al cargar asignaturas', severity: 'error' });
      }
    }
  };

  // Modal para estudiantes asociados a un programa (agrupados)
  const handleOpenProgramModal = (program) => {
    setSelectedProgram(program);
    setOpenProgramModal(true);
    axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${program.Id_Programa}/estudiantes`)
      .then(res => {
        // Agrupar estudiantes: cada estudiante aparece una sola vez, y se listan las asignaturas asociadas
        const agrupados = {};
        res.data.forEach(item => {
          const key = item.numero_documento;
          if (!agrupados[key]) {
            agrupados[key] = { ...item, asignaturas: [] };
          }
          if (item.Nombre_asignatura && !agrupados[key].asignaturas.includes(item.Nombre_asignatura)) {
            agrupados[key].asignaturas.push(item.Nombre_asignatura);
          }
        });
        setProgramStudents(Object.values(agrupados));
      })
      .catch(err => {
        console.error('❌ Error al obtener estudiantes del programa:', err);
        setSnackbar({ open: true, message: 'Error al cargar estudiantes del programa', severity: 'error' });
      });
  };

  const handleCloseProgramModal = () => {
    setOpenProgramModal(false);
    setSelectedProgram(null);
    setProgramStudents([]);
  };

  // Modal para estudiantes de una asignatura específica
  const handleOpenAsignaturaModal = (asignatura) => {
    setSelectedAsignatura(asignatura);
    setOpenAsignaturaModal(true);
    setLoadingAsignaturaStudents(true);
    axios.get(`https://webhook-ecaf-production.up.railway.app/api/asignaturas/${asignatura.Id_Asignatura}/estudiantes`)
      .then(res => {
        setAsignaturaStudents(res.data);
        setLoadingAsignaturaStudents(false);
      })
      .catch(err => {
        console.error('❌ Error al obtener estudiantes de la asignatura:', err);
        setSnackbar({ open: true, message: 'Error al cargar estudiantes de la asignatura', severity: 'error' });
        setLoadingAsignaturaStudents(false);
      });
  };

  const handleCloseAsignaturaModal = () => {
    setOpenAsignaturaModal(false);
    setSelectedAsignatura(null);
    setAsignaturaStudents([]);
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh', py: 3 }}>
      {/* Navbar */}
      <Navbar pageTitle="Programas Académicos" />
      <Container maxWidth="xl">
        <Paper sx={{ p: 4, borderRadius: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
          <Typography variant="h5" sx={{ color: '#CE0A0A', fontWeight: 600, mb: 3 }}>
            Programas Académicos
          </Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : programas.length === 0 ? (
            <Alert severity="info">No se encontraron programas.</Alert>
          ) : (
            <TableContainer>
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }} />
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Incluye Módulos</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Fechas</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((prog) => [
                      <TableRow key={`prog-${prog.Id_Programa}`} hover>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleExpandProgram(prog.Id_Programa)}>
                            {expandedPrograms[prog.Id_Programa] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{prog.Nombre_programa}</TableCell>
                        <TableCell>{prog.Incluye_Modulos ? 'Sí' : 'No'}</TableCell>
                        <TableCell>{prog.Estado}</TableCell>
                        <TableCell>
                          {prog.Fecha_Inicio_programa ? new Date(prog.Fecha_Inicio_programa).toLocaleDateString() : '-'} - {prog.Fecha_Fin_programa ? new Date(prog.Fecha_Fin_programa).toLocaleDateString() : '-'}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenProgramModal(prog)}
                            sx={{ bgcolor: '#CE0A0A', '&:hover': { bgcolor: '#b00909' }, mr: 1 }}
                          >
                            Ver Estudiantes
                          </Button>
                        </TableCell>
                      </TableRow>,
                      <TableRow key={`collapse-${prog.Id_Programa}`}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedPrograms[prog.Id_Programa]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, color: '#CE0A0A', fontWeight: 'bold' }}>
                                Asignaturas
                              </Typography>
                              {asignaturasByProgram[prog.Id_Programa] && asignaturasByProgram[prog.Id_Programa].length > 0 ? (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Módulo</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {asignaturasByProgram[prog.Id_Programa].map((asig) => (
                                      <TableRow key={asig.Id_Asignatura} hover>
                                        <TableCell>{asig.Nombre_asignatura}</TableCell>
                                        <TableCell>{asig.Nombre_modulo || '-'}</TableCell>
                                        <TableCell>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenAsignaturaModal(asig)}
                                            sx={{
                                              color: '#CE0A0A',
                                              borderColor: '#CE0A0A',
                                              '&:hover': { borderColor: '#b00909', color: '#b00909' }
                                            }}
                                          >
                                            Ver Estudiantes
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <Alert severity="info">No se encontraron asignaturas para este programa.</Alert>
                              )}
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    ])}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <TablePagination
            rowsPerPageOptions={[5, 10, 20]}
            component="div"
            count={programas.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Filas por página:"
            labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
          />
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
      {/* Modal para estudiantes del programa */}
      <Dialog open={openProgramModal} onClose={handleCloseProgramModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'rgba(206, 10, 10, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
            Estudiantes del programa: {selectedProgram?.Nombre_programa}
          </Typography>
          <IconButton onClick={handleCloseProgramModal} sx={{ color: '#CE0A0A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {programStudents.length === 0 ? (
            <Alert severity="info">No se encontraron estudiantes para este programa.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Asignaturas</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programStudents.map((stud, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{`${stud.tipo_documento} - ${stud.numero_documento}`}</TableCell>
                      <TableCell>{`${stud.nombres} ${stud.apellidos}`}</TableCell>
                      <TableCell>{stud.asignaturas.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProgramModal} sx={{ color: '#CE0A0A' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
      {/* Modal para estudiantes de una asignatura */}
      <Dialog open={openAsignaturaModal} onClose={handleCloseAsignaturaModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'rgba(206, 10, 10, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
            Estudiantes de la asignatura: {selectedAsignatura?.Nombre_asignatura}
          </Typography>
          <IconButton onClick={handleCloseAsignaturaModal} sx={{ color: '#CE0A0A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingAsignaturaStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : asignaturaStudents.length === 0 ? (
            <Alert severity="info">No se encontraron estudiantes para esta asignatura.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nota Final</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {asignaturaStudents.map((stud, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{`${stud.tipo_documento} - ${stud.numero_documento}`}</TableCell>
                      <TableCell>{`${stud.nombres} ${stud.apellidos}`}</TableCell>
                      <TableCell>{stud.Nota_Final}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAsignaturaModal} sx={{ color: '#CE0A0A' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoProgramas;
