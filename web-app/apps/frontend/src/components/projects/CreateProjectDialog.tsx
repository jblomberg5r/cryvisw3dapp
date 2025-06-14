import React, { useState } from 'react';
import { useProjectStore } from '../../store/projectStore';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField, Button } from '@mui/material';
import { Project } from '../../types/project';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
}

const CreateProjectDialog: React.FC<CreateProjectDialogProps> = ({ open, onClose }) => {
  const addProject = useProjectStore((state) => state.addProject);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) {
      setNameError('Project name is required.');
      return;
    }
    setNameError('');
    const newProject: Omit<Project, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description: description || undefined,
    };
    addProject(newProject);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setNameError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Project</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Enter the details for your new project.
        </DialogContentText>
        <TextField
          autoFocus
          required
          margin="dense"
          id="name"
          label="Project Name"
          type="text"
          fullWidth
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!nameError}
          helperText={nameError}
        />
        <TextField
          margin="dense"
          id="description"
          label="Project Description (Optional)"
          type="text"
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </DialogContent>
      <DialogActions sx={{ p: '16px 24px' }}>
        <Button onClick={handleClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          Create Project
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateProjectDialog;
