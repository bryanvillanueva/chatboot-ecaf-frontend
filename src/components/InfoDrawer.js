import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Divider,
  Avatar,
  CircularProgress,
  Paper,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  Chip,
  Grid,
  ImageList,
  ImageListItem,
  Tab,
  Tabs,
  Button
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Person as PersonIcon, 
  Phone as PhoneIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  InsertDriveFile as FileIcon,
  Collections as GalleryIcon,
  Description as DocumentIcon
} from '@mui/icons-material';
import axios from 'axios';

// Componente personalizado para la miniatura de imagen
const ImageThumbnail = ({ mediaId, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const imageUrl = `https://webhook-ecaf-production.up.railway.app/api/download-image/${mediaId}`;
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        height: 100, 
        position: 'relative', 
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 1,
        '&:hover': { opacity: 0.9 }
      }}
      onClick={onClick}
    >
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#f0f2f5'
        }}>
          <CircularProgress size={20} />
        </Box>
      )}
      
      {error ? (
        <Box sx={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          bgcolor: '#f0f2f5'
        }}>
          <Typography variant="caption" color="error">Error</Typography>
        </Box>
      ) : (
        <img 
          src={imageUrl}
          alt="Media attachment" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            display: loading ? 'none' : 'block'
          }}
          onLoad={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setError(true);
          }}
        />
      )}
    </Box>
  );
};

