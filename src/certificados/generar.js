import React, { useState, useEffect, useMemo } from 'react';
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
  alpha
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';
import DescriptionIcon from '@mui/icons-material/Description';
import PersonIcon from '@mui/icons-material/Person';
import Navbar from '../components/Navbar';

const GenerarCertificado = ({ pageTitle }) => {
  // Pasos del formulario
  const pasos = ['Información Personal', 'Detalles del Certificado', 'Confirmación'];
  
  // Estado para el paso actual
  const [pasoActual, setPasoActual] = useState(0);
  
  // Estado para almacenar los valores del formulario
  const [formValues, setFormValues] = useState({
    nombre: '',
    apellido: '',
    tipoIdentificacion: '',
    numeroIdentificacion: '',
    tipoCertificado: '',
    telefono: '',
    correo: ''
  });

  // Estado para almacenar los errores de validación
  const [errors, setErrors] = useState({});
  
  // Verificar si hay algún campo con información
  const hayInformacion = useMemo(() => {
    return Object.values(formValues).some(value => value !== '');
  }, [formValues]);

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
    'Certificado de notas',
    'Certificado de asistencia',
    'Certificado general'
  ];

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Actualizar valores del formulario
    setFormValues({
      ...formValues,
      [name]: value
    });

    // Limpiar error del campo que se está editando
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Validación específica para número de identificación según el tipo seleccionado
  const validateNumeroIdentificacion = () => {
    const { tipoIdentificacion, numeroIdentificacion } = formValues;
    
    if (!numeroIdentificacion) return 'Este campo es obligatorio';
    
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
      if (tipoIdentificacion === 'Cédula de ciudadanía' && numeroIdentificacion.length < 8) {
        return 'La cédula debe tener al menos 8 dígitos';
      } else if (tipoIdentificacion === 'Tarjeta de Identidad' && numeroIdentificacion.length < 10) {
        return 'La tarjeta de identidad debe tener al menos 10 dígitos';
      } else if (tipoIdentificacion === 'Cédula de extranjería' && numeroIdentificacion.length < 6) {
        return 'La cédula de extranjería debe tener al menos 6 dígitos';
      }
    }
    
    return '';
  };

  // Validar el paso actual del formulario antes de avanzar
  const validarPasoActual = () => {
    const newErrors = {};
    
    if (pasoActual === 0) {
      // Validar campos del primer paso (información personal)
      
      // Validar nombre
      if (!formValues.nombre) {
        newErrors.nombre = 'El nombre es obligatorio';
      } else if (formValues.nombre.length < 2) {
        newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
      }
      
      // Validar apellido
      if (!formValues.apellido) {
        newErrors.apellido = 'El apellido es obligatorio';
      } else if (formValues.apellido.length < 2) {
        newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
      }
      
      // Validar tipo de identificación
      if (!formValues.tipoIdentificacion) {
        newErrors.tipoIdentificacion = 'Seleccione un tipo de identificación';
      }
      
      // Validar número de identificación
      if (formValues.tipoIdentificacion) {
        const idError = validateNumeroIdentificacion();
        if (idError) {
          newErrors.numeroIdentificacion = idError;
        }
      } else {
        newErrors.numeroIdentificacion = 'Primero seleccione un tipo de identificación';
      }
    } else if (pasoActual === 1) {
      // Validar campos del segundo paso (detalles del certificado)
      
      // Validar tipo de certificado
      if (!formValues.tipoCertificado) {
        newErrors.tipoCertificado = 'Seleccione un tipo de certificado';
      }
      
      // Validar teléfono
      if (!formValues.telefono) {
        newErrors.telefono = 'El teléfono es obligatorio';
      } else if (!/^\d{10}$/.test(formValues.telefono)) {
        newErrors.telefono = 'Ingrese un número de teléfono válido de 10 dígitos';
      }
      
      // Validar correo electrónico
      if (!formValues.correo) {
        newErrors.correo = 'El correo electrónico es obligatorio';
      } else if (!/\S+@\S+\.\S+/.test(formValues.correo)) {
        newErrors.correo = 'Ingrese un correo electrónico válido';
      }
    }
    
    setErrors(newErrors);
    
    // Devuelve true si no hay errores
    return Object.keys(newErrors).length === 0;
  };

  // Manejar avance al siguiente paso
  const handleNext = () => {
    if (validarPasoActual()) {
      setPasoActual((prevPaso) => prevPaso + 1);
    }
  };

  // Manejar retroceso al paso anterior
  const handleBack = () => {
    setPasoActual((prevPaso) => prevPaso - 1);
  };

  // Limpiar formulario
  const handleClear = () => {
    setFormValues({
      nombre: '',
      apellido: '',
      tipoIdentificacion: '',
      numeroIdentificacion: '',
      tipoCertificado: '',
      telefono: '',
      correo: ''
    });
    setErrors({});
  };

  // Manejar envío del formulario
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validarPasoActual()) {
      // Aquí iría la lógica para enviar los datos al backend
      console.log('Datos del formulario válidos:', formValues);
      
      // Mostrar alerta de éxito y reiniciar formulario
      alert('Solicitud de certificado enviada correctamente');
      
      // Reiniciar formulario y volver al primer paso
      handleClear();
      setPasoActual(0);
    } else {
      console.log('Formulario con errores');
    }
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
          value={formValues.nombre}
          onChange={handleChange}
          error={!!errors.nombre}
          helperText={errors.nombre}
          variant="outlined"
          InputProps={{
            startAdornment: <PersonIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />,
          }}
        />
      </Grid>
      
      {/* Apellido */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Apellido"
          name="apellido"
          value={formValues.apellido}
          onChange={handleChange}
          error={!!errors.apellido}
          helperText={errors.apellido}
          variant="outlined"
          InputProps={{
            startAdornment: <PersonIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />,
          }}
        />
      </Grid>
      
      {/* Tipo de Identificación */}
      <Grid item xs={12} md={6}>
        <FormControl fullWidth error={!!errors.tipoIdentificacion}>
          <InputLabel>Tipo de Identificación</InputLabel>
          <Select
            name="tipoIdentificacion"
            value={formValues.tipoIdentificacion}
            onChange={handleChange}
            label="Tipo de Identificación"
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
          value={formValues.numeroIdentificacion}
          onChange={handleChange}
          error={!!errors.numeroIdentificacion}
          helperText={errors.numeroIdentificacion}
          variant="outlined"
          disabled={!formValues.tipoIdentificacion}
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
            value={formValues.tipoCertificado}
            onChange={handleChange}
            label="Tipo de Certificado"
            startAdornment={<DescriptionIcon color="action" sx={{ mr: 1, opacity: 0.6 }} />}
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
            El tipo de certificado determinará la información incluida
          </Typography>
          <Tooltip title="Los certificados de notas incluyen calificaciones, los de asistencia incluyen fechas y horas, y los generales son para constancias básicas.">
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
          value={formValues.telefono}
          onChange={handleChange}
          error={!!errors.telefono}
          helperText={errors.telefono || "Será utilizado para notificaciones sobre su certificado"}
          variant="outlined"
        />
      </Grid>
      
      {/* Correo Electrónico */}
      <Grid item xs={12} md={6}>
        <TextField
          fullWidth
          label="Correo Electrónico"
          name="correo"
          type="email"
          value={formValues.correo}
          onChange={handleChange}
          error={!!errors.correo}
          helperText={errors.correo || "Se enviará el certificado a este correo"}
          variant="outlined"
        />
      </Grid>
    </Grid>
  );

  // Componente para el paso de confirmación
  const PasoConfirmacion = () => (
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
                {formValues.nombre} {formValues.apellido}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Identificación:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formValues.tipoIdentificacion}: {formValues.numeroIdentificacion}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Tipo de certificado:
              </Typography>
              <Typography variant="body1" gutterBottom>
                {formValues.tipoCertificado}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Contacto:
              </Typography>
              <Typography variant="body1" gutterBottom>
                Tel: {formValues.telefono}
              </Typography>
              <Typography variant="body1">
                Email: {formValues.correo}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Por favor verifique que la información proporcionada sea correcta antes de enviar la solicitud.
        Una vez procesada, recibirá una confirmación en su correo electrónico.
      </Typography>
    </Box>
  );

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
            
            <form onSubmit={(e) => e.preventDefault()}>
              <Box sx={{ mb: 4 }}>
                {renderPasoFormulario()}
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleClear}
                    disabled={!hayInformacion}
                    startIcon={<CleaningServicesIcon />}
                    sx={{ 
                      borderRadius: 2,
                      opacity: hayInformacion ? 1 : 0.5
                    }}
                  >
                    Limpiar
                  </Button>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button
                    disabled={pasoActual === 0}
                    onClick={handleBack}
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    sx={{ 
                      borderRadius: 2,
                      visibility: pasoActual === 0 ? 'hidden' : 'visible'
                    }}
                  >
                    Anterior
                  </Button>
                  
                  {pasoActual === pasos.length - 1 ? (
                    <Button
                      variant="contained"
                      onClick={handleSubmit}
                      sx={{ 
                        bgcolor: '#CE0A0A',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#b00909',
                        }
                      }}
                    >
                      Enviar Solicitud
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={handleNext}
                      endIcon={<ArrowForwardIcon />}
                      sx={{ 
                        bgcolor: '#CE0A0A',
                        borderRadius: 2,
                        '&:hover': {
                          bgcolor: '#b00909',
                        }
                      }}
                    >
                      Siguiente
                    </Button>
                  )}
                </Box>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default GenerarCertificado;