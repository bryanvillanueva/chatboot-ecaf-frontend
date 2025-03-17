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
} from '@mui/material';
import { 
  Reply as ReplyIcon, 
  Send as SendIcon, 
  EmojiEmotions as EmojiIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Edit as EditIcon, 
} from '@mui/icons-material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TableChartIcon from '@mui/icons-material/TableChart';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import VisibilityIcon from '@mui/icons-material/Visibility';
import GetAppIcon from '@mui/icons-material/GetApp';
import EmojiPicker from 'emoji-picker-react';
import { fetchMessages } from '../services/webhookService';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';
import CustomAudioPlayer from './customAudioPlayer';
import { Info as InfoIcon } from '@mui/icons-material';
import Tooltip from '@mui/material/Tooltip';
import InfoDrawer from './InfoDrawer';

// Componente para renderizar imágenes con el endpoint proxy
const MessageImage = ({ mediaId, onClick }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Generamos la URL directa al endpoint proxy
  const imageProxyUrl = `https://webhook-ecaf-production.up.railway.app/api/download-image/${mediaId}`;
  
  // Usamos el mediaId como clave para refrescar la imagen
  const imageSrc = `${imageProxyUrl}?v=${retryCount}`;
  
  // Cuando la imagen termine de cargar
  const handleImageLoaded = () => {
    setLoading(false);
    setError(null);
  };
  
  // Si hay error al cargar la imagen
  const handleImageError = () => {
    setLoading(false);
    setError('No se pudo cargar la imagen');
  };
  
  // Forzar recarga de la imagen
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };
  
  useEffect(() => {
    // Resetear estado al cambiar de mediaId
    setLoading(true);
    setError(null);
    setRetryCount(0);
  }, [mediaId]);

  // Info Drawer

  

  return (
    <Box sx={{ maxWidth: '100%', mt: 1, mb: 1 }}>   
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      {error ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="error">
            {error}
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="small" 
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Intentar de nuevo
          </Button>
        </Box>
      ) : (
        <img 
          src={imageSrc}
          alt="Message attachment" 
          style={{ 
            maxWidth: '70%', // Imagen más pequeña
            maxHeight: '200px', // Controlar altura
            borderRadius: '8px',
            cursor: 'pointer',
            display: loading ? 'none' : 'block',
            objectFit: 'contain'
          }}
          onLoad={handleImageLoaded}
          onError={handleImageError}
          onClick={onClick || (() => window.open(imageSrc, '_blank'))}
        />
      )}
    </Box>
  );
};
// Componente para renderizar documentos
const MessageDocument = ({ mediaId, fileName }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // URL del documento a través del proxy
  const documentProxyUrl = `https://webhook-ecaf-production.up.railway.app/api/download-document/${mediaId}`;
  
  // Formato del nombre de archivo para mostrar
  const displayFileName = fileName || 'Documento adjunto';
  
  // Determinar el icono basado en la extensión del archivo
  const getFileIcon = () => {
    if (!fileName) return <DescriptionIcon fontSize="large" />;
    
    const extension = fileName.toLowerCase().split('.').pop();
    
    switch (extension) {
      case 'pdf':
        return <PictureAsPdfIcon fontSize="large" />;
      case 'doc':
      case 'docx':
        return <ArticleIcon fontSize="large" />;
      case 'xls':
      case 'xlsx':
        return <TableChartIcon fontSize="large" />;
      case 'ppt':
      case 'pptx':
        return <SlideshowIcon fontSize="large" />;
      default:
        return <InsertDriveFileIcon fontSize="large" />;
    }
  };
  
  // Verificar si el documento está disponible
  useEffect(() => {
    const checkDocumentAvailability = async () => {
      try {
        setLoading(true);
        // Solo hacemos una petición HEAD para verificar si el documento está disponible
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
  
  // Forzar recarga del documento
  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRetryCount(prev => prev + 1);
  };
  
  // Abrir el documento en una nueva pestaña
  const handleOpenDocument = () => {
    window.open(`${documentProxyUrl}?v=${retryCount}`, '_blank');
  };
  
  // Descargar el documento
  const handleDownloadDocument = () => {
    const link = document.createElement('a');
    link.href = `${documentProxyUrl}?v=${retryCount}&download=true`;
    link.download = displayFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 1,
      mt: 1, 
      mb: 1,
      bgcolor: 'rgba(0, 0, 0, 0.04)',
      borderRadius: '8px',
      width: '100%',
      maxWidth: '240px'
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
            {/* Icono y nombre del documento */}
            <Box sx={{ color: 'primary.main', my: 1 }}>
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
                whiteSpace: 'nowrap'
              }}
            >
              {displayFileName}
            </Typography>
            
            {/* Botones de acción */}
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
                sx={{ flexGrow: 1, maxWidth: '50%' }}
              >
                Ver
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="small" 
                onClick={handleDownloadDocument}
                startIcon={<GetAppIcon />}
                sx={{ flexGrow: 1, maxWidth: '50%' }}
              >
                Descargar
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
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
    <Box 
      sx={{ 
        mt: 2, 
        mb: 2, 
        position: 'relative',
        display: 'inline-block'
      }}
    >
      <img 
        src={preview} 
        alt="Preview" 
        style={{
          maxWidth: '150px',
          maxHeight: '150px',
          borderRadius: '8px',
          border: '1px solid #ccc'
        }}
      />
      <IconButton
        size="small"
        sx={{
          position: 'absolute',
          top: -10,
          right: -10,
          backgroundColor: 'white',
          '&:hover': { backgroundColor: '#f5f5f5' },
          boxShadow: '0px 2px 4px rgba(0,0,0,0.2)'
        }}
        onClick={onRemove}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
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
  const ICON_COLOR = '#2B91FF';
  const [infoDrawerOpen, setInfoDrawerOpen] = useState(false);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);
  const messageRefs = useRef({}); // Para almacenar referencias a los mensajes
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [messageToDelete, setMessageToDelete] = useState(null);

  const handleOpenInfoDrawer = () => {
    setInfoDrawerOpen(true);
  };
  
  const handleCloseInfoDrawer = () => {
    setInfoDrawerOpen(false);
  };


  // Función para manejar el clic en un mensaje desde el InfoDrawer
  const handleMessageClick = (messageId) => {
    setHighlightedMessageId(messageId);
    
    // Dar tiempo para que React renderice antes de hacer scroll
    setTimeout(() => {
      if (messageRefs.current[messageId]) {
        // Acceder al elemento del mensaje
        const messageElement = messageRefs.current[messageId];
        
        // Hacer scroll al mensaje
        messageElement.scrollIntoView({ 
          behavior: 'smooth',
          block: 'center'
        });
      }
    }, 100);
  };
  
  // Extraer el nombre del cliente (primer sender que no sea "Sharky")
  const clientName = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender || conversationId;

  // Función para abrir imagen en modal
  const handleOpenImageModal = (imageSrc) => {
    setModalImageSrc(imageSrc);
    setOpenImageModal(true);
  };
  
  // Obtener detalles de la conversación (autoresponse)
  useEffect(() => {
    if (conversationId) {
      axios.get(`https://webhook-ecaf-production.up.railway.app/api/conversation-detail/${conversationId}`)
        .then((res) => {
          const conv = res.data;
          console.log("Valor de autoresponse:", conv.autoresponse);
          setAutoresponse(!!conv.autoresponse);
        })
        .catch((error) => {
          console.error("Error fetching conversation details", error);
        });
    }
  }, [conversationId]);
  
  // Actualizar autoresponse
  const handleAutoresponseToggle = async (e) => {
    const newValue = e.target.checked;
    setAutoresponse(newValue);
    try {
      const response = await axios.put(`https://webhook-ecaf-production.up.railway.app/api/conversations/${conversationId}/autoresponse`, { autoresponse: newValue });
      console.log('Autoresponse updated successfully:', response.data);
    } catch (error) {
      console.error('Error updating autoresponse:', error.response ? error.response.data : error.message);
    }
  };

  // Polling: refrescar mensajes cada 5 segundos
  useEffect(() => {
    if (conversationId) {
      let previousMessagesCount = messages.length;
      const interval = setInterval(async () => {
        try {
          const data = await fetchMessages(conversationId);
          // Ordenar para que los mensajes más recientes estén primero
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          
          // Notificar si hay mensajes nuevos (solo de cliente)
          if (sortedMessages.length > previousMessagesCount) {
            const newMessages = sortedMessages.slice(0, sortedMessages.length - previousMessagesCount);
            const newCustomerMessage = newMessages.find(m => m.sender && m.sender !== 'Sharky');
            if (newCustomerMessage) {
              if (Notification.permission === 'granted') {
                new Notification('New message received', {
                  body: newCustomerMessage.message,
                  icon: '/path/to/icon.png'
                });
              } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                  if (permission === 'granted') {
                    new Notification('New message received', {
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
  
  // Cargar mensajes al cambiar de conversación
  useEffect(() => {
    if (conversationId) {
      const getMessages = async () => {
        try {
          const data = await fetchMessages(conversationId);
          // Ordenar mensajes: últimos primero
          const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
          setMessages(sortedMessages);
          // Esperar a que los mensajes se carguen y luego desplazar a los más recientes
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

  // Función para desplazarse a los mensajes más recientes
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0; // Scrollea al inicio (mensajes más recientes)
    }
  };

  const handleReply = (messageId) => {
    setReplyingTo(messages.find(m => m.message_id === messageId));
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiData) => {
    setInputMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Función para manejar la selección de imagen (sin envío inmediato)
  const handleImageSelection = (event) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedImage(event.target.files[0]);
    }
  };

  // Función para eliminar la imagen seleccionada
  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim() || selectedImage) {
      setIsSending(true);
      
      try {
        const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
        if (!clientPhone) {
          console.error('No client phone number found in messages.');
          setIsSending(false);
          return;
        }
        
        // Si hay una imagen seleccionada, la enviamos primero
        if (selectedImage) {
          console.log('📤 Enviando imagen:', selectedImage.name);
          
          // Crear FormData con el archivo y datos adicionales
          const formData = new FormData();
          formData.append('file', selectedImage); // El archivo
          formData.append('to', clientPhone); // Número del destinatario
          formData.append('conversationId', conversationId); // ID de la conversación
          formData.append('caption', inputMessage); // Usar el mensaje como caption
          formData.append('sender', 'Sharky'); // Remitente
          
          // Enviar al endpoint de medios
          await axios.post(
            'https://webhook-ecaf-production.up.railway.app/api/send-media',
            formData,
            { 
              headers: { 
                'Content-Type': 'multipart/form-data' 
              } 
            }
          );
          
          // Limpiar la imagen seleccionada
          setSelectedImage(null);
          if (imageInputRef.current) {
            imageInputRef.current.value = '';
          }
        } 
        // Si hay texto y no hay imagen (o si hay texto y ya se envió la imagen)
        else if (inputMessage.trim()) {
          console.log('Sending text message:', {
            text: inputMessage,
            replyToId: replyingTo?.message_id,
            conversationId
          });
          
          const payload = {
            to: clientPhone,
            conversationId,
            message: inputMessage,
            sender: 'Sharky'
          };

          await axios.post(
            'https://webhook-ecaf-production.up.railway.app/send-manual-message',
            payload
          );
        }

        // Actualizar la vista con los mensajes más recientes
        const data = await fetchMessages(conversationId);
        const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
        setMessages(sortedMessages);
        scrollToBottom();
        
        // Limpiar estado
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


 // Función para manejar la edición de mensajes
// Función para editar mensaje
const handleEditMessage = (messageId, currentMessage) => {
  const newMessage = prompt('Editar mensaje:', currentMessage);
  
  if (newMessage === null || newMessage === '') {
    return; // Usuario canceló o no ingresó nada
  }
  
  console.log('Enviando solicitud de edición:', { messageId, newMessage });
  
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
    console.log('Datos recibidos:', data);
    // Actualizar UI
    setMessages(prevMessages => 
      prevMessages.map(msg => 
        msg.message_id.toString() === messageId.toString() 
          ? { ...msg, message: newMessage } 
          : msg
      )
    );
    alert('Mensaje actualizado correctamente');
  })
  .catch(error => {
    console.error('Error completo:', error);
    alert('Error al editar mensaje: ' + error.message);
  });
};

// Función para eliminar mensaje
const handleDeleteMessageRequest = (messageId) => {
  setMessageToDelete(messageId);
  setOpenDeleteDialog(true);
};

const confirmDeleteMessage = () => {
  if (!messageToDelete) return;
  
  console.log('Enviando solicitud de eliminación. ID:', messageToDelete);
  
  axios.delete(`https://webhook-ecaf-production.up.railway.app/api/delete-message/${messageToDelete}`)
    .then(response => {
      console.log('Datos recibidos:', response.data);
      // Actualizar UI
      setMessages(prevMessages => 
        prevMessages.filter(msg => msg.message_id.toString() !== messageToDelete.toString())
      );
      // Opcional: puedes mostrar un Snackbar en lugar de un alert
      alert('Mensaje eliminado correctamente');
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

  // Manejar subida de documentos (sin cambios)
  const handleDocumentUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const clientPhone = messages.find(m => m.sender && m.sender !== 'Sharky')?.sender;
    if (!clientPhone) {
      console.error('No client phone number found');
      alert('No se encontró el número de teléfono del cliente');
      return;
    }

    setIsSending(true);
    
    try {
      console.log(`📤 Enviando documento:`, file.name);
      
      // Crear FormData con el archivo y datos adicionales
      const formData = new FormData();
      formData.append('file', file); // El archivo
      formData.append('to', clientPhone); // Número del destinatario
      formData.append('conversationId', conversationId); // ID de la conversación
      formData.append('caption', ''); // Caption opcional
      formData.append('sender', 'Sharky'); // Remitente
      
      // Enviar directamente al endpoint de medios
      const response = await axios.post(
        'https://webhook-ecaf-production.up.railway.app/api/send-media',
        formData,
        { 
          headers: { 
            'Content-Type': 'multipart/form-data' 
          } 
        }
      );

      console.log('✅ Document message sent:', response.data);

      // Actualizar la vista con los mensajes más recientes
      const data = await fetchMessages(conversationId);
      const sortedMessages = data.sort((a, b) => new Date(b.sent_at) - new Date(a.sent_at));
      setMessages(sortedMessages);
      scrollToBottom();
    } catch (error) {
      console.error('❌ Error sending document:', error);
      let errorMessage = 'Error al enviar el documento';
      
      if (error.response) {
        console.error('Detalles del error:', error.response.data);
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
            fileName={"Documento Adjunto"} // Usar el campo message como nombre de archivo
          />
        );
      default:
        return <Typography variant="body1">{msg.message}</Typography>;
    }
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
      backgroundImage: `url('https://sharkagency.co/wallpaper-wp.jpg')`,
      backgroundSize: 'auto',
      backgroundPosition: 'center',
      transition: 'padding-right 0.3s ease', // Añadir transición suave
      paddingRight: infoDrawerOpen ? '300px' : '0', // Ajustar espacio cuando el drawer está abierto
    }}
  >
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      p: 2,
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(5px)',
    }}
  >
    <Typography variant="h6">
      {clientName}
    </Typography>
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <FormControlLabel 
        control={
          <Switch 
            checked={autoresponse} 
            onChange={handleAutoresponseToggle} 
          />
        } 
        label="Respuestas automáticas" 
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
          flexDirection: 'column-reverse', // Lista invertida
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
          },
        }}
      >

{messages.length > 0 ? (
  messages.map((msg) => (
    <ListItem 
  key={msg.message_id}
  ref={(el) => messageRefs.current[msg.message_id] = el}
  sx={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: msg.sender === 'Sharky' ? 'flex-end' : 'flex-start',
    px: 2,
    py: 1,
    ...(highlightedMessageId === msg.message_id && {
      animation: 'highlight 2s',
      '@keyframes highlight': {
        '0%': { backgroundColor: 'rgba(66, 165, 245, 0.3)' },
        '100%': { backgroundColor: 'transparent' }
      }
    })
  }}
>
  <Box
    sx={{
      position: 'relative',
      maxWidth: '70%',
      '&:hover .message-actions': {
        opacity: 1,
      },
    }}
  >
    {/* Action buttons container */}
    <Box 
  className="message-actions"
  sx={{
    position: 'absolute',
    right: msg.sender === 'Sharky' ? 'auto' : '-30px',
    left: msg.sender === 'Sharky' ? '-30px' : 'auto',
    top: '50%',
    transform: 'translateY(-50%)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    opacity: 0,
    transition: 'opacity 0.2s',
  }}
>  
  {/* Reply button */}
  <IconButton
    size="small"
    onClick={() => handleReply(msg.message_id)}
    sx={{
      bgcolor: 'white',
      boxShadow: 1,
      '&:hover': {
        bgcolor: 'grey.100',
      },
    }}
  >
    <ReplyIcon fontSize="small" />
  </IconButton>
  
  {/* Delete button - para todos los mensajes, no solo Sharky */}
  <IconButton
  size="small"
  onClick={() => handleDeleteMessageRequest(msg.message_id)}
  sx={{
    bgcolor: 'white',
    boxShadow: 1,
    '&:hover': {
      bgcolor: 'grey.100',
    },
  }}
>
  <DeleteIcon fontSize="small" />
</IconButton>
</Box>
    
    {/* Message bubble */}
    <Box
      sx={{
        backgroundColor: msg.sender === 'Sharky' ? '#ed403d' : '#ffffff',
        color: msg.sender === 'Sharky' ? '#fff' : 'inherit',
        borderRadius: '25px',
        p: 2,
        wordBreak: 'break-word',
        boxShadow: '2px 2px 10px #0202027d',
      }}
    >
      {renderMessageContent(msg)}
      <Typography 
        variant="caption"
        sx={{ display: 'block', textAlign: 'right', mt: 1, opacity: 0.8 }}
      >
        {new Date(msg.sent_at).toLocaleString()}
      </Typography>
    </Box>
  </Box>
</ListItem>
          ))
        ) : (
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2 }}>
            No se encontraron mensajes.
          </Typography>
        )}
        <div ref={messagesEndRef} />
      </List>

      {/* Modal para visualizar imágenes en tamaño completo */}
      <Modal
        open={openImageModal}
        onClose={() => setOpenImageModal(false)}
        aria-labelledby="image-modal"
        aria-describedby="full-size-image-view"
      >
        <Box sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          maxWidth: '90%',
          maxHeight: '90%',
          overflow: 'auto',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <IconButton 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              bgcolor: 'rgba(255,255,255,0.7)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' }
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
              maxHeight: 'calc(90vh - 100px)',
              objectFit: 'contain' 
            }} 
          />
        </Box>
      </Modal>

      {/* Indicador de carga al enviar */}
      {isSending && (
        <Box sx={{ position: 'absolute', bottom: '80px', right: '20px' }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {/* UI de respuesta */}
      {replyingTo && (
        <Box
          sx={{
            p: 2,
            bgcolor: '#f0f2f5',
            borderTop: '1px solid #ccc',
           
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 1,
            }}
          >
            <Typography variant="body2" color="textSecondary">
              Respondiendo a:
            </Typography>
            <IconButton 
              size="small" 
              onClick={() => setReplyingTo(null)}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box
            sx={{
              pl: 2,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Typography variant="body2" noWrap>
              {replyingTo.message}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Vista previa de imagen seleccionada */}
      {selectedImage && (
        <Box sx={{ p: 1, borderTop: '1px solid #ccc', textAlign: 'center' }}>
          <ImagePreview file={selectedImage} onRemove={handleRemoveSelectedImage} />
        </Box>
      )}

      {/* Emoji Picker y inputs ocultos para archivos */}
      {showEmojiPicker && (
        <Box
          sx={{
            position: 'absolute',
            bottom: selectedImage ? '160px' : '80px',
            left: '20px',
            zIndex: 1,
            boxShadow: 3,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            lazyLoadEmojis={true}
            searchPlaceholder="Buscar emoji..."
          />
        </Box>
      )}

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
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #ccc',
          backgroundColor: 'white',
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
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '25px',
              backgroundColor: '#f0f2f5',
              '& fieldset': {
                borderColor: 'transparent',
              },
              '&:hover fieldset': {
                borderColor: 'transparent',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'transparent',
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <IconButton 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    sx={{ 
                      color: ICON_COLOR,
                      '&:hover': {
                        backgroundColor: 'rgba(43, 145, 255, 0.04)'
                      }
                    }}
                  >
                    <EmojiIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => imageInputRef.current.click()}
                    sx={{ 
                      color: ICON_COLOR,
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(43, 145, 255, 0.04)'
                      }
                    }}
                  >
                    <PhotoCameraIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => documentInputRef.current.click()}
                    sx={{ 
                      color: ICON_COLOR,
                      ml: 1,
                      '&:hover': {
                        backgroundColor: 'rgba(43, 145, 255, 0.04)'
                      }
                    }}
                  >
                    <DescriptionIcon />
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
                    color: ICON_COLOR,
                    opacity: (inputMessage.trim() || selectedImage) ? 1 : 0.7,
                    '&:hover': {
                      backgroundColor: 'rgba(43, 145, 255, 0.04)'
                    }
                  }}
                >
                  <SendIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      {/* Componente de InfoDrawer */}
      <InfoDrawer 
        open={infoDrawerOpen} 
        onClose={handleCloseInfoDrawer} 
        conversationId={conversationId}
        onMessageClick={handleMessageClick}
      />

      {/* Delete Confirmation Dialog - */}
            <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"¿Eliminar este mensaje?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Esta acción eliminará solamente tu versión del mensaje. 
            El mensaje original seguirá existiendo para otros usuarios.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="primary">
            Cancelar
          </Button>
          <Button onClick={confirmDeleteMessage} sx={{color: 'white', backgroundColor: '#d32f2f', '&:hover': {backgroundColor: '#b71c1c'},}} autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Messages;