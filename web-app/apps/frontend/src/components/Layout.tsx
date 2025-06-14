import React, { createContext, useState, useMemo, useContext } from 'react';
import { ThemeProvider, CssBaseline, AppBar, Toolbar, IconButton, Typography, Box, Button } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import { lightTheme, darkTheme } from '../theme/theme';
import ConnectWalletButton from './wallet/ConnectWalletButton'; // Import ConnectWalletButton

// Define the shape of the context
interface ThemeContextType {
  toggleTheme: () => void;
  mode: 'light' | 'dark';
}

// Create the context with a default value
export const ThemeContext = createContext<ThemeContextType>({
  toggleTheme: () => {},
  mode: 'light',
});

export const useThemeContext = () => useContext(ThemeContext);

const Layout: React.FC = () => {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const storedPreference = localStorage.getItem('themeMode');
    return (storedPreference as 'light' | 'dark') || 'light';
  });

  const toggleTheme = () => {
    setMode((prevMode) => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', newMode);
      return newMode;
    });
  };

  const theme = useMemo(() => (mode === 'light' ? lightTheme : darkTheme), [mode]);

  return (
    <ThemeContext.Provider value={{ toggleTheme, mode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component={RouterLink} to="/" sx={{ flexGrow: 1, color: 'inherit', textDecoration: 'none' }}>
              MyApp
            </Typography>
            <Button color="inherit" component={RouterLink} to="/">
              Home
            </Button>
            <Button color="inherit" component={RouterLink} to="/projects">
              Projects
            </Button>
            <Button color="inherit" component={RouterLink} to="/token-creator">
              Token Creator
            </Button>
            <Button color="inherit" component={RouterLink} to="/marketplace">
              Marketplace
            </Button>
            <Button color="inherit" component={RouterLink} to="/defi">
              DeFi
            </Button>
            <Button color="inherit" component={RouterLink} to="/portfolio">
              Portfolio
            </Button>
            <Button color="inherit" component={RouterLink} to="/tax-calculator">
              Tax Calculator
            </Button>
            <Button color="inherit" component={RouterLink} to="/analytics">
              Dashboard
            </Button>
            <Box sx={{ flexGrow: 0, ml: 2 }}>
              <ConnectWalletButton />
            </Box>
            <IconButton sx={{ ml: 1 }} onClick={toggleTheme} color="inherit">
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ p: 3 }}>
          <Outlet />
        </Box>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};

export default Layout;
