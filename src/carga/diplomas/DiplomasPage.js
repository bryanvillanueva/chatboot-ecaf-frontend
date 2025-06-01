import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import DiplomasUploader from '../DiplomasUploader';
import CargaExcelBase from '../CargaExcelBase';

const DiplomasPage = () => {
  return (
    <Box>
      <Navbar pageTitle="Carga de Diplomas" />
      <Box sx={{ pt: 8, px: 2 }}>
        <CargaExcelBase
          titulo="Carga de Diplomas"
          subtitulo="Importa y gestiona información de diplomas académicos"
          descripcion="Utilice este módulo para cargar información completa de diplomas, incluyendo datos del graduado, tipo de diploma, modalidad, fechas de graduación y datos administrativos como libro, acta y referencia."
          UploaderComponent={DiplomasUploader}
          gradientColors={['#CE0A0A', '#b00909']}
          accentColor="#CE0A0A"
        />
      </Box>
    </Box>
  );
};

export default DiplomasPage;