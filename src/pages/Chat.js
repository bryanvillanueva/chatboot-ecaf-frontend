import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemAvatar, 
  Avatar, 
  ListItemText, 
  Divider, 
  Badge,
  TextField,
  InputAdornment,
  IconButton,
  Paper
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fetchConversations } from '../services/webhookService';
import Messages from '../components/Messages';
import Navbar from '../components/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import MessageIcon from '@mui/icons-material/Message';

const Chat = ({ onSelectConversation }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [selectedConversationName, setSelectedConversationName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();

  useEffect(() => {
    const getConversations = async () => {
      try {
        const data = await fetchConversations();
        setConversations(data);
        setFilteredConversations(data);
      } catch (error) {
        console.error('Error al obtener conversaciones:', error);
      }
    };
    getConversations();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = conversations.filter(conv => {
      // Buscar por nombre del cliente
      if (conv.client_name && conv.client_name.toLowerCase().includes(query)) {
        return true;
      }
      // Buscar por número de teléfono
      if (conv.phone_number && conv.phone_number.includes(query)) {
        return true;
      }
      // Buscar por contenido de último mensaje
      if (conv.last_message && conv.last_message.toLowerCase().includes(query)) {
        return true;
      }
      return false;
    });

    setFilteredConversations(filtered);
  }, [searchQuery, conversations]);

  const handleSelectConversation = (conversationId, clientName) => {
    setSelectedConversationId(conversationId);
    setSelectedConversationName(clientName || 'Sin nombre');
    if (onSelectConversation) onSelectConversation(conversationId);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredConversations(conversations);
  };

  // Función para determinar qué mostrar como último mensaje según su tipo
  const getLastMessagePreview = (conversation) => {
    if (!conversation.last_message_type) {
      return conversation.last_message || 'Sin mensajes';
    }
    
    switch (conversation.last_message_type) {
      case 'audio':
        return 'Mensaje de voz';
      case 'image':
        return 'Archivo de imagen';
      case 'document':
        return 'Documento adjunto';
      default:
        return conversation.last_message || 'Sin mensajes';
    }
  };

  return (
    <>
      <style>
        {`
          @media (min-width: 600px) {
            .css-1ygil4i-MuiToolbar-root {
              min-height: 41px !important;
              height: 41px !important;
              margin: 0 !important;
              padding: 50 !important;
            }
          }
          html, body {
            margin: 0;
            padding: 0;
            height: 100%;
            overflow: hidden;
          }
            .css-zxdg2z {
              padding: 2px;
          }
        `}
      </style>

      <Navbar pageTitle={selectedConversationId ? `Chat con ${selectedConversationName}` : 'Chat'} />

      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: 'calc(100vh - 65px)', // Ajuste para no generar scroll
          overflow: 'hidden',
          paddingTop: '24px', 
        }}
      >
        {/* Sidebar de Chats */}
        <Paper
          elevation={3}
          sx={{
            width: '260px', // Reducido de 280px a 260px
            height: '100%',
            bgcolor: '#fff',
            boxShadow: '0 0 10px rgba(0,0,0,0.1)',
            borderRight: 'none',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: '8px',
            mr: 2, // Margen derecho
            overflow: 'hidden', // Ocultar overflow
          }}
        >
          {/* Título del panel de chat */}
          <Box 
            sx={{ 
              p: 1.5, // Reducido de p: 2, pb: 1.5
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
            }}
          >
            <MessageIcon sx={{ color: '#CE0A0A', mr: 1 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 500, 
                color: '#333',
                fontSize: '1.1rem'
              }}
            >
              Conversaciones
            </Typography>
          </Box>
          
          {/* Barra de búsqueda */}
          <Box sx={{ px: 1.5, py: 1 }}> {/* Reducido de p: 2, pb: 1 */}
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar en los chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#CE0A0A' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={handleClearSearch}
                      edge="end"
                      aria-label="clear search"
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: '8px',
                  bgcolor: '#f5f5f5',
                  '& fieldset': {
                    borderColor: 'rgba(206, 10, 10, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#CE0A0A',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#CE0A0A',
                  }
                }
              }}
            />
          </Box>
          
          {/* Lista de conversaciones */}
          <List
            sx={{
              flex: 1,
              overflowY: 'auto',
              overflowX: 'hidden', // Añadido para evitar scroll horizontal
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(206, 10, 10, 0.3)',
                borderRadius: '3px',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: '#f0f0f0',
              },
            }}
          >
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => (
                <React.Fragment key={conv.conversation_id}>
                  <ListItem
                    button
                    onClick={() => handleSelectConversation(conv.conversation_id, conv.client_name, conv.phone_number)}
                    sx={{
                      backgroundColor: selectedConversationId === conv.conversation_id ? 'rgba(206, 10, 10, 0.1)' : 'inherit',
                      borderLeft: selectedConversationId === conv.conversation_id ? '3px solid #CE0A0A' : '3px solid transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(206, 10, 10, 0.05)',
                      },
                      transition: 'all 0.2s ease-in-out',
                      padding: '8px 12px', // Reducido de padding: '10px 16px'
                      cursor: 'pointer',
                      borderRadius: '0',
                      my: 0.5,
                      mx: 0.5, // Reducido de mx: 1
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="error"
                        invisible={!conv.last_message_sender || conv.last_message_sender === 'Ecaf'}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: '#CE0A0A',
                          }
                        }}
                      >
                        <Avatar 
                          sx={{ 
                            bgcolor: selectedConversationId === conv.conversation_id ? '#CE0A0A' : 'rgba(206, 10, 10, 0.2)',
                            color: selectedConversationId === conv.conversation_id ? 'white' : '#CE0A0A',
                            transition: 'all 0.2s ease-in-out',
                          }}
                        >
                          {conv.client_name ? conv.client_name.charAt(0).toUpperCase() : '?'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: selectedConversationId === conv.conversation_id ? 600 : 500,
                            color: '#333'
                          }}
                        >
                          {conv.client_name || 'Sin nombre'}
                        </Typography>
                      }
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '150px', // Reducido de maxWidth: '160px'
                            color: conv.last_message_sender && conv.last_message_sender !== 'Ecaf' ? '#CE0A0A' : 'text.secondary',
                            fontWeight: conv.last_message_sender && conv.last_message_sender !== 'Ecaf' ? 500 : 400,
                            fontSize: '0.75rem',
                          }}
                        >
                          {getLastMessagePreview(conv)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider sx={{ mx: 1.5, backgroundColor: 'rgba(0,0,0,0.05)' }} /> {/* Reducido de mx: 2 */}
                </React.Fragment>
              ))
            ) : (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No se encontraron resultados
                </Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* Contenedor del Chat */}
        <Paper
          elevation={3}
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'white',
            borderRadius: '8px',
          }}
        >
          {selectedConversationId ? (
            <Messages conversationId={selectedConversationId} />
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <MessageIcon sx={{ fontSize: 60, color: 'rgba(206, 10, 10, 0.2)', mb: 2 }} />
              <Typography variant="h6" color="textSecondary" sx={{ mb: 1 }}>
                Selecciona un chat para ver los mensajes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: '400px' }}>
                Haz clic en una conversación de la lista para ver y responder mensajes.
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
    </>
  );
};

export default Chat;