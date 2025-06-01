import axios from 'axios';

// URL base de la API con la URL directa
const API_BASE_URL = 'https://webhook-ecaf-production.up.railway.app';

// Servicio para cargar estudiantes
export const uploadEstudiantes = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('tipo', 'estudiantes');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/cargar-excel`, formData, {
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
  formData.append('archivo', file);
  formData.append('tipo', 'notas');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/cargar-excel`, formData, {
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

// Servicio para cargar diplomas
export const uploadDiplomas = async (file) => {
  const formData = new FormData();
  formData.append('archivo', file);
  formData.append('tipo', 'diplomas');

  try {
    const response = await axios.post(`${API_BASE_URL}/api/cargar-excel`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error al cargar diplomas:', error);
    throw error;
  }
};

// Servicio para obtener plantillas
export const getPlantilla = async (tipo) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/plantillas-excel/${tipo}`, {
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