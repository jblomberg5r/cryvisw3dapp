import { create } from 'zustand';
import { Project } from '../types/project';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from './activityStore'; // Import the helper

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>) => void;
  fetchProjects: () => void;
}

// Mock initial data
const initialProjects: Project[] = [
  {
    id: uuidv4(),
    name: 'My First dApp',
    description: 'A decentralized application for tracking digital assets.',
    createdAt: new Date('2024-01-15T10:00:00Z'),
    updatedAt: new Date('2024-01-20T14:30:00Z'),
  },
  {
    id: uuidv4(),
    name: 'NFT Marketplace',
    description: 'A platform for buying and selling unique digital collectibles.',
    createdAt: new Date('2024-02-10T09:00:00Z'),
    updatedAt: new Date('2024-02-18T11:45:00Z'),
  },
  {
    id: uuidv4(),
    name: 'DeFi Protocol',
    createdAt: new Date('2024-03-01T12:00:00Z'),
    updatedAt: new Date('2024-03-05T16:20:00Z'),
  },
];

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [], // Initialize as empty, fetchProjects will populate
  fetchProjects: () => {
    set({ projects: initialProjects });
    // logActivity('INFO', 'Fetched initial mock projects.', { count: initialProjects.length }, 'ListAlt');
    // Decided not to log initial fetch to avoid noise on startup.
  },
  addProject: (projectData) => {
    const newProject: Project = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      projects: [...state.projects, newProject],
    }));
    logActivity('PROJECT_CREATED', `Project "${newProject.name}" was created.`, { projectId: newProject.id, name: newProject.name }, 'CreateNewFolder');
  },
  removeProject: (projectId) => {
    const projectToRemove = get().projects.find(p => p.id === projectId);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    }));
    if (projectToRemove) {
      logActivity('PROJECT_DELETED', `Project "${projectToRemove.name}" was deleted.`, { projectId, name: projectToRemove.name }, 'DeleteForever');
    }
  },
  updateProject: (projectId, updates) => {
    let projectName = '';
    set((state) => ({
      projects: state.projects.map((p) => {
        if (p.id === projectId) {
          projectName = updates.name || p.name; // Capture name for logging
          return { ...p, ...updates, updatedAt: new Date() };
        }
        return p;
      }),
    }));
    if (projectName) {
        logActivity('PROJECT_UPDATED', `Project "${projectName}" was updated.`, { projectId, updates }, 'Edit');
    }
  },
}));

// Initialize projects when the store is created (optional, for immediate mock data)
// Alternatively, call fetchProjects from a component's useEffect
useProjectStore.getState().fetchProjects();
