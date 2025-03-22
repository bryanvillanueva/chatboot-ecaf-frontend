import React, { useEffect, useState, useRef } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  IconButton, 
  TextField, 
  InputAdornment,
  CircularProgress,
  FormControlLabel,
  Switch,
  Button,
  Modal,
  Paper,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Menu,
  MenuItem,
  Tooltip,
  Fade,
  Zoom,
  useMediaQuery
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon, 
  MoreVert as MoreVertIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  DoneAll as DoneAllIcon,
  PhotoCamera as PhotoCameraIcon,
  Description as DescriptionIcon,
  PictureAsPdf as PictureAsPdfIcon,
  Article as ArticleIcon,
  TableChart as TableChartIcon,
  Slideshow as SlideshowIcon,
  InsertDriveFile as InsertDriveFileIcon,
  Visibility as VisibilityIcon,
  GetApp as GetAppIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages } from '../services/webhookService';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import CustomAudioPlayer from './customAudioPlayer';
import InfoDrawer from './InfoDrawer';

// Componente mejorado para renderizar imágenes con carga progresiva
const MessageImage = ({ mediaId, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  // Generamos la URL directa al endpoint proxy
  const imageProxyUrl = `https://webhook-ecaf-production.up.railway.app/api/download-image/${mediaId}`;
  const imageSrc = `${imageProxyUrl}?v=${retryCount}`;
  
  const handleImageLoaded = () => {
    setLoading(false);
    setError(null);
    setImageLoaded(true);
  };
  
  const handleImageError = () => {
    setLoading(false);
    setError('No se pudo cargar la imagen');
  };
  
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };
  
  useEffect(() => {
    setLoading(true);
    setError(null);
    setRetryCount(0);
    setImageLoaded(false);
  }, [mediaId]);

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      mt: 1, 
      mb: 1,
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '12px',
      backgroundColor: 'rgba(0,0,0,0.05)'
    }}>   
      {loading && (
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '150px',
          width: '100%'
        }}>
          <CircularProgress size={24} thickness={4} />
        </Box>
      )}
      
      {error ? (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          gap: 1,
          p: 2 
        }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
            sx={{ 
              borderRadius: '20px',
              textTransform: 'none'
            }}
          >
            Intentar de nuevo
          </Button>
        </Box>
      ) : (
        <Zoom in={imageLoaded} timeout={300}>
          <img 
            src={imageSrc}
            alt="Message attachment" 
            style={{ 
              maxWidth: '100%',
              maxHeight: '200px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: loading ? 'none' : 'block',
              objectFit: 'contain',
              transition: 'transform 0.2s ease-in-out',
            }}
            onLoad={handleImageLoaded}
            onError={handleImageError}
            onClick={onClick || (() => window.open(imageSrc, '_blank'))}
          />
        </Zoom>
      )}
    </Box>
  );
};

