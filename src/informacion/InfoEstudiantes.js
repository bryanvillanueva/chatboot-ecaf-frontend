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
  Divider,
  Chip,
  Avatar,
  Stack
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import Navbar from '../components/Navbar';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import InputAdornment from '@mui/material/InputAdornment';
import SearchIcon from '@mui/icons-material/Search';

const InfoEstudiantes = () => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });
  const [openModal, setOpenModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentDetails, setStudentDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [datosAgrupados, setDatosAgrupados] = useState({});
  const [search, setSearch] = useState('');
  const [filterTipoDoc, setFilterTipoDoc] = useState('');
  const [filterGenero, setFilterGenero] = useState('');
  const [filterCiudad, setFilterCiudad] = useState('');
  const [filterEstado, setFilterEstado] = useState('');

  useEffect(() => { fetchEstudiantes(); }, []);

  const fetchEstudiantes = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://webhook-ecaf-production.up.railway.app/api/estudiantes');
      setEstudiantes(res.data);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error al cargar estudiantes', severity: 'error' });
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

  const procesarDatosEstudiante = (datos) => {
    const programas = {};
    datos.forEach(item => {
      const programaKey = item.Nombre_programa;
      const moduloKey = item.Nombre_modulo || 'Sin módulo';
      if (!programas[programaKey]) programas[programaKey] = {};
      if (!programas[programaKey][moduloKey]) programas[programaKey][moduloKey] = [];
      programas[programaKey][moduloKey].push({ nombre: item.Nombre_asignatura, nota: Number(item.Nota_Final) });
    });
    return programas;
  };

  useEffect(() => {
    if (selectedStudent && openModal) {
      setLoadingDetails(true);
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/estudiantes/${selectedStudent.numero_documento}/asignaciones`)
        .then(res => {
          setStudentDetails(res.data);
          setDatosAgrupados(procesarDatosEstudiante(res.data));
          setLoadingDetails(false);
        })
        .catch(() => {
          setLoadingDetails(false);
          setSnackbar({ open: true, message: 'Error al cargar detalles del estudiante', severity: 'error' });
        });
    }
  }, [selectedStudent, openModal]);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  // Modern helpers
  const getGeneroColor = (genero) => {
    if (!genero) return 'default';
    if (genero.toLowerCase().startsWith('m')) return 'primary';
    if (genero.toLowerCase().startsWith('f')) return 'secondary';
    return 'info';
  };

  // Obtener valores únicos para los selects
  const uniqueTipoDoc = Array.from(new Set(estudiantes.map(e => e.tipo_documento).filter(Boolean)));
  const uniqueGenero = Array.from(new Set(estudiantes.map(e => e.genero).filter(Boolean)));
  const uniqueCiudad = Array.from(new Set(estudiantes.map(e => e.ciudad).filter(Boolean)));

  // Filtrado y búsqueda combinados
  const filteredEstudiantes = estudiantes.filter(e => {
    // Filtros
    if (filterTipoDoc && e.tipo_documento !== filterTipoDoc) return false;
    if (filterGenero && e.genero !== filterGenero) return false;
    if (filterCiudad && e.ciudad !== filterCiudad) return false;
    // Buscador
    if (search) {
      const s = search.toLowerCase();
      return (
        (e.id_estudiante && String(e.id_estudiante).toLowerCase().includes(s)) ||
        (e.tipo_documento && e.tipo_documento.toLowerCase().includes(s)) ||
        (e.numero_documento && String(e.numero_documento).toLowerCase().includes(s)) ||
        (e.nombres && e.nombres.toLowerCase().includes(s)) ||
        (e.apellidos && e.apellidos.toLowerCase().includes(s)) ||
        (e.email && e.email.toLowerCase().includes(s)) ||
        (e.telefono && String(e.telefono).toLowerCase().includes(s)) ||
        (e.direccion && e.direccion.toLowerCase().includes(s)) ||
        (e.ciudad && e.ciudad.toLowerCase().includes(s))
      );
    }
    return true;
  });

  return (
    <Box sx={{ bgcolor: '#f6f7fb', minHeight: '100vh', py: 3 }}>
      <Navbar pageTitle="Información de Estudiantes" />
      <Container maxWidth="xl">
        <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3, boxShadow: '0 4px 24px rgba(0,0,0,0.07)' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: '#CE0A0A', width: 48, height: 48, mr: 2 }}>
              <SchoolIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Avatar>
            <Box>
              <Typography variant="h5" sx={{ color: '#CE0A0A', fontWeight: 700 }}>
                Información de Estudiantes
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Consulta los datos y asignaciones de los estudiantes
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField
              label="Buscar"
              variant="outlined"
              size="small"
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{ minWidth: 220 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              select
              label="Tipo Documento"
              value={filterTipoDoc}
              onChange={e => setFilterTipoDoc(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {uniqueTipoDoc.map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Género"
              value={filterGenero}
              onChange={e => setFilterGenero(e.target.value)}
              size="small"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {uniqueGenero.map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Ciudad"
              value={filterCiudad}
              onChange={e => setFilterCiudad(e.target.value)}
              size="small"
              sx={{ minWidth: 180 }}
            >
              <MenuItem value="">Todas</MenuItem>
              {uniqueCiudad.map(val => (
                <MenuItem key={val} value={val}>{val}</MenuItem>
              ))}
            </TextField>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : estudiantes.length === 0 ? (
            <Alert severity="info">No se encontraron estudiantes.</Alert>
          ) : (
            <>
              <TableContainer sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(206,10,10,0.04)' }}>
                <Table sx={{ minWidth: 1000 }} size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.07)' }}>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>ID</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Tipo Documento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Número Documento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Nombres</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Apellidos</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Fecha Nacimiento</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Género</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Teléfono</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Dirección</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }}>Ciudad</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', fontSize: '1rem' }} align="center">Acción</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEstudiantes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((est, idx) => (
                      <TableRow
                        key={est.id_estudiante}
                        hover
                        sx={{
                          backgroundColor: idx % 2 === 0 ? '#fff' : 'rgba(206,10,10,0.025)',
                          transition: 'background 0.2s',
                          '&:hover': { backgroundColor: 'rgba(206,10,10,0.09)' }
                        }}
                      >
                        <TableCell>{est.id_estudiante}</TableCell>
                        <TableCell>{est.tipo_documento}</TableCell>
                        <TableCell>{est.numero_documento}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{est.nombres}</TableCell>
                        <TableCell>{est.apellidos}</TableCell>
                        <TableCell>{formatDate(est.fecha_nacimiento)}</TableCell>
                        <TableCell>
                          <Chip
                            label={est.genero}
                            color={getGeneroColor(est.genero)}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                          />
                        </TableCell>
                        <TableCell>{est.email}</TableCell>
                        <TableCell>{est.telefono}</TableCell>
                        <TableCell>{est.direccion}</TableCell>
                        <TableCell>{est.ciudad}</TableCell>
                        <TableCell align="center">
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenModal(est)}
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
                rowsPerPageOptions={[10, 15, 25, 50, 100]}
                component="div"
                count={filteredEstudiantes.length}
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
      <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="md" TransitionProps={{ appear: true }}>
        <DialogTitle sx={{
          bgcolor: 'rgba(206, 10, 10, 0.07)',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          pb: 0
        }}>
          <Avatar sx={{ bgcolor: '#CE0A0A', width: 44, height: 44 }}>
            <SchoolIcon sx={{ color: '#fff', fontSize: 28 }} />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold', lineHeight: 1.2 }}>
              {selectedStudent && `${selectedStudent.nombres} ${selectedStudent.apellidos}`}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              {selectedStudent?.genero && (
                <Chip
                  label={selectedStudent.genero}
                  color={getGeneroColor(selectedStudent.genero)}
                  size="small"
                  sx={{ fontWeight: 600, fontSize: '0.85rem' }}
                />
              )}
              {selectedStudent?.tipo_documento && (
                <Chip
                  label={selectedStudent.tipo_documento}
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
              <Box sx={{ mb: 2, mt: 1 }}>
                <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
                  Programas
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Haz clic en un programa para ver sus módulos
                </Typography>
              </Box>
              {Object.keys(datosAgrupados).map((programa, indexPrograma) => (
                <Accordion key={`programa-${indexPrograma}`} sx={{ mb: 1, borderRadius: 2, boxShadow: '0 2px 8px rgba(206,10,10,0.04)' }}>
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
                    <Box sx={{ p: 2, bgcolor: 'rgba(206, 10, 10, 0.02)' }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#CE0A0A' }}>
                        Módulos
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Haz clic en un módulo para ver sus asignaturas
                      </Typography>
                    </Box>
                    {Object.keys(datosAgrupados[programa]).map((modulo, indexModulo) => (
                      <Accordion
                        key={`modulo-${indexPrograma}-${indexModulo}`}
                        disableGutters
                        sx={{ boxShadow: 'none', '&:before': { display: 'none' }, borderRadius: 2 }}
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
                                  <TableRow
                                    key={`asignatura-${indexPrograma}-${indexModulo}-${indexAsignatura}`}
                                    hover
                                    sx={{
                                      backgroundColor: indexAsignatura % 2 === 0 ? '#fff' : 'rgba(206,10,10,0.025)',
                                      '&:last-child td': { borderBottom: 0 }
                                    }}
                                  >
                                    <TableCell sx={{ pl: 6 }}>{asignatura.nombre}</TableCell>
                                    <TableCell>
                                      <Box
                                        sx={{
                                          display: 'inline-block',
                                          px: 2,
                                          py: 0.5,
                                          borderRadius: 1,
                                          fontWeight: 'bold',
                                          bgcolor: asignatura.nota >= 4.5 ? '#4CAF5010' : asignatura.nota >= 3.5 ? '#8BC34A10' : asignatura.nota >= 3.0 ? '#FFC10710' : '#F4433610',
                                          color: asignatura.nota >= 4.5 ? '#4CAF50' : asignatura.nota >= 3.5 ? '#8BC34A' : asignatura.nota >= 3.0 ? '#FFC107' : '#F44336',
                                          border: `1px solid ${asignatura.nota >= 4.5 ? '#4CAF50' : asignatura.nota >= 3.5 ? '#8BC34A' : asignatura.nota >= 3.0 ? '#FFC107' : '#F44336'}30`
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
        <DialogActions sx={{ bgcolor: '#f9f9fb', p: 2 }}>
          <Button onClick={handleCloseModal} sx={{ color: '#CE0A0A', fontWeight: 600, borderRadius: 2, px: 3, py: 1 }}>
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InfoEstudiantes;