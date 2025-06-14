import { createTheme } from '@mui/material/styles';

// Define the light theme
export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#000000', // Black
    },
    secondary: {
      main: '#ffffff', // White
    },
    background: {
      default: '#ffffff', // White
      paper: '#f5f5f5',   // Light grey
    },
    text: {
      primary: '#000000', // Black
      secondary: '#555555', // Dark grey
    },
  },
});

// Define the dark theme
export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#ffffff', // White
    },
    secondary: {
      main: '#000000', // Black
    },
    background: {
      default: '#000000', // Black
      paper: '#1e1e1e',   // Very dark grey
    },
    text: {
      primary: '#ffffff', // White
      secondary: '#aaaaaa', // Light grey
    },
  },
});
