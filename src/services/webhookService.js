import axios from 'axios';

// URL base de tu backend en Railway
const BASE_URL = 'https://webhook-ecaf-production.up.railway.app/api';

// Obtiene la lista de conversaciones
export const fetchConversations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/conversations`);
    return response.data; // Array de conversaciones
  } catch (error) {
    console.error('Error al obtener conversaciones:', error);
    throw error;
  }
};

// Obtiene los mensajes de una conversación en específico
export const fetchMessages = async (conversationId) => {
  try {
    const response = await axios.get(`${BASE_URL}/messages/${conversationId}`);
    //console.log('URL:', response.data);
    return response.data; // Array de mensajes
  } catch (error) {
    console.error('Error al obtener mensajes:', error);
    
    throw error;
  }
};