// Componente mejorado para renderizar documentos
const MessageDocument = ({ mediaId, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  const documentProxyUrl = `https://webhook-ecaf-production.up.railway.app/api/download-document/${mediaId}`;
  const displayFileName = fileName || 'Documento adjunto';
  
  const getFileIcon = () => {
    if (!fileName) return <DescriptionIcon fontSize="large" color="primary" />;
    
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon fontSize="large" color="error" />;
      case 'doc':
      case 'docx':
        return <ArticleIcon fontSize="large" color="primary" />;
      case 'xls':
      case 'xlsx':
        return <TableChartIcon fontSize="large" color="success" />;
      case 'ppt':
      case 'pptx':
        return <SlideshowIcon fontSize="large" color="warning" />;
      default:
        return <InsertDriveFileIcon fontSize="large" color="primary" />;
    }
  };
  
  useEffect(() => {
    const checkDocumentAvailability = async () => {
      try {
        setLoading(true);
        await axios.head(`${documentProxyUrl}?v=${retryCount}`);
        setLoading(false);
        setError(null);
      } catch (err) {
        setLoading(false);
        setError('No se pudo acceder al documento');
      }
    };
    
    checkDocumentAvailability();
  }, [documentProxyUrl, retryCount]);
  
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };
  
  const handleOpenDocument = () => {
    window.open(`${documentProxyUrl}?v=${retryCount}`, '_blank');
  };
  
  const handleDownloadDocument = () => {
    const link = document.createElement('a');
    link.href = `${documentProxyUrl}?v=${retryCount}&download=true`;
    link.download = displayFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Zoom in={!loading || error} timeout={300}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        p: 1.5,
        mt: 1, 
        mb: 1,
        bgcolor: 'rgba(0, 0, 0, 0.04)',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '240px',
        border: '1px solid rgba(0,0,0,0.08)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
        }
      }}>
        {loading ? (
          <CircularProgress size={24} sx={{ my: 1 }} />
        ) : error ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, p: 1 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              size="small" 
              onClick={handleRefresh}
              startIcon={<RefreshIcon />}
              sx={{ 
                borderRadius: '20px',
                textTransform: 'none'
              }}
            >
              Reintentar
            </Button>
          </Box>
        ) : (
          <>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              width: '100%'
            }}>
              <Box sx={{ my: 1 }}>
                {getFileIcon()}
              </Box>
              <Typography 
                variant="body2" 
                sx={{ 
                  textAlign: 'center', 
                  mb: 1,
                  maxWidth: '100%',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  fontWeight: 500
                }}
              >
                {displayFileName}
              </Typography>
              
              <Box sx={{ 
                display: 'flex', 
                gap: 1, 
                mt: 1,
                width: '100%',
                justifyContent: 'center'
              }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="small" 
                  onClick={handleOpenDocument}
                  startIcon={<VisibilityIcon />}
                  sx={{ 
                    flexGrow: 1, 
                    maxWidth: '50%',
                    borderRadius: '20px',
                    textTransform: 'none'
                  }}
                >
                  Ver
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="small" 
                  onClick={handleDownloadDocument}
                  startIcon={<GetAppIcon />}
                  sx={{ 
                    flexGrow: 1, 
                    maxWidth: '50%',
                    borderRadius: '20px',
                    textTransform: 'none'
                  }}
                >
                  Descargar
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Zoom>
  );
};

// Componente para la vista previa de imagen
const ImagePreview = ({ file, onRemove }) => {
  const [preview, setPreview] = useState('');
  
  useEffect(() => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    
    return () => {
      reader.abort();
    };
  }, [file]);
  
  return (
    <Zoom in={true} timeout={300}>
      <Box 
        sx={{ 
          mt: 2, 
          mb: 2, 
          position: 'relative',
          display: 'inline-block',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}
      >
        <img 
          src={preview} 
          alt="Preview" 
          style={{
            maxWidth: '150px',
            maxHeight: '150px',
            objectFit: 'cover'
          }}
        />
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 4,
            right: 4,
            backgroundColor: 'rgba(255,255,255,0.8)',
            '&:hover': { 
              backgroundColor: 'white',
              transform: 'scale(1.1)'
            },
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s ease'
          }}
          onClick={onRemove}
        >
          <DeleteIcon fontSize="small" color="error" />
        </IconButton>
      </Box>
    </Zoom>
  );
};

