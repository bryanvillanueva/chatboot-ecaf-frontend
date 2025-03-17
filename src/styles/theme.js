import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#ed403d', // Rojo principal
    },
    secondary: {
      main: '#ed403d', // Rojo oscuro
    },
    light: {
    main: '#ffffff', // Blanco
    },
    error: {
      main: '#9f0705', // Azul claro
    },
  },
});

export default theme;
