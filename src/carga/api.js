import axios from 'axios';

// URL base de la API - Ajustar según tu configuración
const API_BASE_URL = process.env.REACT_APP_API_URL || '';

// Servicio para cargar estudiantes
export const uploadEstudiantes = async (file) => {
  const formData = new FormData();
  formData.append('excel_file', file);
  formData.append('type', 'estudiantes');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/carga/estudiantes`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al cargar estudiantes:', error);
    throw error;
  }
};

// Servicio para cargar notas, programas y materias
export const uploadNotas = async (file) => {
  const formData = new FormData();
  formData.append('excel_file', file);
  formData.append('type', 'notas');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/carga/notas`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al cargar notas:', error);
    throw error;
  }
};

// Servicio para obtener plantillas
export const getPlantilla = async (tipo) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/carga/plantillas/${tipo}`, {
      responseType: 'blob'
    });
    
    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Plantilla_${tipo}.xlsx`);
    document.body.appendChild(link);
    link.click();
    
    // Limpiar
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
    
    return true;
  } catch (error) {
    console.error(`Error al descargar plantilla ${tipo}:`, error);
    throw error;
  }
};