const Messages = ({ conversationId }) => {
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [autoresponse, setAutoresponse] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [openImageModal, setOpenImageModal] = useState(false);
  const [modalImageSrc, setModalImageSrc] = useState('');
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);
  const theme = useTheme();
  const ICON_COLOR = '#d32222';
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messageRefs = useRef({});
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [messageGroups, setMessageGroups] = useState([]);
  const isSmallScreen = useMediaQuery('(max-width:600px)');
  const inputRef = useRef(null);
  
  // Agrupar mensajes por tiempo y remitente
  useEffect(() => {
    if (messages.length === 0) return;
    
    // Ordenar primero por fecha (más antiguo a más reciente)
    const sortedMessages = [...messages].sort((a, b) => 
      new Date(a.sent_at) - new Date(b.sent_at)
    );
    
    const groups = [];
    let currentGroup = [sortedMessages[0]];
    
    for (let i = 1; i < sortedMessages.length; i++) {
      const currentMsg = sortedMessages[i];
      const prevMsg = sortedMessages[i-1];
      
      // Si el mensaje es del mismo remitente y dentro de 2 minutos del anterior
      const senderMatch = currentMsg.sender === prevMsg.sender;
      const timeDiff = Math.abs(new Date(currentMsg.sent_at) - new Date(prevMsg.sent_at)) / 60000; // diferencia en minutos
      
      if (senderMatch && timeDiff < 2) {
        currentGroup.push(currentMsg);
      } else {
        groups.push([...currentGroup]);
        currentGroup = [currentMsg];
      }
    }
    
    // Añadir el último grupo
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    // Invertir el orden de los grupos para mostrar los más recientes primero
    setMessageGroups(groups.reverse());
  }, [messages]);

  const handleOpenInfoDrawer = () => {
    setInfoDrawerOpen(true);
  };
  
  const handleCloseInfoDrawer = () => {
    setInfoDrawerOpen(false);
  };

  const handleMessageClick = (messageId) => {
    setHighlightedMessageId(messageId);
    
    setTimeout(() => {
      if (messageRefs.current[messageId]) {
        const messageElement = messageRefs.current[messageId];
        
        messageElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };
  
  const clientName = messages.find(m => m.sender && m.sender !== 'Ecaf')?.sender || conversationId;

  const handleOpenImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setOpenImageModal(true);
  };
  
  useEffect(() => {
    if (conversationId) {
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/conversation-detail/${conversationId}`)
        .then((res) => {
          const conv = res.data;
          setAutoresponse(!!conv.autoresponse);
        })
        .catch((error) => {
          console.error("Error fetching conversation details", error);
        });
    }
  }, [conversationId]);
  
  const handleAutoresponseToggle = async (e) => {
    const newValue = e.target.checked;
    setAutoresponse(newValue);
    try {
      await axios.put(`https://webhook-ecaf-production.up.railway.app/api/conversations/${conversationId}/autoresponse`, { autoresponse: newValue });
    } catch (error) {
      console.error('Error updating autoresponse:', error.response ? error.response.data : error.message);
    }
  };

  useEffect(() => {
    if (conversationId) {
      let previousMessagesCount = messages.length;
      const interval = setInterval(async () => {
        try {
          const data = await fetchMessages(conversationId);
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          
          if (sortedMessages.length > previousMessagesCount) {
            const newMessages = sortedMessages.slice(0, sortedMessages.length - previousMessagesCount);
            const newCustomerMessage = newMessages.find(m => m.sender && m.sender !== 'Ecaf');
            if (newCustomerMessage) {
              if (Notification.permission === 'granted') {
                new Notification('Nuevo mensaje recibido', {
                  body: newCustomerMessage.message,
                  icon: '/path/to/icon.png'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('Nuevo mensaje recibido', {
                      body: newCustomerMessage.message,
                      icon: '/path/to/icon.png'
                    });
                  }
                });
              }
            }
          }
          
          previousMessagesCount = sortedMessages.length;
          setMessages(sortedMessages);
        } catch (error) {
          console.error('Error al obtener mensajes:', error);
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId, messages.length]);
  
  useEffect(() => {
    if (conversationId) {
      const getMessages = async () => {
        try {
          const data = await fetchMessages(conversationId);
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          setMessages(sortedMessages);
          setTimeout(scrollToBottom, 100);
        } catch (error) {
          console.error('Error al obtener mensajes:', error);
        }
      };
      getMessages();
    }
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setInputMessage('');
    setSelectedImage(null);
  }, [conversationId]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
    }
  };

  const handleReply = (messageId) => {
    setReplyingTo(messages.find(m => m.message_id === messageId));
    setShowEmojiPicker(false);
    setAnchorEl(null);
    
    // Enfocar el input después de configurar la respuesta
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleImageSelection = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleOpenMenu = (event, messageId) => {
    setAnchorEl(event.currentTarget);
    setActiveMessageId(messageId);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setActiveMessageId(null);
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() || selectedImage) {
      setIsSending(true);
      
      try {
        const clientPhone = messages.find(m => m.sender && m.sender !== 'Ecaf')?.sender;
        if (!clientPhone) {
          console.error('No client phone number found in messages.');
          setIsSending(false);
          return;
        }
        
        if (selectedImage) {
          const formData = new FormData();
          formData.append('file', selectedImage);
          formData.append('to', clientPhone);
          formData.append('conversationId', conversationId);
          formData.append('caption', inputMessage);
          formData.append('sender', 'Ecaf');
          
          await axios.post(
            'https://webhook-ecaf-production.up.railway.app/api/send-media',
            formData,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data' 
              } 
            }
          );
          
          setSelectedImage(null);
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        } 
        else if (inputMessage.trim()) {
          const payload = {
            to: clientPhone,
            conversationId,
            message: inputMessage,
            sender: 'Ecaf'
          };

          await axios.post(
            'https://webhook-ecaf-production.up.railway.app/send-manual-message',
            payload
          );
        }

        const data = await fetchMessages(conversationId);
        const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        setMessages(sortedMessages);
        scrollToBottom();
        
        setInputMessage('');
        setReplyingTo(null);
        setShowEmojiPicker(false);
        
      } catch (error) {
        console.error('Error sending message:', error.response ? error.response.data : error.message);
        alert(`Error al enviar mensaje: ${error.response?.data?.error || 'Ha ocurrido un error'}`);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleEditMessage = (messageId, currentMessage) => {
    const newMessage = prompt('Editar mensaje:', currentMessage);
    
    if (newMessage === null || newMessage === '') {
      return;
    }
    
    fetch(`/api/edit-message/${messageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ newMessage }),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la solicitud');
      }
      return response.json();
    })
    .then(data => {
      setMessages(prevMessages => 
        prevMessages.map(msg => 
          msg.message_id.toString() === messageId.toString() 
            ? { ...msg, message: newMessage } 
            : msg
        )
      );
    })
    .catch(error => {
      console.error('Error completo:', error);
      alert('Error al editar mensaje: ' + error.message);
    });
    
    setAnchorEl(null);
  };

  const handleDeleteMessageRequest = (messageId) => {
    setMessageToDelete(messageId);
    setOpenDeleteDialog(true);
    setAnchorEl(null);
  };

  const confirmDeleteMessage = () => {
    if (!messageToDelete) return;
    
    axios.delete(`https://webhook-ecaf-production.up.railway.app/api/delete-message/${messageToDelete}`)
      .then(response => {
        setMessages(prevMessages => 
          prevMessages.filter(msg => msg.message_id.toString() !== messageToDelete.toString())
        );
      })
      .catch(error => {
        console.error('Error completo:', error);
        alert('Error al eliminar mensaje: ' + (error.response?.data?.error || error.message));
      })
      .finally(() => {
        setOpenDeleteDialog(false);
        setMessageToDelete(null);
      });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const clientPhone = messages.find(m => m.sender && m.sender !== 'Ecaf')?.sender;
    if (!clientPhone) {
      alert('No se encontró el número de teléfono del cliente');
      return;
    }

    setIsSending(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('to', clientPhone);
      formData.append('conversationId', conversationId);
      formData.append('caption', '');
      formData.append('sender', 'Ecaf');
      
      await axios.post(
        'https://webhook-ecaf-production.up.railway.app/api/send-media',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      const data = await fetchMessages(conversationId);
      const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending document:', error);
      let errorMessage = 'Error al enviar el documento';
      
      if (error.response) {
        errorMessage = error.response.data.error || error.response.data.details || errorMessage;
      }
      
      alert(`Error al enviar documento: ${errorMessage}`);
    } finally {
      setIsSending(false);
      if (documentInputRef.current) {
        documentInputRef.current.value = '';
      }
    }
  };

  // Renderizado del contenido del mensaje según su tipo
  const renderMessageContent = (msg) => {
    switch (msg.message_type) {
      case 'audio':
        return (
          <CustomAudioPlayer 
            src={`https://webhook-ecaf-production.up.railway.app/api/download-media?url=${encodeURIComponent(msg.media_url)}&mediaId=${encodeURIComponent(msg.media_id)}`} 
          />
        );
      case 'image':
        return (
          <MessageImage 
            mediaId={msg.media_id} 
            onClick={() => handleOpenImageModal(`https://webhook-ecaf-production.up.railway.app/api/download-image/${msg.media_id}`)}
          />
        );
      case 'document':
        return (
          <MessageDocument 
            mediaId={msg.media_id} 
            fileName={"Documento Adjunto"}
          />
        );
      default:
        return <Typography variant="body1">{msg.message}</Typography>;
    }
  };

  // Renderizar indicador de estado de mensaje
  const renderMessageStatus = (msg) => {
    if (msg.sender !== 'Ecaf') return null;
    
    // Simulación: asumimos que todos los mensajes enviados son leídos después de un tiempo
    const isRead = new Date() - new Date(msg.sent_at) > 60000; // más de 1 minuto = leído
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 0.5 }}>
        {isRead ? (
          <DoneAllIcon sx={{ fontSize: 14, color: '#4FC3F7' }} />
        ) : (
          <CheckCircleOutlineIcon sx={{ fontSize: 14, color: '#9E9E9E' }} />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        position: 'relative',
        backgroundColor: "#f5f5f5", 
        backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' viewBox=\'0 0 100 100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z\' fill=\'%23d32222\' fill-opacity=\'0.03\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")',
        backgroundSize: 'auto',
        backgroundPosition: 'center',
        transition: 'padding-right 0.3s ease',
        paddingRight: infoDrawerOpen ? '300px' : '0',
      }}
    >
      {/* Cabecera de chat */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 1.5,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          backgroundColor: 'white',
          backdropFilter: 'blur(5px)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          zIndex: 10,
        }}
      >
        <Typography variant="h6" sx={{ 
          fontWeight: 500,
          display: 'flex',
          alignItems: 'center'
        }}>
          {clientName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControlLabel 
            control={
              <Switch 
                checked={autoresponse} 
                onChange={handleAutoresponseToggle}
                color="error"
                size="small"
              />
            } 
            label={
              <Typography variant="body2" sx={{ fontSize: isSmallScreen ? '0.75rem' : '0.875rem' }}>
                Respuestas automáticas
              </Typography>
            }
          />
          <Tooltip title="Información">
            <IconButton 
              color="primary" 
              onClick={handleOpenInfoDrawer}
              sx={{ ml: 1 }}
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Lista de mensajes */}
      <List
        ref={messagesContainerRef}
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: 1,
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(211, 34, 34, 0.3)',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '4px',
          },
        }}
      >
        {messageGroups.length > 0 ? (
          messageGroups.map((group, groupIndex) => (
            <Box 
              key={`group-${groupIndex}`} 
              sx={{ 
                mb: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: group[0].sender === 'Ecaf' ? 'flex-end' : 'flex-start',
              }}
            >
              {/* Indicador de hora para el grupo (sólo se muestra una vez por grupo) */}
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ 
                  px: 2, 
                  mb: 0.5, 
                  fontSize: '0.7rem',
                  opacity: 0.7
                }}
              >
                {new Date(group[0].sent_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </Typography>
              
              {/* Mensajes dentro del grupo */}
              {group.map((msg, msgIndex) => (
                <ListItem 
                  key={msg.message_id}
                  ref={(el) => messageRefs.current[msg.message_id] = el}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'Ecaf' ? 'flex-end' : 'flex-start',
                    px: 0,
                    py: 0.3,
                    ...(highlightedMessageId === msg.message_id && {
                      animation: 'highlight 2s',
                      '@keyframes highlight': {
                        '0%': { backgroundColor: 'rgba(66, 165, 245, 0.3)' },
                        '100%': { backgroundColor: 'transparent' }
                      }
                    })
                  }}
                  disableGutters
                  disablePadding
                >
                  <Box
                    sx={{
                      position: 'relative',
                      maxWidth: isSmallScreen ? '85%' : '70%',
                      '&:hover': {
                        '& .message-actions-btn': {
                          opacity: 1,
                          transform: 'translateY(0)'
                        }
                      },
                    }}
                  >
                    {/* Botón único para acciones */}
                    <IconButton
                      className="message-actions-btn"
                      size="small"
                      onClick={(e) => handleOpenMenu(e, msg.message_id)}
                      sx={{
                        position: 'absolute',
                        right: msg.sender === 'Ecaf' ? 'auto' : '-28px',
                        left: msg.sender === 'Ecaf' ? '-28px' : 'auto',
                        top: '50%',
                        transform: 'translateY(-50%) translateY(-5px)',
                        bgcolor: 'white',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                        opacity: 0,
                        transition: 'opacity 0.2s, transform 0.2s',
                        '&:hover': {
                          bgcolor: 'grey.100',
                        },
                        zIndex: 2
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                    
                    {/* Burbuja de mensaje */}
                    <Fade in={true} timeout={300}>
                      <Box
                        sx={{
                          backgroundColor: msg.sender === 'Ecaf' ? '#d32222' : 'white',
                          color: msg.sender === 'Ecaf' ? 'white' : 'inherit',
                          borderRadius: msg.sender === 'Ecaf' 
                            ? '18px 18px 4px 18px' 
                            : '18px 18px 18px 4px',
                          p: 1.5,
                          wordBreak: 'break-word',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          transition: 'transform 0.1s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-1px)',
                          },
                          position: 'relative'
                        }}
                      >
                        {renderMessageContent(msg)}
                        {renderMessageStatus(msg)}
                      </Box>
                    </Fade>
                  </Box>
                </ListItem>
              ))}
            </Box>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, color: 'text.secondary' }}>
            No hay mensajes en esta conversación.
          </Typography>
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* Menú contextual para acciones de mensaje */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        PaperProps={{
          elevation: 3,
          sx: { 
            borderRadius: '12px',
            minWidth: '150px',
            overflow: 'hidden'
          }
        }}
      >
        <MenuItem onClick={() => handleReply(activeMessageId)} sx={{ py: 1 }}>
          <ReplyIcon fontSize="small" sx={{ mr: 1, color: ICON_COLOR }} />
          <Typography variant="body2">Responder</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleDeleteMessageRequest(activeMessageId)} sx={{ py: 1 }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1, color: ICON_COLOR }} />
          <Typography variant="body2">Eliminar</Typography>
        </MenuItem>
      </Menu>

      {/* Modal para visualizar imágenes */}
      <Modal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        closeAfterTransition
      >
        <Fade in={openImageModal}>
          <Box sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '90%',
            maxHeight: '90%',
            outline: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            <Paper 
              elevation={24}
              sx={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                boxShadow: '0 24px 38px rgba(0,0,0,0.3)'
              }}
            >
              <IconButton 
                sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  bgcolor: 'rgba(0,0,0,0.4)',
                  color: 'white',
                  '&:hover': { 
                    bgcolor: 'rgba(0,0,0,0.6)' 
                  }
                }}
                onClick={() => setOpenImageModal(false)}
              >
                <CloseIcon />
              </IconButton>
              <img 
                src={modalImageSrc} 
                alt="Full size" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: 'calc(90vh - 40px)',
                  display: 'block',
                  objectFit: 'contain' 
                }} 
              />
            </Paper>
          </Box>
        </Fade>
      </Modal>

      {/* Indicador de carga */}
      {isSending && (
        <Fade in={isSending}>
          <Box sx={{ 
            position: 'absolute', 
            bottom: '80px', 
            right: '20px',
            p: 1,
            bgcolor: 'rgba(255,255,255,0.8)',
            borderRadius: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <CircularProgress size={24} sx={{ color: ICON_COLOR }} />
          </Box>
        </Fade>
      )}

      {/* UI de respuesta */}
      {replyingTo && (
        <Fade in={true}>
          <Box
            sx={{
              p: 1.5,
              bgcolor: 'rgba(255,255,255,0.9)',
              borderTop: '1px solid rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between'
            }}
          >
            <Box
              sx={{
                pl: 2,
                py: 0.5,
                borderLeft: `3px solid ${ICON_COLOR}`,
                flexGrow: 1
              }}
            >
              <Typography variant="body2" color="textSecondary" sx={{ mb: 0.5, fontSize: '0.75rem' }}>
                Respondiendo a:
              </Typography>
              <Typography variant="body2" noWrap sx={{ maxWidth: '90%' }}>
                {replyingTo.message}
              </Typography>
            </Box>
            <IconButton 
              size="small" 
              onClick={() => setReplyingTo(null)}
              sx={{ 
                ml: 1,
                bgcolor: 'rgba(0,0,0,0.05)',
                '&:hover': {
                  bgcolor: 'rgba(0,0,0,0.1)'
                }
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        </Fade>
      )}

      {/* Vista previa de imagen */}
      {selectedImage && (
        <Box sx={{ 
          p: 1.5, 
          borderTop: '1px solid rgba(0,0,0,0.1)', 
          textAlign: 'center',
          bgcolor: 'white'
        }}>
          <ImagePreview file={selectedImage} onRemove={handleRemoveSelectedImage} />
        </Box>
      )}

      {/* Emoji Picker y inputs ocultos */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: selectedImage ? '160px' : '80px',
            left: '20px',
            zIndex: 20,
            boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
            borderRadius: '12px',
            overflow: 'hidden',
          }}
        >
          <Paper elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', bgcolor: 'white', p: 0.5 }}>
              <IconButton size="small" onClick={() => setShowEmojiPicker(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <EmojiPicker 
              onEmojiClick={handleEmojiClick}
              lazyLoadEmojis={true}
              searchPlaceholder="Buscar emoji..."
              width={isSmallScreen ? 300 : 350}
              height={350}
            />
          </Paper>
        </Box>
      )}

      {/* Inputs ocultos para archivos */}
      <input
        type="file"
        accept="image/*"
        ref={imageInputRef}
        style={{ display: 'none' }}
        onChange={handleImageSelection}
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx"
        ref={documentInputRef}
        style={{ display: 'none' }}
        onChange={handleDocumentUpload}
      />

      {/* Input de mensaje */}
      <Paper 
        elevation={3}
        sx={{
          p: 1.5,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: 'white',
          position: 'relative',
          zIndex: 5
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          placeholder="Escribe un mensaje..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          inputRef={inputRef}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '24px',
              backgroundColor: '#f8f8f8',
              transition: 'all 0.2s ease',
              '&:hover, &.Mui-focused': {
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
              },
              '& fieldset': {
                borderColor: 'rgba(0,0,0,0.1)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(211, 34, 34, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: ICON_COLOR,
                borderWidth: '2px'
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: isSmallScreen ? 0.5 : 1 }}>
                  <IconButton 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ 
                      color: ICON_COLOR,
                      p: isSmallScreen ? 0.5 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 34, 34, 0.04)'
                      }
                    }}
                  >
                    <EmojiIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                  <IconButton 
                    onClick={() => imageInputRef.current.click()}
                    sx={{ 
                      color: ICON_COLOR,
                      p: isSmallScreen ? 0.5 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 34, 34, 0.04)'
                      }
                    }}
                  >
                    <PhotoCameraIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                  <IconButton 
                    onClick={() => documentInputRef.current.click()}
                    sx={{ 
                      color: ICON_COLOR,
                      p: isSmallScreen ? 0.5 : 1,
                      '&:hover': {
                        backgroundColor: 'rgba(211, 34, 34, 0.04)'
                      }
                    }}
                  >
                    <DescriptionIcon fontSize={isSmallScreen ? "small" : "medium"} />
                  </IconButton>
                </Box>
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton 
                  onClick={handleSendMessage}
                  disabled={isSending}
                  sx={{ 
                    color: 'white',
                    bgcolor: ICON_COLOR,
                    opacity: (inputMessage.trim() || selectedImage) ? 1 : 0.7,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      bgcolor: '#b71c1c',
                      transform: 'scale(1.05)'
                    },
                    '&.Mui-disabled': {
                      bgcolor: 'rgba(211, 34, 34, 0.5)'
                    },
                    p: isSmallScreen ? 0.8 : 1
                  }}
                >
                  <SendIcon fontSize={isSmallScreen ? "small" : "medium"} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Paper>
      
      {/* Componente de InfoDrawer */}
      <InfoDrawer 
        open={infoDrawerOpen} 
        onClose={handleCloseInfoDrawer} 
        conversationId={conversationId}
        onMessageClick={handleMessageClick}
      />

      {/* Diálogo de confirmación para eliminar */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          sx: {
            borderRadius: '12px',
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle id="alert-dialog-title" sx={{ pb: 1 }}>
          {"¿Eliminar este mensaje?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción eliminará solamente tu versión del mensaje. 
            El mensaje original seguirá existiendo para otros usuarios.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button 
            onClick={() => setOpenDeleteDialog(false)} 
            color="primary"
            sx={{
              textTransform: 'none',
              borderRadius: '20px',
              px: 2
            }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={confirmDeleteMessage} 
            sx={{
              color: 'white', 
              backgroundColor: '#d32f2f', 
              '&:hover': {
                backgroundColor: '#b71c1c'
              },
              borderRadius: '20px',
              textTransform: 'none',
              px: 2
            }} 
            autoFocus
          >
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;