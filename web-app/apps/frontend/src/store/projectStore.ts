import { create } from 'zustand';
import { Project } from '../types/project';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface ProjectState {
  projects: Project[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void;
  removeProject: (projectId: string) => void;
  updateProject: (projectId: string, updates: Partial<Omit<Project, 'id'>>) => void;
  fetchProjects: () => void; // Placeholder for async fetching
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
    // Simulate fetching data
    // In a real app, this would be an async call to a backend
    set({ projects: initialProjects });
  },
  addProject: (projectData) =>
    set((state) => ({
      projects: [
        ...state.projects,
        {
          ...projectData,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })),
  removeProject: (projectId) =>
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== projectId),
    })),
  updateProject: (projectId, updates) =>
    set((state) => ({
      projects: state.projects.map((p) =>
        p.id === projectId ? { ...p, ...updates, updatedAt: new Date() } : p
      ),
    })),
}));

// Initialize projects when the store is created (optional, for immediate mock data)
// Alternatively, call fetchProjects from a component's useEffect
useProjectStore.getState().fetchProjects();
