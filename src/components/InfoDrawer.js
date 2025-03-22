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
  Button,
  Badge,
  Fade,
  Slide,
  Tooltip,
  Card,
  CardContent,
  useMediaQuery,
  Skeleton,
  Alert
} from '@mui/material';
import { 
  Close as CloseIcon, 
  Person as PersonIcon, 
  Phone as PhoneIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  InsertDriveFile as FileIcon,
  Collections as GalleryIcon,
  Description as DocumentIcon,
  Event as EventIcon,
  RadioButtonChecked as StatusIcon,
  PictureAsPdf as PdfIcon,
  Article as DocIcon,
  PhotoLibrary as PhotoIcon,
  Download as DownloadIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import axios from 'axios';

// Componente mejorado para miniaturas de imágenes
const ImageThumbnail = ({ mediaId, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const imageUrl = `https://webhook-ecaf-production.up.railway.app/api/download-image/${mediaId}`;
  
  return (
    <Box 
      sx={{ 
        width: '100%', 
        paddingTop: '100%', // Mantener aspecto cuadrado
        position: 'relative', 
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 2,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease-in-out',
        '&:hover': { 
          transform: 'scale(1.02)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
        }
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
          bgcolor: 'rgba(0,0,0,0.04)'
        }}>
          <CircularProgress size={20} thickness={2} />
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
          bgcolor: 'rgba(0,0,0,0.04)'
        }}>
          <Typography variant="caption" color="error">Error</Typography>
        </Box>
      ) : (
        <img 
          src={imageUrl}
          alt="Media attachment" 
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
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

// Componente para mostrar documentos con iconos específicos por tipo
const DocumentItem = ({ document, onClick }) => {
  // Función para determinar el tipo de documento y su icono
  const getDocumentIcon = () => {
    // Si el mensaje contiene información sobre el tipo, podríamos usarla
    // Por ahora, usamos iconos genéricos
    return <DocumentIcon color="primary" />;
  };

  return (
    <Card 
      sx={{ 
        mb: 1.5,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        '&:hover': { 
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box 
            sx={{ 
              borderRadius: '8px',
              bgcolor: 'primary.light',
              color: 'white',
              p: 1,
              mr: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getDocumentIcon()}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" noWrap fontWeight={500}>
              {document.message || "Documento"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
              {formatDate(document.sent_at)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

// Función para formatear fecha
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
};

// Función para resaltar texto buscado
const HighlightedText = ({ text, highlight }) => {
  if (!highlight.trim() || !text) {
    return <Typography variant="body2">{text}</Typography>;
  }

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <Typography variant="body2">
      {parts.map((part, i) => 
        regex.test(part) ? (
          <Box 
            component="span" 
            key={i} 
            sx={{ 
              backgroundColor: 'primary.light', 
              color: 'primary.contrastText',
              px: 0.5,
              borderRadius: '3px'
            }}
          >
            {part}
          </Box>
        ) : (
          part
        )
      )}
    </Typography>
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
  const [sortOrder, setSortOrder] = useState('newest');
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

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
    
    // Ordenar resultados
    const sortedResults = [...results].sort((a, b) => {
      if (sortOrder === 'newest') {
        return new Date(b.sent_at) - new Date(a.sent_at);
      } else {
        return new Date(a.sent_at) - new Date(b.sent_at);
      }
    });
    
    setSearchResults(sortedResults);
  }, [searchQuery, messages, sortOrder]);

  // Efecto para filtrar imágenes y documentos
  useEffect(() => {
    if (messages.length > 0) {
      const images = messages.filter(msg => msg.message_type === 'image');
      const documents = messages.filter(msg => msg.message_type === 'document');
      
      // Ordenar por fecha más reciente
      const sortedImages = [...images].sort((a, b) => 
        new Date(b.sent_at) - new Date(a.sent_at)
      );
      
      const sortedDocuments = [...documents].sort((a, b) => 
        new Date(b.sent_at) - new Date(a.sent_at)
      );
      
      setMediaMessages({ 
        images: sortedImages, 
        documents: sortedDocuments 
      });
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
      
      // Extraer el número de teléfono (sender que no sea "Ecaf")
      const clientPhone = messagesResponse.data.find(m => m.sender && m.sender !== 'Ecaf')?.sender;
      
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

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'newest' ? 'oldest' : 'newest');
  };

  // Si no está abierto, no renderizamos nada
  if (!open) return null;

  return (
    <Slide 
      direction="left" 
      in={open} 
      mountOnEnter 
      unmountOnExit
    >
      <Paper
        elevation={6}
        sx={{
          position: 'absolute',
          right: 0,
          width: isSmallScreen ? '100%' : '300px',
          height: '100%',
          zIndex: 1200,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderTopLeftRadius: isSmallScreen ? 0 : 12,
          borderBottomLeftRadius: isSmallScreen ? 0 : 12,
          borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: 'white',
          boxShadow: theme => isSmallScreen ? 'none' : theme.shadows[8],
        }}
      >
        {/* Encabezado con degradado */}
        <Box sx={{ 
          p: 2,
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          background: 'linear-gradient(90deg, #d32222 0%, #e57373 100%)',
          color: 'white',
          borderTopLeftRadius: isSmallScreen ? 0 : 12,
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
        }}>
          <Typography variant="h6" sx={{ fontWeight: 500 }}>Información del Chat</Typography>
          <IconButton 
            onClick={onClose} 
            size="small"
            sx={{ 
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)'
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {loading ? (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            p: 3, 
            gap: 2 
          }}>
            <Skeleton variant="rectangular" width="100%" height={40} sx={{ borderRadius: 1 }} />
            <Skeleton variant="circular" width={80} height={80} sx={{ mx: 'auto', my: 2 }} />
            <Skeleton variant="text" width="80%" sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width="60%" sx={{ mx: 'auto', mb: 2 }} />
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '50%' }}>
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => {
                fetchClientInfo();
                fetchMessages();
              }}
              startIcon={<RefreshIcon />}
              sx={{ 
                mt: 2,
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Reintentar
            </Button>
          </Box>
        ) : clientInfo ? (
          <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Tabs con iconos y texto */}
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              indicatorColor="primary"
              textColor="primary"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: '60px',
                  fontWeight: 500,
                  fontSize: '0.8rem',
                  transition: 'all 0.2s ease',
                  '&.Mui-selected': {
                    color: '#d32222',
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#d32222',
                  height: 3
                }
              }}
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
                iconPosition="start"
              />
              <Tab 
                icon={<SearchIcon />} 
                label="Buscar" 
                id="tab-2"
                aria-controls="tabpanel-2"
              />
            </Tabs>

            {/* Tab de Información de Perfil */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 0}
              id="tabpanel-0"
              aria-labelledby="tab-0"
              sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 0, 
                display: tabValue === 0 ? 'block' : 'none',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(211, 34, 34, 0.3)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              {/* Tarjeta de perfil con degradado */}
              <Box sx={{ 
                background: 'linear-gradient(135deg, rgba(211, 34, 34, 0.05) 0%, rgba(255, 255, 255, 0) 100%)',
                py: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                mb: 1
              }}>
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Tooltip title={`Estado: ${clientInfo.status}`}>
                      <StatusIcon 
                        sx={{ 
                          fontSize: 16, 
                          color: 'success.main',
                          bgcolor: 'white',
                          borderRadius: '50%',
                          padding: '2px'
                        }} 
                      />
                    </Tooltip>
                  }
                >
                  <Avatar
                    sx={{ 
                      width: 100, 
                      height: 100, 
                      bgcolor: '#d32222',
                      fontSize: '2.5rem',
                      mb: 2,
                      boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    {clientInfo.name ? clientInfo.name.charAt(0).toUpperCase() : "?"}
                  </Avatar>
                </Badge>
                <Typography variant="h5" sx={{ fontWeight: 500 }}>
                  {clientInfo.name || "Sin nombre"}
                </Typography>
                <Chip 
                  label={clientInfo.status} 
                  size="small" 
                  color="success" 
                  variant="outlined"
                  sx={{ mt: 1 }}
                />
              </Box>
              
              {/* Detalles de contacto */}
              <Box sx={{ px: 3 }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  Detalles de contacto
                </Typography>
                
                <Card sx={{ mb: 2, border: '1px solid rgba(0,0,0,0.08)' }} elevation={0}>
                  <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2, 
                      pb: 2, 
                      borderBottom: '1px solid rgba(0,0,0,0.06)'
                    }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha('#d32222', 0.1),
                        color: '#d32222',
                        borderRadius: '50%',
                        p: 1,
                        mr: 2
                      }}>
                        <PhoneIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Teléfono
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {clientInfo.phone}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: alpha('#d32222', 0.1),
                        color: '#d32222',
                        borderRadius: '50%',
                        p: 1,
                        mr: 2
                      }}>
                        <EventIcon />
                      </Box>
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Cliente desde
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {formatDate(clientInfo.createdAt).split(' ')[0]}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
                
                {/* Estadísticas de la conversación */}
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    mt: 3,
                    mb: 2, 
                    color: 'text.secondary',
                    fontWeight: 500,
                    textTransform: 'uppercase',
                    fontSize: '0.75rem'
                  }}
                >
                  Estadísticas de la conversación
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      py: 2,
                      border: '1px solid rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                      }
                    }} elevation={0}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                        {messages.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Mensajes
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6}>
                    <Card sx={{ 
                      textAlign: 'center', 
                      py: 2,
                      border: '1px solid rgba(0,0,0,0.08)',
                      transition: 'transform 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.05)'
                      }
                    }} elevation={0}>
                      <Typography variant="h4" color="primary" sx={{ fontWeight: 600 }}>
                        {mediaMessages.images.length + mediaMessages.documents.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Archivos
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </Box>

            {/* Tab de Media */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 1}
              id="tabpanel-1"
              aria-labelledby="tab-1"
              sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                p: 3, 
                display: tabValue === 1 ? 'block' : 'none',
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(211, 34, 34, 0.3)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              {/* Sección de Imágenes */}
              <Box sx={{ mb: 4 }}>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PhotoIcon 
                      sx={{ 
                        color: '#d32222', 
                        mr: 1, 
                        fontSize: '1.2rem' 
                      }} 
                    />
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#d32222' 
                      }}
                    >
                      Imágenes ({mediaMessages.images.length})
                    </Typography>
                  </Box>
                  {mediaMessages.images.length > 0 && (
                    <Tooltip title="Descargar todas las imágenes">
                      <IconButton size="small" color="primary">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                {mediaMessages.images.length > 0 ? (
                  <ImageList cols={2} gap={8}>
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
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    bgcolor: 'rgba(0,0,0,0.03)', 
                    borderRadius: 2 
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay imágenes compartidas
                    </Typography>
                  </Box>
                )}
              </Box>
              
              {/* Sección de Documentos */}
              <Box>
                <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <DocumentIcon 
                      sx={{ 
                        color: '#d32222', 
                        mr: 1, 
                        fontSize: '1.2rem' 
                      }} 
                    />
                    <Typography 
                      variant="subtitle1" 
                      sx={{ 
                        fontWeight: 600, 
                        color: '#d32222' 
                      }}
                    >
                      Documentos ({mediaMessages.documents.length})
                    </Typography>
                  </Box>
                  {mediaMessages.documents.length > 0 && (
                    <Tooltip title="Descargar todos los documentos">
                      <IconButton size="small" color="primary">
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                
                {mediaMessages.documents.length > 0 ? (
                  <List disablePadding>
                    {mediaMessages.documents.map((doc) => (
                      <DocumentItem 
                        key={doc.media_id} 
                        document={doc}
                        onClick={() => handleDocumentClick(doc.media_id)}
                      />
                    ))}
                  </List>
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    textAlign: 'center', 
                    bgcolor: 'rgba(0,0,0,0.03)', 
                    borderRadius: 2 
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay documentos compartidos
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>

            {/* Tab de Búsqueda */}
            <Box
              role="tabpanel"
              hidden={tabValue !== 2}
              id="tabpanel-2"
              aria-labelledby="tab-2"
              sx={{ 
                flex: 1, 
                display: 'flex',
                flexDirection: 'column',
                p: 0, 
                display: tabValue === 2 ? 'flex' : 'none'
              }}
            >
              <Box sx={{ p: 2, borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Buscar en la conversación..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon fontSize="small" sx={{ color: '#d32222' }} />
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
                      bgcolor: 'rgba(0,0,0,0.04)',
                      '&.Mui-focused': {
                        boxShadow: `0 0 0 2px ${alpha('#d32222', 0.2)}`
                      },
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                      '&:hover fieldset': {
                        borderColor: alpha('#d32222', 0.3),
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#d32222',
                      }
                    }
                  }}
                />
              </Box>
              
              {/* Ordenar resultados */}
              {searchResults.length > 0 && (
                <Box sx={{ 
                  px: 2, 
                  py: 1, 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid rgba(0,0,0,0.08)'
                }}>
                  <Typography variant="body2" color="text.secondary">
                    {searchResults.length} resultados
                  </Typography>
                  <Button 
                    variant="text" 
                    size="small"
                    color="primary"
                    onClick={toggleSortOrder}
                    startIcon={sortOrder === 'newest' ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />}
                    sx={{ textTransform: 'none' }}
                  >
                    {sortOrder === 'newest' ? 'Más recientes' : 'Más antiguos'}
                  </Button>
                </Box>
              )}
              
              {/* Resultados de búsqueda */}
              <Box sx={{ 
                flex: 1, 
                overflowY: 'auto',
                p: 2,
                '&::-webkit-scrollbar': {
                  width: '6px',
                },
                '&::-webkit-scrollbar-thumb': {
                  backgroundColor: 'rgba(211, 34, 34, 0.3)',
                  borderRadius: '3px',
                },
                '&::-webkit-scrollbar-track': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}>
                {searchResults.length > 0 ? (
                  <List disablePadding>
                    {searchResults.map((msg, index) => (
                      <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 50}ms` }} key={msg.message_id || index}>
                        <ListItem sx={{ 
                          mb: 1.5, 
                          p: 0,
                          display: 'block'
                        }}
                        >
                          <Card
                            elevation={0}
                            onClick={() => {
                              onMessageClick(msg.message_id);
                              onClose();
                            }}
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              border: '1px solid rgba(0,0,0,0.08)',
                              borderRadius: 2,
                              transition: 'all 0.2s ease',
                              '&:hover': { 
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                              }
                            }}
                          >
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              mb: 1
                            }}>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(msg.sent_at)}
                              </Typography>
                              <Chip 
                                label={msg.sender === 'Ecaf' ? 'Tú' : 'Cliente'} 
                                size="small"
                                color={msg.sender === 'Ecaf' ? 'primary' : 'default'}
                                sx={{ 
                                  height: 20, 
                                  fontSize: '0.65rem',
                                  fontWeight: 500
                                }}
                              />
                            </Box>
                            
                            <Box sx={{ mt: 1 }}>
                              <HighlightedText 
                                text={msg.message} 
                                highlight={searchQuery} 
                              />
                            </Box>
                          </Card>
                        </ListItem>
                      </Fade>
                    ))}
                  </List>
                ) : searchQuery ? (
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '80%',
                    textAlign: 'center'
                  }}>
                    <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      No se encontraron resultados
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No hay mensajes que contengan "<strong>{searchQuery}</strong>"
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ 
                    p: 3, 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '80%',
                    textAlign: 'center'
                  }}>
                    <SearchIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
                      Busca en la conversación
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Introduce texto para buscar mensajes en esta conversación
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography>No hay información disponible</Typography>
          </Box>
        )}
      </Paper>
    </Slide>
  );
};

export default InfoDrawer;