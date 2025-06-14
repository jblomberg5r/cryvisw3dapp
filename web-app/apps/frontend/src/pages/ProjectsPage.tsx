import React, { useState } from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ProjectList from '../components/projects/ProjectList';
import CreateProjectDialog from '../components/projects/CreateProjectDialog';
import { useThemeContext } from '../components/Layout'; // To show current theme, optional

const ProjectsPage: React.FC = () => {
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const { mode } = useThemeContext(); // Example of using theme context

  const handleOpenCreateDialog = () => {
    setOpenCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setOpenCreateDialog(false);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1">
            Projects
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
          >
            New Project
          </Button>
        </Box>
        <Typography variant="subtitle1" gutterBottom>
          Manage your smart contract projects. (Current theme: {mode})
        </Typography>

        <ProjectList />

        <CreateProjectDialog
          open={openCreateDialog}
          onClose={handleCloseCreateDialog}
        />
      </Box>
    </Container>
  );
};

export default ProjectsPage;
