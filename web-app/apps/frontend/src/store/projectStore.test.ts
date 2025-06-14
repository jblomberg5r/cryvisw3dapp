// web-app/apps/frontend/src/store/projectStore.test.ts
import { useProjectStore } from './projectStore';
import { act, renderHook } from '@testing-library/react';

describe('projectStore', () => {
  beforeEach(() => {
    act(() => {
      // Reset store to initial state (empty projects)
      useProjectStore.setState({ projects: [], isLoading: false }); // Assuming an isLoading state if any
      // If fetchProjects is called on init, you might need to mock it or reset its effects
    });
  });

  it('should add a project', () => {
    const { result } = renderHook(() => useProjectStore());
    const initialProjectCount = result.current.projects.length;
    act(() => {
      result.current.addProject({ name: 'Test Project', description: 'A test description' });
    });
    expect(result.current.projects.length).toBe(initialProjectCount + 1);
    expect(result.current.projects[initialProjectCount].name).toBe('Test Project');
  });

  it('should remove a project', () => {
    const { result } = renderHook(() => useProjectStore());
    let projectId = '';
    act(() => {
      result.current.addProject({ name: 'Project To Delete' });
      projectId = result.current.projects.find(p => p.name === 'Project To Delete')?.id || '';
    });

    expect(result.current.projects.some(p => p.id === projectId)).toBe(true);

    act(() => {
      result.current.removeProject(projectId);
    });
    expect(result.current.projects.some(p => p.id === projectId)).toBe(false);
  });

  it('should update a project', () => {
    const { result } = renderHook(() => useProjectStore());
    let projectId = '';
    const originalName = 'Original Project Name';
    const updatedName = 'Updated Project Name';

    act(() => {
      result.current.addProject({ name: originalName });
      projectId = result.current.projects.find(p => p.name === originalName)?.id || '';
    });

    act(() => {
      result.current.updateProject(projectId, { name: updatedName });
    });

    const updatedProject = result.current.projects.find(p => p.id === projectId);
    expect(updatedProject?.name).toBe(updatedName);
  });

  it('should fetch initial mock projects (if fetchProjects is called)', () => {
    const { result } = renderHook(() => useProjectStore());
    // The store's mock data is pre-defined. fetchProjects populates it.
    // If store is reset to empty array, then fetchProjects should populate.
     useProjectStore.setState({ projects: [] }); // Ensure it's empty before fetch
    act(() => {
      result.current.fetchProjects();
    });
    expect(result.current.projects.length).toBeGreaterThan(0); // Based on mock data
  });
});