const InfoDrawer = ({ open, onClose, conversationId, onMessageClick }) => {
  const [clientInfo, setClientInfo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [mediaMessages, setMediaMessages] = useState({ images: [], documents: [] });

  useEffect(() => {
    if (open && conversationId) {
      fetchClientInfo();
      fetchMessages();
    }
  }, [open, conversationId]);

  // Efecto para buscar mensajes cuando cambia la consulta de búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = messages.filter(msg => 
      msg.message && typeof msg.message === 'string' && 
      msg.message.toLowerCase().includes(query)
    );
    
    setSearchResults(results);
  }, [searchQuery, messages]);

  // Efecto para filtrar imágenes y documentos
  useEffect(() => {
    if (messages.length > 0) {
      const images = messages.filter(msg => msg.message_type === 'image');
      const documents = messages.filter(msg => msg.message_type === 'document');
      
      setMediaMessages({ images, documents });
    }
  }, [messages]);

  const fetchClientInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Obtener detalles de la conversación (incluye client_name)
      const conversationResponse = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/conversation-detail/${conversationId}`);
      
      // Obtener mensajes para extraer el número de teléfono
      const messagesResponse = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/messages/${conversationId}`);
      
      // Extraer el número de teléfono (sender que no sea "Sharky")
      const clientPhone = messagesResponse.data.find(m => m.sender && m.sender !== 'Sharky')?.sender;
      
      setClientInfo({
        name: conversationResponse.data.client_name,
        phone: clientPhone || 'No disponible',
        status: conversationResponse.data.status || 'Activo',
        createdAt: conversationResponse.data.last_message_at || new Date().toISOString()
      });
    } catch (error) {
      console.error('Error al obtener información del cliente:', error);
      setError('No fue posible cargar la información del cliente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await axios.get(`https://webhook-ecaf-production.up.railway.app/api/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error al obtener mensajes:', error);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleImageClick = (mediaId) => {
    // Encontrar el mensaje correspondiente a esta imagen
    const message = messages.find(msg => msg.media_id === mediaId);
    if (message && message.message_id) {
      // Cerrar el drawer y hacer scroll al mensaje
      onClose();
      onMessageClick(message.message_id);
    }
  };

  const handleDocumentClick = (mediaId) => {
    // Encontrar el mensaje correspondiente a este documento
    const message = messages.find(msg => msg.media_id === mediaId);
    if (message) {
      // Si tiene URL, abrir el documento en una nueva pestaña
      if (message.media_url) {
        window.open(message.media_url, '_blank');
      } else if (message.message_id) {
        // Si no tiene URL, cerrar el drawer y hacer scroll al mensaje
        onClose();
        onMessageClick(message.message_id);
      }
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  // Si no está abierto, no renderizamos nada
  if (!open) return null;

  return (
    <Paper
      elevation={3}
      sx={{
        position: 'absolute',
        right: 0,
        width: '300px',
        height: '100%', // Alto ajustado para dejar espacio para el input
        zIndex: 1200,
        overflowY: 'auto',
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
        borderLeft: '1px solid rgba(0, 0, 0, 0.12)',
        backgroundColor: 'white',
      }}
    >
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        p: 2,
        borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
      }}>
        <Typography variant="h6">Información</Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : clientInfo ? (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab 
              icon={<PersonIcon />} 
              label="Perfil" 
              id="tab-0"
              aria-controls="tabpanel-0"
            />
            <Tab 
              icon={<GalleryIcon />} 
              label="Media" 
              id="tab-1"
              aria-controls="tabpanel-1"
            />
            <Tab 
              icon={<SearchIcon />} 
              label="Buscar" 
              id="tab-2"
              aria-controls="tabpanel-2"
            />
          </Tabs>

          {/* Tab de Información */}
          <Box
            role="tabpanel"
            hidden={tabValue !== 0}
            id="tabpanel-0"
            aria-labelledby="tab-0"
            sx={{ flex: 1, overflowY: 'auto', p: 2, display: tabValue === 0 ? 'block' : 'none' }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
              <Avatar
                sx={{ 
                  width: 80, 
                  height: 80, 
                  bgcolor: 'primary.main',
                  mb: 1
                }}
              >
                {clientInfo.name ? clientInfo.name.charAt(0).toUpperCase() : "?"}
              </Avatar>
              <Typography variant="h6">{clientInfo.name || "Sin nombre"}</Typography>
              <Typography variant="body2" color="text.secondary">
                {clientInfo.status || "Estado no disponible"}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <PhoneIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Teléfono:</strong> {clientInfo.phone}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="body2">
                  <strong>Cliente desde:</strong> {formatDate(clientInfo.createdAt)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Tab de Media */}
          <Box
            role="tabpanel"
            hidden={tabValue !== 1}
            id="tabpanel-1"
            aria-labelledby="tab-1"
            sx={{ flex: 1, overflowY: 'auto', p: 2, display: tabValue === 1 ? 'block' : 'none' }}
          >
            {/* Sección de Imágenes */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Imágenes ({mediaMessages.images.length})
              </Typography>
              
              {mediaMessages.images.length > 0 ? (
                <ImageList cols={3} gap={8}>
                  {mediaMessages.images.map((image) => (
                    <ImageListItem key={image.media_id}>
                      <ImageThumbnail 
                        mediaId={image.media_id} 
                        onClick={() => handleImageClick(image.media_id)}
                      />
                    </ImageListItem>
                  ))}
                </ImageList>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
                  No hay imágenes compartidas
                </Typography>
              )}
            </Box>
            
            {/* Sección de Documentos */}
            <Box>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                Documentos ({mediaMessages.documents.length})
              </Typography>
              
              {mediaMessages.documents.length > 0 ? (
                <List disablePadding>
                  {mediaMessages.documents.map((doc) => (
                    <ListItem 
                      key={doc.media_id} 
                      sx={{ 
                        py: 1, 
                        px: 1, 
                        bgcolor: '#f5f5f5', 
                        borderRadius: 1, 
                        mb: 1,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#e0e0e0' }
                      }}
                      onClick={() => handleDocumentClick(doc.media_id)}
                    >
                      <FileIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <ListItemText 
                        primary={doc.message || "Documento"} 
                        secondary={formatDate(doc.sent_at)}
                        primaryTypographyProps={{ variant: 'body2', noWrap: true }}
                        secondaryTypographyProps={{ variant: 'caption' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', my: 2 }}>
                  No hay documentos compartidos
                </Typography>
              )}
            </Box>
          </Box>

          {/* Tab de Búsqueda */}
          <Box
            role="tabpanel"
            hidden={tabValue !== 2}
            id="tabpanel-2"
            aria-labelledby="tab-2"
            sx={{ flex: 1, overflowY: 'auto', p: 2, display: tabValue === 2 ? 'block' : 'none' }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Buscar en la conversación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton 
                      size="small" 
                      onClick={handleClearSearch}
                    >
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2,
                  bgcolor: '#f0f2f5',
                  '& fieldset': {
                    borderColor: 'transparent',
                  },
                }
              }}
              sx={{ mb: 2 }}
            />
            
            {searchResults.length > 0 ? (
              <List sx={{ 
                maxHeight: '250px', 
                overflowY: 'auto',
                bgcolor: '#f0f2f5',
                borderRadius: 2,
                p: 1
              }}>
                {searchResults.map((msg, index) => (
                  <ListItem key={msg.message_id || index} sx={{ 
                    mb: 1, 
                    p: 1,
                    bgcolor: 'white',
                    borderRadius: 1,
                    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    '&:hover': { bgcolor: '#f5f5f5' }
                  }}
                  onClick={() => {
                    onMessageClick(msg.message_id);
                    onClose();
                  }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(msg.sent_at)}
                          </Typography>
                          <Chip 
                            label={msg.sender === 'Sharky' ? 'Tú' : 'Cliente'} 
                            size="small"
                            color={msg.sender === 'Sharky' ? 'primary' : 'default'}
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                        </Box>
                      }
                      secondary={
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {msg.message}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : searchQuery && (
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  No se encontraron mensajes con "{searchQuery}"
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      ) : (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography>No hay información disponible</Typography>
        </Box>
      )}
    </Paper>
  );
};

export default InfoDrawer;