import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  TextField, 
  MenuItem, 
  Button, 
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Paper,
  Container,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  Tooltip,
  alpha,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';

const GenerarCertificado = ({ pageTitle }) => {
  // Pasos del formulario
  const pasos = ['Información Personal', 'Detalles del Certificado', 'Resumen', 'Confirmación'];
  const navigate = useNavigate();

  // Estado para el paso actual
  const [pasoActual, setPasoActual] = useState(0);
  
  // Estados para UI
  const [loading, setLoading] = useState(false);
  const [openSuccessDialog, setOpenSuccessDialog] = useState(false);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [certificadoId, setCertificadoId] = useState(null);
  
  // Estados para validación de requisitos
  const [validacionInfo, setValidacionInfo] = useState(null);
  const [validandoRequisitos, setValidandoRequisitos] = useState(false);
  
  // Estado para almacenar todos los datos del formulario
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    tipoCertificado: '',
    telefono: '',
    correo: ''
  });
  
  // Referencias para obtener valores directamente del DOM si es necesario
  const nombreRef = useRef(null);
  const apellidoRef = useRef(null);
  const tipoIdentificacionRef = useRef(null);
  const numeroIdentificacionRef = useRef(null);
  const tipoCertificadoRef = useRef(null);
  const telefonoRef = useRef(null);
  const correoRef = useRef(null);
  
  // Estado para almacenar los errores de validación
  const [errors, setErrors] = useState({});

  // Tipos de identificación disponibles
  const tiposIdentificacion = [
    'Cédula de ciudadanía',
    'Tarjeta de Identidad',
    'Pasaporte',
    'PEP',
    'Cédula de extranjería'
  ];

  // Tipos de certificados disponibles
  const tiposCertificado = [
    'certificado de estudio',
    'certificado de notas',
    'duplicado de certificado de curso corto',
    'diploma de grado',
    'duplicado de diploma',
  ];

  // Función para validar requisitos antes de mostrar el resumen
  const validarRequisitos = async () => {
    setValidandoRequisitos(true);
    
    try {
      const currentFormData = {
        ...formData,
        nombre: nombreRef.current?.value || formData.nombre,
        apellido: apellidoRef.current?.value || formData.apellido,
        tipoIdentificacion: tipoIdentificacionRef.current?.value || formData.tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacionRef.current?.value || formData.numeroIdentificacion,
        tipoCertificado: tipoCertificadoRef.current?.value || formData.tipoCertificado,
        telefono: telefonoRef.current?.value || formData.telefono,
        correo: correoRef.current?.value || formData.correo
      };

      // Actualizar formData
      setFormData(currentFormData);

      // Validar requisitos en el backend
      const response = await fetch('https://webhook-ecaf-production.up.railway.app/api/certificados/validar-requisitos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo_identificacion: currentFormData.tipoIdentificacion,
          numero_identificacion: currentFormData.numeroIdentificacion,
          tipo_certificado: currentFormData.tipoCertificado
        }),
      });

      const result = await response.json();
      
      if (result.esValido) {
        // Si es válido, guardar la información y continuar al resumen
        setValidacionInfo(result);
        setPasoActual(2); // Ir al resumen
      } else {
        // Si no es válido, mostrar error específico
        setErrorMessage(result.mensaje + (result.detalles ? '\n\n' + result.detalles : ''));
        setOpenErrorDialog(true);
      }

    } catch (error) {
      console.error('Error al validar requisitos:', error);
      setErrorMessage('Error al verificar los requisitos. Por favor intente nuevamente.');
      setOpenErrorDialog(true);
    } finally {
      setValidandoRequisitos(false);
    }
  };

  // Función para obtener los valores actuales del formulario
  const getFormValues = () => {
    // Para campos con useRef, accedemos al valor actual con .value
    return {
      nombre: nombreRef.current?.value || '',
      apellido: apellidoRef.current?.value || '',
      tipoIdentificacion: tipoIdentificacionRef.current?.value || '',
      numeroIdentificacion: numeroIdentificacionRef.current?.value || '',
      tipoCertificado: tipoCertificadoRef.current?.value || '',
      telefono: telefonoRef.current?.value || '',
      correo: correoRef.current?.value || ''
    };
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name } = e.target;
    
    // Solo limpiar errores si existen
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: ''
      }));
    }
  };

  // Validación específica para número de identificación según el tipo seleccionado
  const validateNumeroIdentificacion = (values) => {
    const { tipoIdentificacion, numeroIdentificacion } = values;
    
    // Si no hay número de identificación y hay un tipo seleccionado
    if (!numeroIdentificacion && tipoIdentificacion) {
      return 'Este campo es obligatorio';
    }
    
    // Si no hay tipo de identificación seleccionado, no realizar validaciones específicas
    // Solo validamos que el campo no esté vacío en validarPasoActual si es necesario
    if (!tipoIdentificacion) {
      return '';
    }
    
    // A partir de aquí, solo se ejecuta si hay un tipo seleccionado y un número ingresado
    
    // Para Pasaporte y PEP, permitir alfanumérico
    if (tipoIdentificacion === 'Pasaporte' || tipoIdentificacion === 'PEP') {
      // Alfanumérico, al menos 5 caracteres
      if (numeroIdentificacion.length < 5) {
        return 'Debe tener al menos 5 caracteres';
      }
    } else {
      // Para los demás tipos, solo permitir números
      if (!/^\d+$/.test(numeroIdentificacion)) {
        return 'Solo se permiten números';
      }
      
      // Validación específica por tipo de documento
      if (tipoIdentificacion === 'Cédula de ciudadanía' && numeroIdentificacion.length < 6) {
        return 'La cédula debe tener al menos 6 dígitos';
      } else if (tipoIdentificacion === 'Tarjeta de Identidad' && numeroIdentificacion.length < 8) {
        return 'La tarjeta de identidad debe tener al menos 8 dígitos';
      } else if (tipoIdentificacion === 'Cédula de extranjería' && numeroIdentificacion.length < 6) {
        return 'La cédula de extranjería debe tener al menos 6 dígitos';
      }
    }
    
    return '';
  };

  // Validar el paso actual del formulario antes de avanzar
  const validarPasoActual = () => {
    const newErrors = {};
    
    // Sincronizar cualquier cambio de los refs con el estado formData
    const currentFormData = {
      ...formData,
      nombre: nombreRef.current?.value || formData.nombre,
      apellido: apellidoRef.current?.value || formData.apellido,
      tipoIdentificacion: tipoIdentificacionRef.current?.value || formData.tipoIdentificacion,
      numeroIdentificacion: numeroIdentificacionRef.current?.value || formData.numeroIdentificacion,
      tipoCertificado: tipoCertificadoRef.current?.value || formData.tipoCertificado,
      telefono: telefonoRef.current?.value || formData.telefono,
      correo: correoRef.current?.value || formData.correo
    };
    
    // Actualizar el estado con los valores actuales
    setFormData(currentFormData);
    
    if (pasoActual === 0) {
      // Validar campos del primer paso (información personal)
      
      // Validar nombre
      if (!currentFormData.nombre) {
        newErrors.nombre = 'El nombre es obligatorio';
      } else if (currentFormData.nombre.length < 2) {
        newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
      }
      
      // Validar apellido
      if (!currentFormData.apellido) {
        newErrors.apellido = 'El apellido es obligatorio';
      } else if (currentFormData.apellido.length < 2) {
        newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
      }
      
      // Validar tipo de identificación
      if (!currentFormData.tipoIdentificacion) {
        newErrors.tipoIdentificacion = 'Seleccione un tipo de identificación';
      }
      
      // Validar número de identificación
      if (currentFormData.tipoIdentificacion) {
        const idError = validateNumeroIdentificacion(currentFormData);
        if (idError) {
          newErrors.numeroIdentificacion = idError;
        }
      } else {
        newErrors.numeroIdentificacion = 'Primero seleccione un tipo de identificación';
      }
    } else if (pasoActual === 1) {
      // Validar campos del segundo paso (detalles del certificado)
      
      // Validar tipo de certificado
      if (!currentFormData.tipoCertificado) {
        newErrors.tipoCertificado = 'Seleccione un tipo de certificado';
      }
      
      // Validar teléfono
      if (!currentFormData.telefono) {
        newErrors.telefono = 'El teléfono es obligatorio';
      } else if (!/^\d{10}$/.test(currentFormData.telefono)) {
        newErrors.telefono = 'Ingrese un número de teléfono válido de 10 dígitos';
      }
      
      // Validar correo electrónico
      if (!currentFormData.correo) {
        newErrors.correo = 'El correo electrónico es obligatorio';
      } else if (!/\S+@\S+\.\S+/.test(currentFormData.correo)) {
        newErrors.correo = 'Ingrese un correo electrónico válido';
      }
    }
    // En los pasos 3 (resumen) y 4 (confirmación) no hacemos validaciones adicionales
    
    setErrors(newErrors);
    console.log("Datos del formulario validados:", currentFormData);
    
    // Devuelve true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  // Manejar avance al siguiente paso
  const handleNext = () => {
    if (validarPasoActual()) {
      if (pasoActual === 1) {
        // En el paso 1 (Detalles del Certificado), validar requisitos antes de ir al resumen
        validarRequisitos();
      } else {
        // Para otros pasos, avanzar normalmente
        setPasoActual((prevPaso) => prevPaso + 1);
      }
    }
  };

  // Manejar retroceso al paso anterior
  const handleBack = () => {
    setPasoActual((prevPaso) => prevPaso - 1);
    // Limpiar validación si regresa del resumen
    if (pasoActual === 2) {
      setValidacionInfo(null);
    }
  };

  // Reiniciar formulario completamente
  const handleReset = () => {
    // Restablecer el estado formData
    setFormData({
      nombre: '',
      apellido: '',
      tipoIdentificacion: '',
      numeroIdentificacion: '',
      tipoCertificado: '',
      telefono: '',
      correo: ''
    });
    
    // Restablecer los valores de los campos
    if (nombreRef.current) nombreRef.current.value = '';
    if (apellidoRef.current) apellidoRef.current.value = '';
    if (tipoIdentificacionRef.current) tipoIdentificacionRef.current.value = '';
    if (numeroIdentificacionRef.current) numeroIdentificacionRef.current.value = '';
    if (tipoCertificadoRef.current) tipoCertificadoRef.current.value = '';
    if (telefonoRef.current) telefonoRef.current.value = '';
    if (correoRef.current) correoRef.current.value = '';
    
    setErrors({});
    setPasoActual(0);
    setValidacionInfo(null);
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    
    try {
      // Asegurar que formData esté actualizado con los valores actuales
      const currentFormData = {
        ...formData,
        nombre: nombreRef.current?.value || formData.nombre,
        apellido: apellidoRef.current?.value || formData.apellido,
        tipoIdentificacion: tipoIdentificacionRef.current?.value || formData.tipoIdentificacion,
        numeroIdentificacion: numeroIdentificacionRef.current?.value || formData.numeroIdentificacion,
        tipoCertificado: tipoCertificadoRef.current?.value || formData.tipoCertificado,
        telefono: telefonoRef.current?.value || formData.telefono,
        correo: correoRef.current?.value || formData.correo
      };
      
      // Actualizar el estado formData con los valores actuales
      setFormData(currentFormData);
      
      // Verificar si algún campo está vacío
      const missingFields = Object.entries(currentFormData)
        .filter(([key, value]) => !value && key !== 'numeroIdentificacion')
        .map(([key]) => key);
      
      if (missingFields.length > 0) {
        throw new Error(`Campos requeridos faltantes: ${missingFields.join(', ')}`);
      }
      
      // Preparar datos para enviar al servidor
      const dataToSend = {
        nombre: currentFormData.nombre,
        apellido: currentFormData.apellido,
        tipo_identificacion: currentFormData.tipoIdentificacion,
        numero_identificacion: currentFormData.numeroIdentificacion,
        tipo_certificado: currentFormData.tipoCertificado,
        telefono: currentFormData.telefono,
        correo: currentFormData.correo
      };
      
      // Para depuración
      console.log("Enviando datos:", dataToSend);
      
      // Realizar la solicitud POST al endpoint
      const response = await fetch('https://webhook-ecaf-production.up.railway.app/api/certificados', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.mensaje || result.error || 'Error al enviar la solicitud');
      }
      
      // Guardar el ID del certificado
    setCertificadoId(result.referencia)
      
      // Mostrar diálogo de éxito
      setOpenSuccessDialog(true);
      
    } catch (error) {
      console.error('Error al enviar formulario:', error);
      setErrorMessage(error.message || 'Error al procesar la solicitud');
      setOpenErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };
      
  // Manejar cierre del diálogo de éxito
  const handleCloseSuccessDialog = () => {
    setOpenSuccessDialog(false);
    // Reiniciar formulario y volver al primer paso
    handleReset();
  };

  // Componente para el formulario del primer paso
  const FormularioPaso1 = () => (
    <Grid container spacing={3}>
      {/* Nombre */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Nombre"
          name="nombre"
          inputRef={nombreRef}
          onChange={handleChange}
          error={!!errors.nombre}
          helperText={errors.nombre}
          variant="outlined"
          InputProps={{
            startAdornment: <PersonIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />,
            style: { color: 'rgba(0, 0, 0, 0.87)' }
          }}
          defaultValue={formData.nombre}
          autoComplete="off"
        />
      </Grid>
      
      {/* Apellido */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Apellido"
          name="apellido"
          inputRef={apellidoRef}
          onChange={handleChange}
          error={!!errors.apellido}
          helperText={errors.apellido}
          variant="outlined"
          InputProps={{
            startAdornment: <PersonIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />,
            style: { color: 'rgba(0, 0, 0, 0.87)' }
          }}
          defaultValue={formData.apellido}
          autoComplete="off"
        />
      </Grid>
      
      {/* Tipo de Identificación */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.tipoIdentificacion}>
          <InputLabel>Tipo de Identificación</InputLabel>
          <Select
            name="tipoIdentificacion"
            inputRef={tipoIdentificacionRef}
            onChange={handleChange}
            label="Tipo de Identificación"
            defaultValue={formData.tipoIdentificacion}
          >
            {tiposIdentificacion.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </Select>
          {errors.tipoIdentificacion && (
            <FormHelperText>{errors.tipoIdentificacion}</FormHelperText>
          )}
        </FormControl>
      </Grid>
      
      {/* Número de Identificación */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Número de Identificación"
          name="numeroIdentificacion"
          inputRef={numeroIdentificacionRef}
          onChange={handleChange}
          error={!!errors.numeroIdentificacion}
          helperText={errors.numeroIdentificacion}
          variant="outlined"
          defaultValue={formData.numeroIdentificacion}
          autoComplete="off"
          sx={{
            '& .MuiInputBase-input': {
              color: 'rgba(0, 0, 0, 0.87)'
            }
          }}
        />
      </Grid>
    </Grid>
  );

  // Componente para el formulario del segundo paso
  const FormularioPaso2 = () => (
    <Grid container spacing={3}>
      {/* Tipo de Certificado */}
      <Grid item xs={12}>
        <FormControl fullWidth error={!!errors.tipoCertificado}>
          <InputLabel>Tipo de Certificado</InputLabel>
          <Select
            name="tipoCertificado"
            inputRef={tipoCertificadoRef}
            onChange={handleChange}
            label="Tipo de Certificado"
            defaultValue={formData.tipoCertificado}
          >
            {tiposCertificado.map((tipo) => (
              <MenuItem key={tipo} value={tipo}>
                {tipo}
              </MenuItem>
            ))}
          </Select>
          {errors.tipoCertificado && (
            <FormHelperText>{errors.tipoCertificado}</FormHelperText>
          )}
        </FormControl>
        <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            El tipo de certificado determinará la información incluida y los requisitos necesarios
          </Typography>
          <Tooltip title="Cada tipo de certificado tiene requisitos específicos que se validarán automáticamente.">
            <IconButton size="small" color="primary">
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Grid>
      
      {/* Teléfono */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Teléfono"
          name="telefono"
          inputRef={telefonoRef}
          onChange={handleChange}
          error={!!errors.telefono}
          helperText={errors.telefono || "Será utilizado para notificaciones sobre su certificado"}
          variant="outlined"
          defaultValue={formData.telefono}
          autoComplete="off"
        />
      </Grid>
      
      {/* Correo Electrónico */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Correo Electrónico"
          name="correo"
          type="email"
          inputRef={correoRef}
          onChange={handleChange}
          error={!!errors.correo}
          helperText={errors.correo || "Se enviará el certificado a este correo"}
          variant="outlined"
          defaultValue={formData.correo}
          autoComplete="off"
        />
      </Grid>
    </Grid>
  );

  // Componente mejorado para el paso de confirmación/resumen
  const PasoConfirmacion = () => {
    console.log("Valores en el resumen (formData):", formData);
    console.log("Información de validación:", validacionInfo);
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>
          Resumen de la solicitud
        </Typography>
        
        <Card variant="outlined" sx={{ mb: 3, bgcolor: alpha('#CE0A0A', 0.03) }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Nombre completo:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.nombre || '-'} {formData.apellido || '-'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Identificación:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.tipoIdentificacion || '-'}: {formData.numeroIdentificacion || '-'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Tipo de certificado:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {formData.tipoCertificado || '-'}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">
                  Contacto:
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Tel: {formData.telefono || '-'}
                </Typography>
                <Typography variant="body1">
                  Email: {formData.correo || '-'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Información de validación y precio */}
        {validacionInfo && (
          <Card variant="outlined" sx={{ mb: 3, bgcolor: alpha('#4caf50', 0.05), border: '1px solid #4caf50' }}>
            <CardContent>
              <Typography variant="h6" sx={{ color: '#2e7d32', mb: 2, display: 'flex', alignItems: 'center' }}>
                <CheckCircleOutlineIcon sx={{ mr: 1 }} />
                Certificado Validado
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estudiante encontrado:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {validacionInfo.estudianteNombre}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado del certificado:
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {validacionInfo.estadoInicial === 'completado' ? 'Será procesado inmediatamente' : 'Pendiente de pago'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Valor del certificado:
                  </Typography>
                  <Typography variant="h6" sx={{ color: validacionInfo.precio === 0 ? '#2e7d32' : '#1976d2', mb: 1 }}>
                    {validacionInfo.precio === 0 ? 'GRATUITO' : `$${validacionInfo.precio.toLocaleString()}`}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    {validacionInfo.mensaje}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Por favor verifique que la información proporcionada sea correcta antes de enviar la solicitud.
          Una vez procesada, recibirá una confirmación en su correo electrónico.
        </Typography>
      </Box>
    );
  };

  // Renderizar el paso actual del formulario
  const renderPasoFormulario = () => {
    switch (pasoActual) {
      case 0:
        return <FormularioPaso1 />;
      case 1:
        return <FormularioPaso2 />;
      case 2:
        return <PasoConfirmacion />;
      default:
        return <FormularioPaso1 />;
    }
  };

  return (
    <Box sx={{ bgcolor: '#fafafa', minHeight: '100vh' }}>
      <Navbar pageTitle={pageTitle || "Generar Certificado"} />
      <Container maxWidth="md">
        <Box p={3} sx={{ marginTop: '20px' }}>
          <Paper 
            elevation={3} 
            sx={{ 
              padding: 4, 
              borderRadius: 2, 
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                color: '#CE0A0A', 
                textAlign: 'center', 
                fontWeight: 600,
                mb: 4
              }}
            >
              Solicitud de Generación de Certificado
            </Typography>
            
            <Stepper 
              activeStep={pasoActual} 
              alternativeLabel 
              sx={{ 
                mb: 4,
                '& .MuiStepLabel-root .Mui-completed': {
                  color: '#CE0A0A', 
                },
                '& .MuiStepLabel-root .Mui-active': {
                  color: '#CE0A0A', 
                },
              }}
            >
              {pasos.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <Divider sx={{ mb: 4 }} />
            
            <form onSubmit={(e) => {
              e.preventDefault();
              if (pasoActual === pasos.length - 1) {
                handleSubmit(e);
              }
            }}>
              <Box sx={{ mb: 4 }}>
                {renderPasoFormulario()}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  disabled={pasoActual === 0}
                  onClick={handleBack}
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  sx={{ 
                    borderRadius: 2,
                    opacity: pasoActual === 0 ? 0.5 : 1
                  }}
                >
                  Anterior
                </Button>
                
                {pasoActual === pasos.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    type="submit"
                    disabled={loading}
                    sx={{ 
                      bgcolor: '#CE0A0A',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#b00909',
                      }
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      'Enviar Solicitud'
                    )}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={validandoRequisitos}
                    endIcon={validandoRequisitos ? <CircularProgress size={16} /> : <ArrowForwardIcon />}
                    sx={{ 
                      bgcolor: '#CE0A0A',
                      borderRadius: 2,
                      '&:hover': {
                        bgcolor: '#b00909',
                      }
                    }}
                  >
                    {pasoActual === 1 ? (validandoRequisitos ? 'Validando...' : 'Validar y Continuar') : 'Siguiente'}
                  </Button>
                )}
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>

      {/* Diálogo de éxito */}
      <Dialog
        open={openSuccessDialog}
        onClose={handleCloseSuccessDialog}
        aria-labelledby="success-dialog-title"
        aria-describedby="success-dialog-description"
        PaperProps={{
          sx: { 
            borderRadius: 2,
            maxWidth: 500
          }
        }}
      >
        <DialogTitle id="success-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
            <CheckCircleOutlineIcon sx={{ mr: 1 }} />
            Solicitud Enviada Exitosamente
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="success-dialog-description" sx={{ mb: 2 }}>
            Su solicitud de certificado ha sido recibida correctamente. 
            Se ha registrado con el número de referencia: <strong>#{certificadoId}</strong>
          </DialogContentText>
          {validacionInfo && validacionInfo.precio === 0 ? (
            <DialogContentText sx={{ mb: 2, color: 'success.main', fontWeight: 'bold' }}>
              ¡Su certificado será procesado inmediatamente sin costo adicional!
            </DialogContentText>
          ) : (
            <>
              <DialogContentText sx={{ mb: 2 }}>
                Para completar el proceso, por favor realice el pago correspondiente 
                en la sección de "Consultar Certificados" de nuestra plataforma.
              </DialogContentText>
              <DialogContentText sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                Una vez confirmado el pago, comenzaremos a procesar su certificado.
              </DialogContentText>
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            onClick={handleCloseSuccessDialog} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
            }}
          >
            Cerrar
          </Button>
          <Button 
            onClick={() => {
             handleCloseSuccessDialog();
             navigate('/certificados/consultar');
         }} 
             variant="contained"
        sx={{ 
            bgcolor: '#CE0A0A',
            borderRadius: 2,
            '&:hover': {
             bgcolor: '#b00909',
           }
        }}
        >
          Ir a Consultas
       </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de error */}
      <Dialog
        open={openErrorDialog}
        onClose={() => setOpenErrorDialog(false)}
        aria-labelledby="error-dialog-title"
        aria-describedby="error-dialog-description"
        PaperProps={{
          sx: { 
            borderRadius: 2,
            maxWidth: 600
          }
        }}
      >
        <DialogTitle id="error-dialog-title" sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
            <ErrorOutlineIcon sx={{ mr: 1 }} />
            Error en la Solicitud
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="error-dialog-description" sx={{ whiteSpace: 'pre-line' }}>
            {errorMessage}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            Por favor verifique los requisitos y trate nuevamente, o contacte al soporte técnico si el problema persiste.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            onClick={() => setOpenErrorDialog(false)} 
            variant="contained"
            sx={{ 
              bgcolor: '#CE0A0A',
              borderRadius: 2,
              '&:hover': {
                bgcolor: '#b00909',
              }
            }}
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GenerarCertificado;