import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#CE0A0A', // Rojo principal
    },
    secondary: {
      main: '#ed403d', // Rojo claro
    },
    light: {
    main: '#ffffff', // Blanco
    },
    error: {
      main: '#9f0705', // 
    },
  },
});

export default theme;
