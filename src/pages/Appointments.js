import React, { useState } from 'react';
import axios from 'axios';
import { Box, TextField, Button, Typography, Grid, MenuItem } from '@mui/material';
import Navbar from '../components/Navbar';

const AppointmentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    email: '',
    city: '',
    description: '',
    preferred_date: '',
    preferred_time: '',
    mode: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('https://webhook-ecaf-production.up.railway.app/appointments', formData);
      if (response.data && response.data.message) {
        alert(response.data.message);
      } else {
        alert('Cita creada con éxito');
      }
    } catch (error) {
      console.error('Error al enviar la cita:', error.message);
      if (error.response && error.response.data) {
        alert(`Error: ${error.response.data}`);
      } else {
        alert('Error al crear la cita. Verifique la conexión al servidor.');
      }
    }
  };

  return (
    <>
      <Navbar pageTitle="Agendar Cita" />
      <Box sx={{ padding: '20px', margin: '0 auto' }}>
        <Typography variant="h4" color="#2B91FF" sx={{ marginBottom: '20px', textAlign: 'center' }}>
          Agendar Cita
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Nombre" name="name" value={formData.name} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Teléfono" name="phone_number" type="tel" value={formData.phone_number} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Correo Electrónico" name="email" type="email" value={formData.email} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Ciudad" name="city" value={formData.city} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth multiline rows={4} label="Breve descripción del servicio o proyecto" name="description" value={formData.description} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Fecha preferida" name="preferred_date" type="date" InputLabelProps={{ shrink: true }} value={formData.preferred_date} onChange={handleChange} required />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Hora preferida" name="preferred_time" type="time" InputLabelProps={{ shrink: true }} value={formData.preferred_time} onChange={handleChange} required />
            </Grid>
            {['Barranquilla', 'Melbourne'].includes(formData.city) && (
              <Grid item xs={12}>
                <TextField fullWidth select label="Modalidad" name="mode" value={formData.mode} onChange={handleChange} required>
                  <MenuItem value="Presencial">Presencial</MenuItem>
                  <MenuItem value="Virtual">Virtual</MenuItem>
                </TextField>
              </Grid>
            )}
            <Grid item xs={12}>
              <Button type="submit" variant="contained" fullWidth sx={{ backgroundColor: '#2B91FF', color: '#fff', '&:hover': { backgroundColor: '#003491' } }}>
                Agendar Cita
              </Button>
            </Grid>
          </Grid>
        </form>
      </Box>
    </>
  );
};

export default AppointmentForm;
