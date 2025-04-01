import React from 'react';
import { Box } from '@mui/material';
import Navbar from '../../components/Navbar';
import EstudiantesUploader from '../EstudiantesUploader';
import CargaExcelBase from '../CargaExcelBase';

const EstudiantesPage = () => {
  return (
    <Box>
      <Navbar pageTitle="Carga de Información de Estudiantes" />
      <Box sx={{ pt: 8, px: 2 }}>
        <CargaExcelBase
          titulo="Carga de Información de Estudiantes"
          subtitulo="Este módulo permite importar información de estudiantes a la base de datos utilizando archivos Excel."
          descripcion="Utilice este módulo para cargar datos personales de los estudiantes, como información básica, documentos de identidad, información de contacto y datos demográficos."
          UploaderComponent={EstudiantesUploader}
        />
      </Box>
    </Box>
  );
};

export default EstudiantesPage;