import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '../../store/projectStore';
import { List, ListItem, ListItemText, IconButton, Paper, Typography, Box, Divider, Button } from '@mui/material';
import { Delete as DeleteIcon, Edit as EditIcon, OpenInNew as OpenIcon } from '@mui/icons-material';

const ProjectList: React.FC = () => {
  const navigate = useNavigate();
  const { projects, fetchProjects, removeProject } = useProjectStore((state) => ({
    projects: state.projects,
    fetchProjects: state.fetchProjects,
    removeProject: state.removeProject,
  }));

  useEffect(() => {
    // Fetch initial projects if the list is empty
    // The store already calls fetchProjects on init,
    // but this is good practice if it didn't or if re-fetch is needed.
    if (projects.length === 0) {
      fetchProjects();
    }
  }, [fetchProjects, projects.length]);

  if (projects.length === 0) {
    return <Typography>No projects found. Create one to get started!</Typography>;
  }

  return (
    <Paper elevation={3} sx={{ mt: 2 }}>
      <List>
        {projects.map((project, index) => (
          <React.Fragment key={project.id}>
            <ListItem
              secondaryAction={
                <>
                  <IconButton edge="end" aria-label="open" sx={{ mr: 0.5 }} onClick={() => navigate(`/project/${project.id}`)}>
                    <OpenIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="edit" sx={{ mr: 0.5 }} onClick={() => console.log('Edit project', project.id)}> {/* Placeholder for edit */}
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete" onClick={() => removeProject(project.id)}>
                    <DeleteIcon />
                  </IconButton>
                </>
              }
            >
              <ListItemText
                primary={project.name}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {project.description || 'No description available.'}
                    </Typography>
                    <br />
                    <Typography component="span" variant="caption" color="text.secondary">
                      Created: {new Date(project.createdAt).toLocaleDateString()} | Updated: {new Date(project.updatedAt).toLocaleDateString()}
                    </Typography>
                  </>
                }
                sx={{ pr: '120px' }} // Add padding to prevent text overlapping with buttons
              />
            </ListItem>
            {index < projects.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    </Paper>
  );
};

export default ProjectList;
