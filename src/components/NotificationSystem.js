import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import './NotificationSystem.css';

const API_URL = 'http://tu-servidor:3000'; // Ajusta a la URL de tu API

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  // Conectar a Socket.IO y cargar datos iniciales
  useEffect(() => {
    // Cargar contador de notificaciones no leídas
    fetchUnreadCount();
    
    // Conectar a Socket.IO
    const socket = io(API_URL);
    
    // Escuchar por nuevas notificaciones
    socket.on('certificateStatusChanged', (notification) => {
      // Mostrar una notificación toast
      toast.info(`Certificado de ${notification.clientName} cambió de ${notification.oldStatus || 'pendiente'} a ${notification.newStatus}`);
      
      // Incrementar el contador de no leídos
      setUnreadCount(prev => prev + 1);
      
      // Añadir a la lista de notificaciones si está abierta
      setNotifications(prev => [notification, ...prev]);
    });
    
    // Limpiar al desmontar
    return () => {
      socket.disconnect();
    };
  }, []);
  
  // Cargar notificaciones cuando se abre el dropdown
  useEffect(() => {
    if (showDropdown) {
      fetchNotifications();
    }
  }, [showDropdown]);
  
  // Función para cargar el contador de notificaciones no leídas
  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/certificados/notificaciones/contador`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error al cargar contador de notificaciones:', error);
    }
  };
  
  // Función para cargar las notificaciones
  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/certificados/notificaciones?limit=10&unreadOnly=false`);
      setNotifications(response.data);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    }
  };
  
  // Función para marcar notificaciones como leídas
  const markAsRead = async (ids) => {
    if (!ids.length) return;
    
    try {
      await axios.put(`${API_URL}/api/certificados/notificaciones/marcar-leidas`, { ids });
      // Actualizar el contador
      setUnreadCount(prev => Math.max(0, prev - ids.length));
      // Actualizar estado visual
      setNotifications(prev => 
        prev.map(notif => 
          ids.includes(notif.id) ? {...notif, read_status: true} : notif
        )
      );
    } catch (error) {
      console.error('Error al marcar notificaciones como leídas:', error);
    }
  };
  
  // Marcar todas como leídas
  const markAllAsRead = () => {
    const unreadIds = notifications
      .filter(notif => !notif.read_status)
      .map(notif => notif.id);
      
    if (unreadIds.length > 0) {
      markAsRead(unreadIds);
    }
  };
  
  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <div className="notification-system">
      {/* Botón de notificaciones */}
      <div className="notification-icon">
        <button 
          onClick={() => setShowDropdown(!showDropdown)} 
          className="bell-button"
        >
          <i className="fas fa-bell"></i>
          {unreadCount > 0 && (
            <span className="badge">{unreadCount}</span>
          )}
        </button>
        
        {/* Dropdown de notificaciones */}
        {showDropdown && (
          <div className="notification-dropdown">
            <div className="dropdown-header">
              <h3>Notificaciones</h3>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="mark-read-button">
                  Marcar todas como leídas
                </button>
              )}
            </div>
            
            <div className="notification-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  No hay notificaciones
                </div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`notification-item ${!notif.read_status ? 'unread' : ''}`}
                    onClick={() => {
                      if (!notif.read_status) {
                        markAsRead([notif.id]);
                      }
                    }}
                  >
                    <div className="notification-content">
                      <div className="notification-title">
                        Certificado {notif.certificate_id}
                      </div>
                      <div className="notification-message">
                        Estado cambiado de <strong>{notif.old_status || 'Nuevo'}</strong> a <strong>{notif.new_status}</strong>
                      </div>
                      <div className="notification-time">
                        {formatDate(notif.timestamp || notif.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="dropdown-footer">
              <a href="/certificados">Ver todos</a>
            </div>
          </div>
        )}
      </div>
      
      {/* Toast Container para notificaciones emergentes */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
};

export default NotificationSystem;