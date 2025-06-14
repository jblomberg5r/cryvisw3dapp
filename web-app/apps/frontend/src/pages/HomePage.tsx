import React from 'react';
import { Typography, Container } from '@mui/material';
import { useThemeContext } from '../components/Layout'; // Adjust path as needed

const HomePage: React.FC = () => {
  const { mode } = useThemeContext();

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome to the Home Page
      </Typography>
      <Typography variant="body1">
        This is a placeholder page. The current theme is: {mode}
      </Typography>
    </Container>
  );
};

export default HomePage;
