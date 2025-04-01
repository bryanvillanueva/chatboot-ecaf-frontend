import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import NotasUploader from '../NotasUploader';
import CargaExcelBase from '../CargaExcelBase';

const ProgramasPage = () => {
  return (
    <Box>
      <Navbar pageTitle="Carga de Programas, Materias y Notas" />
      <Box sx={{ pt: 8, px: 2 }}>
        <CargaExcelBase
          titulo="Carga de Programas, Materias y Notas"
          subtitulo="Este módulo permite importar información académica a la base de datos utilizando archivos Excel."
          descripcion="Utilice este módulo para cargar programas académicos, materias asociadas a programas, notas de estudiantes en materias e información académica periódica."
          UploaderComponent={NotasUploader}
        />
      </Box>
    </Box>
  );
};

export default ProgramasPage;