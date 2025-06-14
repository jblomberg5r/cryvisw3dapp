// web-app/apps/frontend/src/store/fileTreeStore.test.ts
import { useFileTreeStore } from './fileTreeStore';
import { act, renderHook } from '@testing-library/react';

describe('fileTreeStore', () => {
  const mockProjectId = 'test-project-1';

  beforeEach(() => {
    act(() => {
      // Resetting to a known state, including mock projectFileTrees
      useFileTreeStore.setState({
        projectFileTrees: {
          [mockProjectId]: { projectId: mockProjectId, rootNodes: [] }
        },
        currentProjectId: null,
        currentFileTree: [],
        currentOpenFileId: null,
        currentOpenFileContent: null,
      });
      useFileTreeStore.getState().setSelectedProject(mockProjectId); // Select a project for tests
    });
  });

  it('should add a file node to the current project', () => {
    const { result } = renderHook(() => useFileTreeStore());
    act(() => {
      result.current.addNode('testFile.sol', 'file', null, 'solidity', 'content', mockProjectId);
    });
    expect(result.current.currentFileTree.length).toBe(1);
    expect(result.current.currentFileTree[0].name).toBe('testFile.sol');
    expect((result.current.currentFileTree[0] as any).content).toBe('content');
  });

  it('should rename a node', () => {
    const { result } = renderHook(() => useFileTreeStore());
    let fileNodeId = '';
    act(() => {
      const node = result.current.addNode('oldName.txt', 'file', null, 'text', '', mockProjectId);
      if (node) fileNodeId = node.id;
    });
    act(() => {
      result.current.renameNode(fileNodeId, 'newName.txt');
    });
    expect(result.current.currentFileTree[0].name).toBe('newName.txt');
  });

  it('should delete a node', () => {
     const { result } = renderHook(() => useFileTreeStore());
    let fileNodeId = '';
    act(() => {
      const node = result.current.addNode('deleteMe.txt', 'file', null, 'text', '', mockProjectId);
      if (node) fileNodeId = node.id;
    });
    expect(result.current.currentFileTree.length).toBe(1);
    act(() => {
      result.current.deleteNode(fileNodeId);
    });
    expect(result.current.currentFileTree.length).toBe(0);
  });

  it('should open a file and set its content', () => {
    const { result } = renderHook(() => useFileTreeStore());
    const initialContent = "pragma solidity ^0.8.0;";
    let fileNodeId = '';
     act(() => {
      const node = result.current.addNode('contract.sol', 'file', null, 'solidity', initialContent, mockProjectId);
      if (node) fileNodeId = node.id;
    });
    act(() => {
      result.current.openFile(fileNodeId);
    });
    expect(result.current.currentOpenFileId).toBe(fileNodeId);
    expect(result.current.currentOpenFileContent).toBe(initialContent);
  });

  it('should update open file content', () => {
    const { result } = renderHook(() => useFileTreeStore());
    const initialContent = "initial";
    const updatedContent = "updated content";
    let fileNodeId = '';
    act(() => {
      const node = result.current.addNode('file.txt', 'file', null, 'text', initialContent, mockProjectId);
      if (node) fileNodeId = node.id;
      result.current.openFile(fileNodeId);
    });
    act(() => {
      result.current.updateOpenFileContent(updatedContent);
    });
    expect(result.current.currentOpenFileContent).toBe(updatedContent);
    // Check if the content in the tree itself is updated
    const fileInTree = result.current.currentFileTree[0] as any;
    expect(fileInTree.content).toBe(updatedContent);
  });
});
