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
  IconButton
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { fetchConversations } from '../services/webhookService';
import Messages from '../components/Messages';
import Navbar from '../components/Navbar';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

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
          height: 'calc(100vh - 40px)', // Ajuste para no generar scroll
          overflow: 'hidden',

          paddingTop: '24px', 
        }}
      >
        {/* Sidebar de Chats */}
        <Box
          sx={{
            width: '250px',
            height: '100%',
            bgcolor: 'white',
            borderRight: '1px solid #ccc',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          {/* Barra de búsqueda en lugar del título */}
          <Box sx={{ p: 2, pb: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar en los chats"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#ed403d !important' }} />
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
                  borderRadius: 2,
                  bgcolor: '#f0f2f5',
                  '& fieldset': {
                    borderColor: '#ed403d',
                  },
                  '&:hover fieldset': {
                    borderColor: '#9f0705',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#9f0705',
                  }
                }
              }}
            />
          </Box>
          
          <List
            sx={{
              flex: 1,
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                width: '6px',
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#888',
                borderRadius: '3px',
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
                      backgroundColor: selectedConversationId === conv.conversation_id ? theme.palette.action.selected : 'inherit',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                      transition: 'background 0.2s ease-in-out',
                      padding: '10px 16px',
                      cursor: 'pointer',
                    }}
                  >
                    <ListItemAvatar>
                      <Badge
                        variant="dot"
                        color="primary"
                        invisible={!conv.last_message_sender || conv.last_message_sender === 'Sharky'}
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                      >
                        <Avatar sx={{ bgcolor: theme.palette.primary.light }}>
                          {conv.client_name ? conv.client_name.charAt(0) : '?'}
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={conv.client_name || 'Sin nombre'}
                      secondary={
                        <Typography
                          variant="body2"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '160px',
                            color: conv.last_message_sender && conv.last_message_sender !== 'Sharky' ? '#003491' : 'inherit',
                          }}
                        >
                          {getLastMessagePreview(conv)}
                        </Typography>
                      }
                    />
                  </ListItem>
                  <Divider />
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
        </Box>

        {/* Contenedor del Chat */}
        <Box
          sx={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            bgcolor: 'white',
          }}
        >
          {selectedConversationId ? (
            <Messages conversationId={selectedConversationId} />
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Selecciona un chat para ver los mensajes
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default Chat;