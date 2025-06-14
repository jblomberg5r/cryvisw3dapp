import React, { useState, useEffect } from 'react';
import { MarketplaceTemplate } from '../../types/marketplace';
import { useProjectStore } from '../../store/projectStore'; // To list projects
import { useFileTreeStore } from '../../store/fileTreeStore'; // To add the file
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle,
  Button, TextField, FormControl, InputLabel, Select, MenuItem,
  CircularProgress, Alert, SelectChangeEvent
} from '@mui/material';
import { Project } from '../../types/project';
import { logActivity } from '../../store/activityStore'; // Import logActivity

interface UseTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  template: MarketplaceTemplate | null;
}

const UseTemplateDialog: React.FC<UseTemplateDialogProps> = ({ open, onClose, template }) => {
  const { projects, fetchProjects } = useProjectStore();
  const { addNode: addFileToTree, setSelectedProject: selectProjectInFileTree, openFile } = useFileTreeStore();
  const navigate = useNavigate();

  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (projects.length === 0) {
        fetchProjects(); // Fetch projects if not already loaded
      }
      if (template) {
        // Sanitize template name for use as a file name
        const sanitizedName = template.name.replace(/[^a-zA-Z0-9_.-]/g, '').replace(/\s+/g, '');
        setFileName(`${sanitizedName || 'NewContract'}.sol`);
      }
      setSelectedProjectId(''); // Reset selected project
      setError(null);
    }
  }, [open, template, projects.length, fetchProjects]);

  const handleProjectChange = (event: SelectChangeEvent<string>) => {
    setSelectedProjectId(event.target.value as string);
  };

  const handleFileNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFileName(event.target.value);
  };

  const handleSubmit = async () => {
    if (!template) {
      setError("No template selected.");
      return;
    }
    if (!selectedProjectId) {
      setError("Please select a project.");
      return;
    }
    if (!fileName.trim() || !fileName.endsWith('.sol')) {
      setError("Please enter a valid Solidity file name (e.g., MyContract.sol).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Ensure the file tree for the selected project is loaded before adding a node
      // This might require an explicit call if setSelectedProject doesn't immediately reflect in currentFileTree for addNode
      // For simplicity, we assume addNode can handle adding to a project even if its tree isn't "active"
      // or that `selectProjectInFileTree` prepares it sufficiently.

      // A more robust way:
      // 1. Call `selectProjectInFileTree(selectedProjectId)`
      // 2. Wait/ensure `currentProjectId` in fileTreeStore is `selectedProjectId`
      // 3. Then call `addFileToTree`

      // Current simplified approach:
      // The `addNode` in `fileTreeStore` needs to be aware of `projectFileTrees` and use `selectedProjectId`
      // to add to the correct project's tree, not just `currentFileTree`.
      // Let's assume `fileTreeStore.addNode` is modified to accept `projectId` or uses its own internal
      // logic to add to a specific project if `currentProjectId` isn't the target.
      // For this implementation, I will modify `addNode` in the next step to support this.
      // For now, I'll call `selectProjectInFileTree` first.

      selectProjectInFileTree(selectedProjectId);
      // Give a small timeout for store update, not ideal but helps for now.
      await new Promise(resolve => setTimeout(resolve, 100));


      addFileToTree(fileName, 'file', null, 'solidity', template.fullContractCode, selectedProjectId); // Pass content and target projectId

      // Find the newly added file's ID to open it (this is tricky without direct return from addNode)
      // This part is a simplification. A robust solution would have addNode return the new node or its ID.
      // Or, fileTreeStore could expose a way to get the last added node to the selected project.

      logActivity(
        'TEMPLATE_USED',
        `Template "${template.name}" was added to project ID ${selectedProjectId} as file "${fileName}".`,
        { templateId: template.id, templateName: template.name, projectId: selectedProjectId, newFileName: fileName },
        'Extension' // Using Extension icon as a placeholder for template usage
      );

      // For now, we just navigate to the project. Opening the specific file is a UX enhancement for later.
      navigate(`/project/${selectedProjectId}`);
      onClose();

    } catch (e) {
      console.error("Error using template:", e);
      setError("Failed to add template to project. See console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!template) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Use Template: {template.name}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Add the contract code from this template to one of your existing projects.
        </DialogContentText>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel id="select-project-label">Target Project</InputLabel>
          <Select
            labelId="select-project-label"
            value={selectedProjectId}
            label="Target Project"
            onChange={handleProjectChange}
            disabled={projects.length === 0}
          >
            {projects.length === 0 && <MenuItem disabled><em>No projects found. Create one first.</em></MenuItem>}
            {projects.map((project: Project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          label="New File Name"
          value={fileName}
          onChange={handleFileNameChange}
          helperText="Enter the desired file name for the contract (e.g., MyNFT.sol)"
          sx={{ mb: 2 }}
        />
      </DialogContent>
      <DialogActions sx={{p: '16px 24px'}}>
        <Button onClick={onClose} color="secondary" disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={isSubmitting || !selectedProjectId || !fileName.trim()}
          startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {isSubmitting ? 'Adding...' : 'Add to Project'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UseTemplateDialog;
