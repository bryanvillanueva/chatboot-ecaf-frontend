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

  // Estados para la estructura jerárquica expandible
  const [expandedPrograms, setExpandedPrograms] = useState({});
  const [expandedModules, setExpandedModules] = useState({});
  const [modulesByProgram, setModulesByProgram] = useState({});
  const [asignaturasByModule, setAsignaturasByModule] = useState({});
    const [expandedModulos, setExpandedModulos] = useState({});


  // Modal para estudiantes a nivel de programa
  const [openProgramModal, setOpenProgramModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [programStudents, setProgramStudents] = useState([]);
  const [loadingProgramStudents, setLoadingProgramStudents] = useState(false);

  // Modal para estudiantes de un módulo
  const [openModuleModal, setOpenModuleModal] = useState(false);
  const [selectedModule, setSelectedModule] = useState(null);
  const [moduleStudents, setModuleStudents] = useState([]);
  const [loadingModuleStudents, setLoadingModuleStudents] = useState(false);


  
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


  // Toggle expand/collapse para módulos de un programa
  const toggleExpandProgram = async (programId) => {

    setExpandedPrograms(prev => ({
      ...prev,
      [programaNombre]: !isExpanded
    }));

    
    // Si se expande y no se han cargado los módulos, hacer la consulta
    if (!expandedPrograms[programId] && !modulesByProgram[programId]) {
      try {
        // Adaptamos para usar asignaturas directamente, ya que posiblemente la API de módulos no existe
        const res = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${programId}/asignaturas`);
        
        // Agrupamos las asignaturas por módulo para crear una estructura de módulos
        const modulos = {};
        res.data.forEach(asignatura => {
          const moduloId = asignatura.Id_Modulo || 'sin-modulo';
          const moduloNombre = asignatura.Nombre_modulo || 'Sin Módulo Asignado';
          
          if (!modulos[moduloId]) {
            modulos[moduloId] = {
              Id_Modulo: moduloId,
              Nombre_modulo: moduloNombre,
              Estado_modulo: 'Activo',
              asignaturas: []
            };
          }
          
          modulos[moduloId].asignaturas.push(asignatura);
        });
        
        // Convertimos el objeto a array para usar en el estado
        const modulosArray = Object.values(modulos);
        setModulesByProgram(prev => ({ ...prev, [programId]: modulosArray }));
        
        // Pre-cargamos las asignaturas para cada módulo
        modulosArray.forEach(modulo => {
          setAsignaturasByModule(prev => ({ 
            ...prev, 
            [modulo.Id_Modulo]: modulo.asignaturas 
          }));
        });
      } catch (err) {
        console.error('❌ Error al obtener módulos/asignaturas para el programa:', err);
        setSnackbar({ open: true, message: 'Error al cargar información del programa', severity: 'error' });
      }
    }
  };

  // Toggle expand/collapse para asignaturas de un módulo
  const toggleExpandModule = async (moduleId) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
    
    // Las asignaturas ya deberían estar pre-cargadas en toggleExpandProgram,
    // pero por si acaso verificamos
    if (!expandedModules[moduleId] && !asignaturasByModule[moduleId]) {
      // No hacemos llamada a API aquí ya que las asignaturas fueron pre-cargadas
      console.log('Las asignaturas deberían estar pre-cargadas para el módulo:', moduleId);
    }

  };

  // Modal para estudiantes asociados a un programa
  const handleOpenProgramModal = (program) => {
    setSelectedProgram(program);
    setOpenProgramModal(true);

    axios.get(`https://webhook-ecaf-production.up.railway.app/api/programas/${program.Id_Programa}/estudiantes`)
      .then(res => {
        // Agrupar estudiantes: cada estudiante aparece una sola vez
        const agrupados = {};
        res.data.forEach(item => {
          const key = item.numero_documento;
          if (!agrupados[key]) {
            agrupados[key] = { 
              ...item, 
              modulos: [],
              asignaturas: []
            };
          }
          if (item.Nombre_modulo && !agrupados[key].modulos.includes(item.Nombre_modulo)) {
            agrupados[key].modulos.push(item.Nombre_modulo);
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

  // Función modificada para obtener estudiantes del módulo
const handleOpenModuleModal = (module) => {
  setSelectedModule(module);
  setOpenModuleModal(true);
  setLoadingModuleStudents(true);
  
  // Usamos el nuevo endpoint específico para módulos
  axios.get(`https://webhook-ecaf-production.up.railway.app/api/modulos/${module.Id_Modulo}/estudiantes`)
    .then(res => {
      setModuleStudents(res.data);
      setLoadingModuleStudents(false);
    })
    .catch(err => {
      console.error('❌ Error al obtener estudiantes del módulo:', err);
      setSnackbar({ 
        open: true, 
        message: 'Error al cargar estudiantes del módulo', 
        severity: 'error' 
      });
      setLoadingModuleStudents(false);
    });
};

  const handleCloseModuleModal = () => {
    setOpenModuleModal(false);
    setSelectedModule(null);
    setModuleStudents([]);
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

                        </TableCell>
                      </TableRow>,
                      <TableRow key={`collapse-${prog.Id_Programa}`}>
                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                          <Collapse in={expandedPrograms[prog.Id_Programa]} timeout="auto" unmountOnExit>
                            <Box sx={{ margin: 1, ml: 4 }}>
                              <Typography variant="subtitle1" sx={{ mb: 1, color: '#CE0A0A', fontWeight: 'bold' }}>
                                Módulos del Programa
                              </Typography>
                              {!modulesByProgram[prog.Id_Programa] ? (
                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                  <CircularProgress size={24} sx={{ color: '#CE0A0A' }} />
                                </Box>
                              ) : modulesByProgram[prog.Id_Programa].length === 0 ? (
                                <Alert severity="info">No se encontraron módulos para este programa.</Alert>
                              ) : (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
                                      <TableCell sx={{ fontWeight: 'bold' }} />
                                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre del Módulo</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {modulesByProgram[prog.Id_Programa].map((mod) => [
                                      <TableRow key={`mod-${mod.Id_Modulo}`} hover>
                                        <TableCell>
                                          <IconButton size="small" onClick={() => toggleExpandModule(mod.Id_Modulo)}>
                                            {expandedModules[mod.Id_Modulo] ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                                          </IconButton>
                                        </TableCell>
                                        <TableCell>{mod.Nombre_modulo}</TableCell>
                                        <TableCell>{mod.Estado_modulo || 'Activo'}</TableCell>
                                        <TableCell>
                                          <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleOpenModuleModal({...mod, Id_Programa: prog.Id_Programa})}
                                            sx={{
                                              color: '#CE0A0A',
                                              borderColor: '#CE0A0A',
                                              '&:hover': { borderColor: '#b00909', color: '#b00909' }
                                            }}
                                          >
                                            Ver Estudiantes
                                          </Button>
                                        </TableCell>
                                      </TableRow>,
                                      <TableRow key={`collapse-mod-${mod.Id_Modulo}`}>
                                        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                                          <Collapse in={expandedModules[mod.Id_Modulo]} timeout="auto" unmountOnExit>
                                            <Box sx={{ margin: 1, ml: 4 }}>
                                              <Typography variant="subtitle2" sx={{ mb: 1, color: '#CE0A0A', fontWeight: 'bold' }}>
                                                Asignaturas del Módulo
                                              </Typography>
                                              {!asignaturasByModule[mod.Id_Modulo] ? (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                                                  <CircularProgress size={20} sx={{ color: '#CE0A0A' }} />
                                                </Box>
                                              ) : asignaturasByModule[mod.Id_Modulo].length === 0 ? (
                                                <Alert severity="info" sx={{ mb: 2 }}>No se encontraron asignaturas para este módulo.</Alert>
                                              ) : (
                                                <Table size="small">
                                                  <TableHead>
                                                    <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.02)' }}>
                                                      <TableCell sx={{ fontWeight: 'bold' }}>Nombre de la Asignatura</TableCell>
                                                      <TableCell sx={{ fontWeight: 'bold' }}>Estado</TableCell>
                                                      <TableCell sx={{ fontWeight: 'bold' }}>Acciones</TableCell>
                                                    </TableRow>
                                                  </TableHead>
                                                  <TableBody>
                                                    {asignaturasByModule[mod.Id_Modulo].map((asig) => (
                                                      <TableRow key={`asig-${asig.Id_Asignatura}`} hover>
                                                        <TableCell>{asig.Nombre_asignatura}</TableCell>
                                                        <TableCell>{asig.Estado_asignatura || 'Activa'}</TableCell>
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
                                              )}
                                            </Box>
                                          </Collapse>
                                        </TableCell>
                                      </TableRow>
                                    ])}
                                  </TableBody>
                                </Table>
                              )}

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
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell> {/* Nueva columna */}
              <TableCell sx={{ fontWeight: 'bold' }}>Módulos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {programStudents.map((stud, idx) => (
              <TableRow key={idx} hover>
                <TableCell>{`${stud.tipo_documento || ''} ${stud.numero_documento}`}</TableCell>
                <TableCell>{`${stud.nombres} ${stud.apellidos}`}</TableCell>
                <TableCell>{stud.email || '-'}</TableCell> {/* Mostrar email */}
                <TableCell>{stud.modulos && stud.modulos.length > 0 ? stud.modulos.join(', ') : '-'}</TableCell>
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
      
      {/* Modal para estudiantes del módulo */}
      <Dialog open={openModuleModal} onClose={handleCloseModuleModal} fullWidth maxWidth="md">
  <DialogTitle sx={{ bgcolor: 'rgba(206, 10, 10, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <Typography variant="h6" sx={{ color: '#CE0A0A', fontWeight: 'bold' }}>
      Estudiantes del módulo: {selectedModule?.Nombre_modulo}
    </Typography>
    <IconButton onClick={handleCloseModuleModal} sx={{ color: '#CE0A0A' }}>
      <CloseIcon />
    </IconButton>
  </DialogTitle>
  <DialogContent dividers>
    {loadingModuleStudents ? (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress sx={{ color: '#CE0A0A' }} />
      </Box>
    ) : moduleStudents.length === 0 ? (
      <Alert severity="info">No se encontraron estudiantes para este módulo.</Alert>
    ) : (
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'rgba(206, 10, 10, 0.05)' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>Documento</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Nombre Completo</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Asignaturas</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {moduleStudents.map((estudiante, idx) => (
              <TableRow key={`est-${estudiante.id_estudiante}-${idx}`} hover>
                <TableCell>{`${estudiante.tipo_documento || ''} ${estudiante.numero_documento}`}</TableCell>
                <TableCell>{`${estudiante.nombres} ${estudiante.apellidos}`}</TableCell>
                <TableCell>{estudiante.email || '-'}</TableCell>
                <TableCell>
                  {estudiante.asignaturas && estudiante.asignaturas.length > 0 ? (
                    <Box component="ul" sx={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0,
                      maxHeight: '120px',
                      overflowY: 'auto'
                    }}>
                      {estudiante.asignaturas.map((asig, i) => (
                        <Box 
                          component="li" 
                          key={`asig-${asig.Id_Asignatura}-${i}`}
                          sx={{ 
                            py: 0.5,
                            borderBottom: i < estudiante.asignaturas.length - 1 ? '1px solid rgba(0,0,0,0.1)' : 'none'
                          }}
                        >
                          {asig.Nombre_asignatura}
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    'No tiene asignaturas en este módulo'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </DialogContent>
  <DialogActions>
    <Button 
      onClick={handleCloseModuleModal} 
      sx={{ 
        color: '#CE0A0A',
        '&:hover': {
          backgroundColor: 'rgba(206, 10, 10, 0.08)'
        }
      }}
    >
      Cerrar
    </Button>
  </DialogActions>
</Dialog>
      
    
      {/* Modal para estudiantes de asignatura */}
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
              <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell> {/* Nueva columna */}
              <TableCell sx={{ fontWeight: 'bold' }}>Nota Final</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {asignaturaStudents.map((stud, idx) => (
              <TableRow key={idx} hover>
                <TableCell>{`${stud.tipo_documento || ''} ${stud.numero_documento}`}</TableCell>
                <TableCell>{`${stud.nombres} ${stud.apellidos}`}</TableCell>
                <TableCell>{stud.email || '-'}</TableCell> 
                <TableCell>{stud.Nota_Final || '-'}</TableCell>
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