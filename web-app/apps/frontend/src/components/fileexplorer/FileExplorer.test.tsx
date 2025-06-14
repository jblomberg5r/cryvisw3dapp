// web-app/apps/frontend/src/components/fileexplorer/FileExplorer.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileExplorer from './FileExplorer';
import { useFileTreeStore } from '../../store/fileTreeStore';
import { act } from 'react'; // Import act for store updates

// Mock the Zustand store
jest.mock('../../store/fileTreeStore');

const mockUseFileTreeStore = useFileTreeStore as jest.MockedFunction<typeof useFileTreeStore>;

describe('FileExplorer', () => {
  const mockProjectId = 'proj1';
  const mockSetSelectedProject = jest.fn();
  const mockOpenFile = jest.fn();
  const mockAddNode = jest.fn();
  const mockRenameNode = jest.fn();
  const mockDeleteNode = jest.fn();

  beforeEach(() => {
    mockUseFileTreeStore.mockReturnValue({
      currentFileTree: [],
      setSelectedProject: mockSetSelectedProject,
      openFile: mockOpenFile,
      addNode: mockAddNode,
      renameNode: mockRenameNode,
      deleteNode: mockDeleteNode,
      // Mock other state/actions as needed by the component
      projectFileTrees: {},
      currentProjectId: mockProjectId,
      currentOpenFileId: null,
      currentOpenFileContent: null,
      updateOpenFileContent: jest.fn(), // Added missing function
    });
     // Reset calls for shared mocks
    mockSetSelectedProject.mockClear();
    mockOpenFile.mockClear();
  });

  it('should call setSelectedProject on mount with projectId prop', () => {
    render(<FileExplorer projectId={mockProjectId} />);
    expect(mockSetSelectedProject).toHaveBeenCalledWith(mockProjectId);
  });

  it('should display "No files or folders" message when tree is empty', () => {
    render(<FileExplorer projectId={mockProjectId} />);
    expect(screen.getByText(/No files or folders/i)).toBeInTheDocument();
  });

  it('should render tree items if currentFileTree is populated', () => {
    act(() => {
        mockUseFileTreeStore.mockReturnValueOnce({
            currentFileTree: [
                { id: 'file1', name: 'MyFile.sol', type: 'file', parentId: null },
                { id: 'folder1', name: 'scripts', type: 'folder', parentId: null, children: [] },
            ],
            setSelectedProject: mockSetSelectedProject,
            openFile: mockOpenFile,
            addNode: mockAddNode,
            renameNode: mockRenameNode,
            deleteNode: mockDeleteNode,
            projectFileTrees: {},
            currentProjectId: mockProjectId,
            currentOpenFileId: null,
            currentOpenFileContent: null,
            updateOpenFileContent: jest.fn(),
        });
    });
    render(<FileExplorer projectId={mockProjectId} />);
    expect(screen.getByText('MyFile.sol')).toBeInTheDocument();
    expect(screen.getByText('scripts')).toBeInTheDocument();
  });

  it('should call openFile when a file node is clicked (selected)', () => {
    // This test is more complex due to TreeView's onNodeSelect.
    // We need to simulate the node structure that onNodeSelect would receive.
    // For simplicity, we'll assume the CustomTreeItem correctly triggers the underlying onNodeSelect.
    // A more direct test might involve finding the TreeItem and simulating a click on its label.
    const fileNode = { id: 'file1', name: 'MyContract.sol', type: 'file' as 'file', parentId: null };
     act(() => {
        mockUseFileTreeStore.mockReturnValueOnce({
            currentFileTree: [fileNode],
            setSelectedProject: mockSetSelectedProject,
            openFile: mockOpenFile,
            // ... other mocks
            addNode: mockAddNode,
            renameNode: mockRenameNode,
            deleteNode: mockDeleteNode,
            projectFileTrees: {},
            currentProjectId: mockProjectId,
            currentOpenFileId: null,
            currentOpenFileContent: null,
            updateOpenFileContent: jest.fn(),
        });
    });

    const { container } = render(<FileExplorer projectId={mockProjectId} />);

    // Find the TreeItem. This depends on MUI's internal structure or specific test IDs.
    // Using text matching for simplicity.
    const fileElement = screen.getByText('MyContract.sol');
    // TreeView handles selection on the root of the TreeItem or its content.
    // We are testing the `onNodeSelect` of the TreeView itself.
    // To test onNodeSelect, we would need to simulate that callback directly if possible,
    // or trigger a click that TreeView translates to onNodeSelect.

    // Simplification: Assume `FileExplorer`'s `handleNodeSelect` is correctly wired to `TreeView.onNodeSelect`.
    // We can call `handleNodeSelect` manually if it were exposed, or test its effects.
    // Since `openFile` is called within `handleNodeSelect`, we check if `openFile` was called.

    // Simulate clicking the file item. This might need a more specific selector for the clickable part.
    fireEvent.click(fileElement);
    // This test needs refinement based on how TreeView actually passes the node ID to onNodeSelect
    // For now, this is a conceptual test.
    // In a real scenario with `react-testing-library`, you'd find the specific element that receives the click
    // and ensure its click handler is the one calling `openFile`.
    // The mock setup for `handleNodeSelect` will call `openFile(nodeId)`.
    // The test depends on the TreeView's `onNodeSelect` prop being correctly called.
    // If `handleNodeSelect` is called with 'file1', then openFile('file1') should be called.

    // This specific assertion might fail if the click simulation doesn't trigger TreeView's onNodeSelect correctly.
    // A better approach might be to use a data-testid on TreeItem and find it.
    // For now, we assume the wiring inside FileExplorer is correct.
    // The important part is that `openFile` should be callable for files.
    // If the `TreeView`'s `onNodeSelect` is correctly implemented to pass the `node.id`
    // and our `handleNodeSelect` correctly identifies 'file' types, this should work.

    // Let's assume the internal wiring of FileExplorer's handleNodeSelect is:
    // onNodeSelect={(event, nodeId) => { ... if (type is file) openFile(nodeId); ... }}
    // Then a click that results in onNodeSelect being called with 'file1' would trigger openFile('file1').
    // This is more of an integration test snippet within a unit test file.

    // To directly test `handleNodeSelect` if it was exported or part of a class:
    // const instance = new FileExplorer({projectId: mockProjectId}); // Not possible with FC
    // instance.handleNodeSelect(null, 'file1'); // If it were a class method
    // expect(mockOpenFile).toHaveBeenCalledWith('file1');

    // For now, this test is more of a placeholder for true interaction testing.
    // The click above might not be specific enough.
    // Awaiting more robust way to test TreeView interactions or focusing on testing the callback.
    // For now, we assume if a file is rendered, a click would eventually call openFile.
    expect(mockOpenFile).toHaveBeenCalledWith(fileNode.id); // This checks if the logic inside handleNodeSelect was hit.
  });

  // Add tests for context menu interactions (e.g., opening menu, clicking rename/delete)
  // This would involve simulating right-clicks, then clicks on MenuItems.
  // It would also require window.prompt and window.confirm to be mocked.
});
