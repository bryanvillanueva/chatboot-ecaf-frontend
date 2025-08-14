import React, { useRef, useState, useEffect } from 'react';
import { Box, IconButton, Typography, LinearProgress, Tooltip } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import { useTheme } from '@mui/material/styles';

const CustomAudioPlayer = ({ src, sentAt }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const audioEl = audioRef.current;
    if (audioEl) {
      const handleLoadedMetadata = () => {
        setDuration(audioEl.duration);
        setLoading(false);
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audioEl.currentTime);
      };

      const handleEnded = () => {
        setPlaying(false);
        setCurrentTime(0);
      };

      const handleError = () => {
        setError(true);
        setLoading(false);
      };

      audioEl.addEventListener('loadedmetadata', handleLoadedMetadata);
      audioEl.addEventListener('timeupdate', handleTimeUpdate);
      audioEl.addEventListener('ended', handleEnded);
      audioEl.addEventListener('error', handleError);

      return () => {
        audioEl.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audioEl.removeEventListener('timeupdate', handleTimeUpdate);
        audioEl.removeEventListener('ended', handleEnded);
        audioEl.removeEventListener('error', handleError);
      };
    }
  }, [src]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (playing) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setPlaying(!playing);
    }
  };

  const handleProgressClick = (event) => {
    if (audioRef.current && duration) {
      const rect = event.currentTarget.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const width = rect.width;
      const newTime = (clickX / width) * duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  if (error) {
    return (
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(255, 0, 0, 0.1)',
        borderRadius: '18px',
        p: 1.5,
        minWidth: '200px'
      }}>
        <Typography variant="body2" color="error">
          Error al cargar el audio
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '18px',
        p: 1,
        minWidth: '280px',
        maxWidth: '350px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        }
      }}
    >
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Botón Play/Pause */}
      <Tooltip title={playing ? 'Pausar' : 'Reproducir'}>
        <IconButton
          onClick={togglePlay}
          disabled={loading}
          sx={{
            bgcolor: playing ? '#CE0A0A' : 'rgba(206, 10, 10, 0.1)',
            color: playing ? 'white' : '#CE0A0A',
            width: 36,
            height: 36,
            mr: 1.5,
            transition: 'all 0.2s ease',
            '&:hover': {
              bgcolor: playing ? '#b00909' : 'rgba(206, 10, 10, 0.2)',
              transform: 'scale(1.05)'
            },
            '&.Mui-disabled': {
              bgcolor: 'rgba(0, 0, 0, 0.1)',
              color: 'rgba(0, 0, 0, 0.3)'
            }
          }}
        >
          {loading ? (
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '2px solid currentColor',
                borderTop: '2px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' }
                }
              }}
            />
          ) : playing ? (
            <PauseIcon fontSize="small" />
          ) : (
            <PlayArrowIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>

      {/* Contenido principal */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        {/* Tiempo en la parte superior */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              fontWeight: 500
            }}
          >
            {formatTime(currentTime)} / {formatTime(duration)}
          </Typography>
        </Box>

        {/* Visualización de ondas centrada y expandida */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'end', 
          mb: 1,
          height: '24px',
          px: 1
        }}>
          {[...Array(12)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: 3,
                height: playing ? [8, 12, 16, 20, 18, 22, 20, 16, 18, 14, 10, 8][i] : 8,
                bgcolor: playing ? '#CE0A0A' : 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                mx: 0.2,
                transition: 'all 0.3s ease',
                animation: playing 
                  ? `wave 1.2s ${i * 0.08}s infinite ease-in-out` 
                  : 'none',
                '@keyframes wave': {
                  '0%, 100%': { 
                    transform: 'scaleY(0.3)',
                    opacity: 0.7
                  },
                  '50%': { 
                    transform: 'scaleY(1)',
                    opacity: 1
                  }
                }
              }}
            />
          ))}
        </Box>

        {/* Barra de progreso */}
        <Box 
          sx={{ 
            position: 'relative',
            cursor: 'pointer',
            borderRadius: '4px',
            overflow: 'hidden',
            height: '6px',
            bgcolor: 'rgba(255, 255, 255, 0.3)'
          }}
          onClick={handleProgressClick}
        >
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${progress}%`,
              bgcolor: '#CE0A0A',
              borderRadius: '4px',
              transition: 'width 0.1s ease',
              '&::after': {
                content: '""',
                position: 'absolute',
                right: -2,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 4,
                height: 4,
                bgcolor: 'white',
                borderRadius: '50%',
                opacity: playing ? 1 : 0,
                transition: 'opacity 0.2s ease'
              }
            }}
          />
        </Box>
      </Box>

      {/* Icono de volumen */}
      <VolumeUpIcon 
        sx={{ 
          color: 'rgba(255, 255, 255, 0.7)',
          fontSize: 16,
          ml: 1
        }} 
      />
    </Box>
  );
};

export default CustomAudioPlayer;