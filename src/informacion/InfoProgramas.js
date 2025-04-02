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

  // Estado para expandir/collapse de materias en cada programa
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [materiasByProgram, setMateriasByProgram] = useState({});

  // Modal para estudiantes a nivel de programa (agrupados)
  const [openProgramModal, setOpenProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programStudents, setProgramStudents] = useState([]);

  // Modal para estudiantes de una materia específica (con notas y periodos)
  const [openMateriaModal, setOpenMateriaModal] = useState(false);
  const [selectedMateria, setSelectedMateria] = useState(null);
  const [materiaStudents, setMateriaStudents] = useState([]);
  const [loadingMateriaStudents, setLoadingMateriaStudents] = useState(false);

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

  // Toggle expand/collapse para materias de un programa
  const toggleExpandProgram = async (programId) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
    // Si se expande y no se han cargado las materias, hacer la consulta
    if (!expandedPrograms[programId] && !materiasByProgram[programId]) {
      try {
        const res = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${programId}/materias`);
        setMateriasByProgram(prev => ({ ...prev, [programId]: res.data }));
      } catch (err) {
        console.error('❌ Error al obtener materias para el programa:', err);
        setSnackbar({ open: true, message: 'Error al cargar materias', severity: 'error' });
      }
    }
  };

  // Modal para estudiantes asociados a un programa (agrupados)
  const handleOpenProgramModal = (program) => {
    setSelectedProgram(program);
    setOpenProgramModal(true);
    axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${program.id_programa}/estudiantes`)
      .then(res => {
        // Agrupar estudiantes: que cada estudiante aparezca una sola vez y listar materias asociadas
        const agrupados = {};
        res.data.forEach(item => {
          const key = item.numero_documento;
          if (!agrupados[key]) {
            agrupados[key] = { ...item, materias: [] };
          }
          if (item.materia && !agrupados[key].materias.includes(item.materia)) {
            agrupados[key].materias.push(item.materia);
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

  // Modal para estudiantes de una materia específica (con notas y periodos)
  const handleOpenMateriaModal = (materia) => {
    setSelectedMateria(materia);
    setOpenMateriaModal(true);
    setLoadingMateriaStudents(true);
    axios.get(`https://webhook-ecaf-production.up.railway.app/api/materias/${materia.id_materia}/estudiantes`)
      .then(res => {
        setMateriaStudents(res.data);
        setLoadingMateriaStudents(false);
      })
      .catch(err => {
        console.error('❌ Error al obtener estudiantes de la materia:', err);
        setSnackbar({ open: true, message: 'Error al cargar estudiantes de la materia', severity: 'error' });
        setLoadingMateriaStudents(false);
      });
  };

  const handleCloseMateriaModal = () => {
    setOpenMateriaModal(false);
    setSelectedMateria(null);
    setMateriaStudents([]);
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Tipo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((prog) => [
                      <TableRow key={`prog-${prog.id_programa}`} hover>
                        <TableCell>
                          <IconButton size="small" onClick={() => toggleExpandProgram(prog.id_programa)}>
                            {expandedPrograms[prog.id_programa] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                          </IconButton>
                        </TableCell>
                        <TableCell>{prog.nombre}</TableCell>
                        <TableCell>{prog.tipo}</TableCell>
                        <TableCell>{prog.estado}</TableCell>
                        <TableCell>{prog.descripcion}</TableCell>
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
                      <TableRow key={`collapse-${prog.id_programa}`}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedPrograms[prog.id_programa]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, color: '#CE0A0A', fontWeight: 'bold' }}>
                                Materias
                              </Typography>
                              {materiasByProgram[prog.id_programa] && materiasByProgram[prog.id_programa].length > 0 ? (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Descripción</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {materiasByProgram[prog.id_programa].map((mat) => (
                                      <TableRow key={mat.id_materia} hover>
                                        <TableCell>{mat.nombre}</TableCell>
                                        <TableCell>{mat.descripcion}</TableCell>
                                        <TableCell>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenMateriaModal(mat)}
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
                                <Alert severity="info">No se encontraron materias para este programa.</Alert>
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
      {/* Modal para estudiantes del programa (agrupados) */}
      <Dialog open={openProgramModal} onClose={handleCloseProgramModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'rgba(206, 10, 10, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
            Estudiantes del programa: {selectedProgram?.nombre}
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Materias</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programStudents.map((stud, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{`${stud.tipo_documento} - ${stud.numero_documento}`}</TableCell>
                      <TableCell>{`${stud.nombres} ${stud.apellidos}`}</TableCell>
                      <TableCell>{stud.materias.join(', ')}</TableCell>
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
      {/* Modal para estudiantes de una materia (con notas y periodos) */}
      <Dialog open={openMateriaModal} onClose={handleCloseMateriaModal} fullWidth maxWidth="md">
        <DialogTitle sx={{ bgcolor: 'rgba(206, 10, 10, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
            Estudiantes de la materia: {selectedMateria?.nombre}
          </Typography>
          <IconButton onClick={handleCloseMateriaModal} sx={{ color: '#CE0A0A' }}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {loadingMateriaStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : materiaStudents.length === 0 ? (
            <Alert severity="info">No se encontraron estudiantes para esta materia.</Alert>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Nota</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Periodo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {materiaStudents.map((stud, idx) => (
                    <TableRow key={idx} hover>
                      <TableCell>{`${stud.tipo_documento} - ${stud.numero_documento}`}</TableCell>
                      <TableCell>{`${stud.nombres} ${stud.apellidos}`}</TableCell>
                      <TableCell>{stud.nota}</TableCell>
                      <TableCell>{stud.periodo}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMateriaModal} sx={{ color: '#CE0A0A' }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoProgramas;
