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
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Navbar from '../components/Navbar';

const InfoProgramas = () => {
  // Estados principales
  const [programas, setProgramas] = useState([]);
  const [programasAgrupados, setProgramasAgrupados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'error'
  });

  // Estado para módulos y asignaturas por programa
  const [modulosByProgram, setModulosByProgram] = useState({});
  const [asignaturasByModulo, setAsignaturasByModulo] = useState({});
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedModulos, setExpandedModulos] = useState({});
  const [loadingAsignaturas, setLoadingAsignaturas] = useState({});

  // Modal para estudiantes a nivel de programa
  const [openProgramModal, setOpenProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programStudents, setProgramStudents] = useState([]);
  const [loadingProgramStudents, setLoadingProgramStudents] = useState(false);

  // Modal para estudiantes de una asignatura específica
  const [openAsignaturaModal, setOpenAsignaturaModal] = useState(false);
  const [selectedAsignatura, setSelectedAsignatura] = useState(null);
  const [asignaturaStudents, setAsignaturaStudents] = useState([]);
  const [loadingAsignaturaStudents, setLoadingAsignaturaStudents] = useState(false);

  useEffect(() => {
    fetchProgramas();
  }, []);

  // Función para agrupar programas con el mismo nombre
  const agruparProgramas = (listaProgramas) => {
    const grupos = {};
    
    // Agrupar por nombre de programa
    listaProgramas.forEach(programa => {
      const nombrePrograma = programa.Nombre_programa;
      
      if (!grupos[nombrePrograma]) {
        grupos[nombrePrograma] = {
          Nombre_programa: nombrePrograma,
          Estado: programa.Estado,
          Incluye_Modulos: programa.Incluye_Modulos,
          Fecha_Inicio_programa: programa.Fecha_Inicio_programa,
          Fecha_Fin_programa: programa.Fecha_Fin_programa,
          // Creamos un array de IDs para mantener referencia a todos los programas con este nombre
          ids: [programa.Id_Programa]
        };
      } else {
        // Si el programa ya existe, añadimos el ID a la lista de IDs
        grupos[nombrePrograma].ids.push(programa.Id_Programa);
        
        // Si los estados son diferentes, mostramos "Varios"
        if (grupos[nombrePrograma].Estado !== programa.Estado) {
          grupos[nombrePrograma].Estado = "Varios";
        }
        
        // Actualizamos Incluye_Modulos si al menos uno tiene módulos
        if (programa.Incluye_Modulos) {
          grupos[nombrePrograma].Incluye_Modulos = true;
        }
      }
    });
    
    // Convertimos el objeto de grupos a un array
    return Object.values(grupos);
  };

  // Función para agrupar asignaturas con el mismo nombre
  const agruparAsignaturas = (listaAsignaturas) => {
    const grupos = {};
    
    // Agrupar por nombre de asignatura
    listaAsignaturas.forEach(asignatura => {
      const nombreAsignatura = asignatura.Nombre_asignatura;
      
      if (!grupos[nombreAsignatura]) {
        grupos[nombreAsignatura] = {
          ...asignatura,
          // Creamos un array de IDs para mantener referencia a todas las asignaturas con este nombre
          ids: [asignatura.Id_Asignatura]
        };
      } else {
        // Si la asignatura ya existe, añadimos el ID a la lista de IDs
        grupos[nombreAsignatura].ids.push(asignatura.Id_Asignatura);
      }
    });
    
    // Convertimos el objeto de grupos a un array
    return Object.values(grupos);
  };

  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://webhook-ecaf-production.up.railway.app/api/programas');
      setProgramas(res.data);
      
      // Agrupamos los programas con el mismo nombre
      const agrupados = agruparProgramas(res.data);
      setProgramasAgrupados(agrupados);
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

  // Función para obtener módulos y asignaturas cuando se expande un programa
  const handleExpandProgram = async (programaNombre, ids) => {
    const isExpanded = expandedPrograms[programaNombre];
    setExpandedPrograms(prev => ({
      ...prev,
      [programaNombre]: !isExpanded
    }));

    // Si se está expandiendo y no tenemos los módulos, los obtenemos
    if (!isExpanded && !modulosByProgram[programaNombre]) {
      try {
        setLoadingAsignaturas(prev => ({ ...prev, [programaNombre]: true }));
        
        // Obtenemos asignaturas para todos los IDs de programa con este nombre
        const asignaturasPromises = ids.map(id => 
          axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${id}/asignaturas`)
        );
        
        const responses = await Promise.all(asignaturasPromises);
        
        // Combinamos todas las asignaturas de todos los programas con el mismo nombre
        const todasAsignaturas = responses.flatMap(res => res.data);
        
        // Procesamos los datos para agruparlos por módulo
        const modulos = {};
        const asignaturas = {};
        
        todasAsignaturas.forEach(item => {
          const moduloKey = item.Nombre_modulo || 'Transversales';
          
          // Agrupamos módulos
          if (!modulos[moduloKey]) {
            modulos[moduloKey] = {
              id: item.Id_Modulo,
              nombre: moduloKey
            };
          }
          
          // Agrupamos asignaturas por módulo
          if (!asignaturas[moduloKey]) {
            asignaturas[moduloKey] = [];
          }
        });
        
        // Para cada módulo, agrupamos las asignaturas por nombre
        Object.keys(modulos).forEach(moduloKey => {
          // Filtrar asignaturas de este módulo
          const asignaturasDelModulo = todasAsignaturas.filter(item => 
            (item.Nombre_modulo || 'Transversales') === moduloKey
          );
          
          // Agrupar asignaturas por nombre
          const asignaturasAgrupadas = agruparAsignaturas(asignaturasDelModulo);
          
          // Guardar las asignaturas agrupadas
          asignaturas[moduloKey] = asignaturasAgrupadas;
        });
        
        setModulosByProgram(prev => ({ ...prev, [programaNombre]: modulos }));
        setAsignaturasByModulo(prev => ({ ...prev, [programaNombre]: asignaturas }));
      } catch (err) {
        console.error('❌ Error al obtener asignaturas para el programa:', err);
        setSnackbar({
          open: true,
          message: 'Error al cargar asignaturas y módulos',
          severity: 'error'
        });
      } finally {
        setLoadingAsignaturas(prev => ({ ...prev, [programaNombre]: false }));
      }
    }
  };

  // Toggle para expandir/colapsar módulos
  const handleExpandModulo = (programaNombre, moduloKey) => {
    setExpandedModulos(prev => ({
      ...prev,
      [`${programaNombre}-${moduloKey}`]: !prev[`${programaNombre}-${moduloKey}`]
    }));
  };

  // Modal para estudiantes asociados a un programa
  const handleOpenProgramModal = (program) => {
    setSelectedProgram(program);
    setOpenProgramModal(true);
    setLoadingProgramStudents(true);
    
    // Obtenemos estudiantes para todos los IDs de programa con este nombre
    Promise.all(program.ids.map(id => 
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${id}/estudiantes`)
    ))
    .then(responses => {
      // Combinamos los estudiantes de todos los programas
      const todosEstudiantes = responses.flatMap(res => res.data);
      
      // Agrupar estudiantes: cada estudiante aparece una sola vez con sus asignaturas
      const agrupados = {};
      todosEstudiantes.forEach(item => {
        const key = item.numero_documento;
        if (!agrupados[key]) {
          agrupados[key] = { ...item, asignaturas: [] };
        }
        if (item.Nombre_asignatura && !agrupados[key].asignaturas.includes(item.Nombre_asignatura)) {
          agrupados[key].asignaturas.push(item.Nombre_asignatura);
        }
      });
      
      setProgramStudents(Object.values(agrupados));
      setLoadingProgramStudents(false);
    })
    .catch(err => {
      console.error('❌ Error al obtener estudiantes del programa:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar estudiantes del programa',
        severity: 'error'
      });
      setLoadingProgramStudents(false);
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
    
    // Obtenemos estudiantes para todos los IDs de asignatura con este nombre
    Promise.all(asignatura.ids.map(id => 
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/asignaturas/${id}/estudiantes`)
    ))
    .then(responses => {
      // Combinamos los estudiantes de todas las asignaturas
      const todosEstudiantes = responses.flatMap(res => res.data);
      
      // Agrupar estudiantes por documento para evitar duplicados
      const estudiantesAgrupados = {};
      todosEstudiantes.forEach(item => {
        const key = item.numero_documento;
        if (!estudiantesAgrupados[key]) {
          estudiantesAgrupados[key] = { ...item };
        }
      });
      
      setAsignaturaStudents(Object.values(estudiantesAgrupados));
      setLoadingAsignaturaStudents(false);
    })
    .catch(err => {
      console.error('❌ Error al obtener estudiantes de la asignatura:', err);
      setSnackbar({
        open: true,
        message: 'Error al cargar estudiantes de la asignatura',
        severity: 'error'
      });
      setLoadingAsignaturaStudents(false);
    });
  };

  const handleCloseAsignaturaModal = () => {
    setOpenAsignaturaModal(false);
    setSelectedAsignatura(null);
    setAsignaturaStudents([]);
  };

  // Función para colorear la nota
  const getNotaColor = (nota) => {
    const notaNum = Number(nota);
    if (notaNum >= 4.5) return '#4CAF50'; // Verde
    if (notaNum >= 3.5) return '#8BC34A'; // Verde claro
    if (notaNum >= 3.0) return '#FFC107'; // Amarillo
    return '#F44336'; // Rojo
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
          ) : programasAgrupados.length === 0 ? (
            <Alert severity="info">No se encontraron programas.</Alert>
          ) : (
            <>
              {/* Cabecera para la sección de Programas */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Haz clic en un programa para ver sus módulos y asignaturas
                </Typography>
              </Box>

              {/* Lista de programas con acordeones */}
              {programasAgrupados
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((programa, index) => (
                  <Accordion 
                    key={`programa-${index}`}
                    expanded={expandedPrograms[programa.Nombre_programa] || false}
                    onChange={() => handleExpandProgram(programa.Nombre_programa, programa.ids)}
                    sx={{ mb: 1 }}
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMoreIcon />}
                      sx={{ 
                        bgcolor: 'rgba(206, 10, 10, 0.05)', 
                        '&:hover': { bgcolor: 'rgba(206, 10, 10, 0.1)' },
                        '&.Mui-expanded': { bgcolor: 'rgba(206, 10, 10, 0.1)' }
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 'bold', flex: 1 }}>{programa.Nombre_programa}</Typography>
                        <Box sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenProgramModal(programa);
                            }}
                            sx={{ 
                              bgcolor: '#CE0A0A', 
                              '&:hover': { bgcolor: '#b00909' },
                              mr: 2
                            }}
                          >
                            Ver Estudiantes
                          </Button>
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            <strong>Estado:</strong> {programa.Estado}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Módulos:</strong> {programa.Incluye_Modulos ? 'Sí' : 'No'}
                          </Typography>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, pt: 1 }}>
                      {loadingAsignaturas[programa.Nombre_programa] ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                          <CircularProgress size={30} sx={{ color: '#CE0A0A' }} />
                        </Box>
                      ) : (
                        <>
                          {/* Cabecera para la sección de Módulos */}
                          <Box sx={{ p: 2, bgcolor: 'rgba(206, 10, 10, 0.02)' }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#CE0A0A' }}>
                              Módulos
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              Haz clic en un módulo para ver sus asignaturas
                            </Typography>
                          </Box>

                          {/* Lista de módulos por programa */}
                          {modulosByProgram[programa.Nombre_programa] && 
                            Object.keys(modulosByProgram[programa.Nombre_programa]).length > 0 ? (
                            Object.keys(modulosByProgram[programa.Nombre_programa]).map((moduloKey) => (
                              <Accordion 
                                key={`modulo-${programa.Nombre_programa}-${moduloKey}`}
                                expanded={expandedModulos[`${programa.Nombre_programa}-${moduloKey}`] || false}
                                onChange={() => handleExpandModulo(programa.Nombre_programa, moduloKey)}
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
                                  <Typography sx={{ fontWeight: '500' }}>{moduloKey}</Typography>
                                </AccordionSummary>
                                <AccordionDetails sx={{ p: 0 }}>
                                  {/* Tabla de asignaturas */}
                                  {asignaturasByModulo[programa.Nombre_programa] && 
                                    asignaturasByModulo[programa.Nombre_programa][moduloKey] && 
                                    asignaturasByModulo[programa.Nombre_programa][moduloKey].length > 0 ? (
                                    <TableContainer>
                                      <Table size="small">
                                        <TableHead>
                                          <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.03)' }}>
                                            <TableCell sx={{ fontWeight: 'bold', pl: 6 }}>Asignatura</TableCell>
                                            <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                          </TableRow>
                                        </TableHead>
                                        <TableBody>
                                          {asignaturasByModulo[programa.Nombre_programa][moduloKey].map((asignatura) => (
                                            <TableRow key={asignatura.Nombre_asignatura} hover>
                                              <TableCell sx={{ pl: 6 }}>{asignatura.Nombre_asignatura}</TableCell>
                                              <TableCell>
                                                <Button
                                                  variant="outlined"
                                                  size="small"
                                                  onClick={() => handleOpenAsignaturaModal(asignatura)}
                                                  sx={{
                                                    color: '#CE0A0A',
                                                    borderColor: '#CE0A0A',
                                                    '&:hover': { borderColor: '#b00909', color: '#b00909' }
                                                  }}
                                                >
                                                  Ver Notas
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </TableContainer>
                                  ) : (
                                    <Box sx={{ p: 2 }}>
                                      <Alert severity="info">No hay asignaturas para este módulo.</Alert>
                                    </Box>
                                  )}
                                </AccordionDetails>
                              </Accordion>
                            ))
                          ) : (
                            <Box sx={{ p: 2 }}>
                              <Alert severity="info">No se encontraron módulos para este programa.</Alert>
                            </Box>
                          )}
                        </>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}

              <TablePagination
                rowsPerPageOptions={[5, 10, 20]}
                component="div"
                count={programasAgrupados.length}
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
          {loadingProgramStudents ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress sx={{ color: '#CE0A0A' }} />
            </Box>
          ) : programStudents.length === 0 ? (
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
                      <TableCell>
                        <Box 
                          sx={{ 
                            display: 'inline-block',
                            px: 2, 
                            py: 0.5, 
                            borderRadius: 1,
                            fontWeight: 'bold',
                            bgcolor: getNotaColor(stud.Nota_Final) + '10', // Agregar transparencia
                            color: getNotaColor(stud.Nota_Final),
                            border: `1px solid ${getNotaColor(stud.Nota_Final)}30`
                          }}
                        >
                          {Number(stud.Nota_Final).toFixed(2)}
                        </Box>
                      </TableCell>
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