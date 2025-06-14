import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ProjectFileTree, TreeNode, FileNode, DirectoryNode, isDirectoryNode, isFileNode } from '../types/filetree';
import { logActivity } from './activityStore';

interface FileTreeState {
  projectFileTrees: Record<string, ProjectFileTree>;
  currentProjectId: string | null;
  currentFileTree: TreeNode[];
  currentOpenFileId: string | null;
  currentOpenFileContent: string | null;

  setSelectedProject: (projectId: string) => void;
  addNode: (name: string, type: 'file' | 'folder', parentId?: string | null, language?: string, content?: string, targetProjectId?: string) => TreeNode | null;
  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  openFile: (fileId: string) => void;
  updateOpenFileContent: (newContent: string) => void;
}

const initialMockProjectFileTrees: Record<string, ProjectFileTree> = {
  'project-1-id': {
    projectId: 'project-1-id',
    rootNodes: [
      { id: 'folder1', name: 'contracts', type: 'folder', parentId: null, children: [
        { id: 'file1', name: 'MyContract.sol', type: 'file', parentId: 'folder1', language: 'solidity', content: 'pragma solidity ^0.8.0;\n\ncontract MyContract {}' }
      ]},
      { id: 'file2', name: 'README.md', type: 'file', parentId: null, language: 'markdown', content: '# Project Readme' }
    ],
  },
};

function initializeMockDataOnce(trees: Record<string, ProjectFileTree>): Record<string, ProjectFileTree> {
  const newTrees = JSON.parse(JSON.stringify(trees));
  for (const projectId in newTrees) {
    const tree = newTrees[projectId];
    const assignParent = (nodes: TreeNode[], parentId: string | null) => {
      nodes.forEach(node => {
        node.parentId = parentId;
        if (isDirectoryNode(node) && node.children) {
          assignParent(node.children, node.id);
        }
      });
    };
    if (tree.rootNodes) {
        assignParent(tree.rootNodes, null);
    } else {
        tree.rootNodes = [];
    }
  }
  return newTrees;
}
const initializedMockTrees = initializeMockDataOnce(initialMockProjectFileTrees);

export const useFileTreeStore = create<FileTreeState>((set, get) => ({
  projectFileTrees: initializedMockTrees,
  currentProjectId: null,
  currentFileTree: [],
  currentOpenFileId: null,
  currentOpenFileContent: null,

  setSelectedProject: (projectId) => {
    const treeData = get().projectFileTrees[projectId];
    set({
      currentProjectId: projectId,
      currentFileTree: treeData ? treeData.rootNodes : [],
      currentOpenFileId: null,
      currentOpenFileContent: null,
    });
    // Not logging setSelectedProject itself, openFile will log when a file is opened.
  },

  addNode: (name, type, parentId = null, language, content = '', targetProjectId) => {
    let finalNewNode: TreeNode | null = null;
    set((state) => {
      const projectIdToUpdate = targetProjectId || state.currentProjectId;
      if (!projectIdToUpdate) {
        console.error("No project selected or specified for adding node.");
        finalNewNode = null;
        return state;
      }

      const newNodeData: Partial<TreeNode> = { id: uuidv4(), name, type, parentId };
      if (type === 'file') {
        (newNodeData as FileNode).language = language;
        (newNodeData as FileNode).content = content || `// New ${language || 'file'}: ${name}`;
      } else {
        (newNodeData as DirectoryNode).children = [];
      }
      const newNode = newNodeData as TreeNode;
      finalNewNode = newNode;

      const projectTreeData = state.projectFileTrees[projectIdToUpdate] || { projectId: projectIdToUpdate, rootNodes: [] };
      const treeToUpdate = JSON.parse(JSON.stringify(projectTreeData.rootNodes)) as TreeNode[];

      if (parentId === null) {
        treeToUpdate.push(newNode);
      } else {
        const findAndAddRecursive = (nodes: TreeNode[]): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (isDirectoryNode(node) && node.id === parentId) {
              node.children.push(newNode);
              return true;
            }
            if (isDirectoryNode(node) && node.children) {
              if (findAndAddRecursive(node.children)) return true;
            }
          }
          return false;
        };
        if (!findAndAddRecursive(treeToUpdate)) {
            console.warn(`Parent node with ID ${parentId} not found in project ${projectIdToUpdate}. Adding to root.`);
            treeToUpdate.push(newNode);
        }
      }

      const updatedProjectFileTrees = {
        ...state.projectFileTrees,
        [projectIdToUpdate]: { ...projectTreeData, projectId: projectIdToUpdate, rootNodes: treeToUpdate },
      };

      const logMsg = `${type === 'file' ? 'File' : 'Folder'} "${name}" added to project ${projectIdToUpdate}.`;
      const icon = type === 'file' ? 'InsertDriveFile' : 'CreateNewFolder';
      logActivity(type === 'file' ? 'FILE_CREATED' : 'FILE_CREATED', logMsg, { projectId: projectIdToUpdate, name, type, parentId }, icon, newNode.id);

      if (projectIdToUpdate === state.currentProjectId) {
        return { ...state, currentFileTree: treeToUpdate, projectFileTrees: updatedProjectFileTrees };
      } else {
        return { ...state, projectFileTrees: updatedProjectFileTrees };
      }
    });
    return finalNewNode;
  },

  renameNode: (nodeId, newName) =>
    set((state) => {
      const projectIdToUpdate = state.currentProjectId;
      if (!projectIdToUpdate) return state;
      const projectTreeData = state.projectFileTrees[projectIdToUpdate];
      if (!projectTreeData) return state;

      let oldName = '';
      let nodeType: 'file' | 'folder' | '' = '';
      const treeToUpdate = JSON.parse(JSON.stringify(projectTreeData.rootNodes));
      const findAndRenameRecursive = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === nodeId) {
            oldName = nodes[i].name;
            nodeType = nodes[i].type;
            nodes[i].name = newName;
            return true;
          }
          if (isDirectoryNode(nodes[i]) && (nodes[i] as DirectoryNode).children) {
            if (findAndRenameRecursive((nodes[i] as DirectoryNode).children)) return true;
          }
        }
        return false;
      };

      if (findAndRenameRecursive(treeToUpdate)) {
        logActivity('FILE_RENAMED', `${nodeType === 'file' ? 'File' : 'Folder'} "${oldName}" renamed to "${newName}".`, { projectId: projectIdToUpdate, nodeId, oldName, newName, type: nodeType }, 'DriveFileRenameOutline', nodeId);
        const updatedProjectFileTrees = { ...state.projectFileTrees, [projectIdToUpdate]: { ...projectTreeData, rootNodes: treeToUpdate }};
        return { ...state, currentFileTree: treeToUpdate, projectFileTrees: updatedProjectFileTrees };
      }
      return state;
    }),

  deleteNode: (nodeId) =>
    set((state) => {
      const projectIdToUpdate = state.currentProjectId;
      if (!projectIdToUpdate) return state;
      const projectTreeData = state.projectFileTrees[projectIdToUpdate];
      if (!projectTreeData) return state;

      let deletedNodeName = '';
      let deletedNodeType: 'file' | 'folder' | '' = '';
      const findNodeToDeleteRecursive = (nodes: TreeNode[]): TreeNode | null => {
        for (const node of nodes) {
            if (node.id === nodeId) return node;
            if (isDirectoryNode(node) && node.children) {
                const found = findNodeToDeleteRecursive(node.children);
                if (found) return found;
            }
        }
        return null;
      };
      const nodeToDelete = findNodeToDeleteRecursive(projectTreeData.rootNodes);
      if(nodeToDelete) {
        deletedNodeName = nodeToDelete.name;
        deletedNodeType = nodeToDelete.type;
      }

      let newOpenFileId = state.currentOpenFileId;
      let newOpenFileContent = state.currentOpenFileContent;
      if (state.currentOpenFileId === nodeId) {
        newOpenFileId = null;
        newOpenFileContent = null;
      }

      const treeToUpdate = JSON.parse(JSON.stringify(projectTreeData.rootNodes));
      const filterNodesRecursive = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.filter(node => {
          if (node.id === nodeId) return false;
          if (isDirectoryNode(node) && node.children) {
            node.children = filterNodesRecursive(node.children);
          }
          return true;
        });
      };
      const newTree = filterNodesRecursive(treeToUpdate);

      if (nodeToDelete) {
        logActivity('FILE_DELETED', `${deletedNodeType === 'file' ? 'File' : 'Folder'} "${deletedNodeName}" was deleted.`, { projectId: projectIdToUpdate, nodeId, name: deletedNodeName, type: deletedNodeType }, 'DeleteOutline', nodeId);
      }

      const updatedProjectFileTrees = { ...state.projectFileTrees, [projectIdToUpdate]: { ...projectTreeData, rootNodes: newTree }};
      return {
        ...state,
        currentFileTree: newTree,
        projectFileTrees: updatedProjectFileTrees,
        currentOpenFileId: newOpenFileId,
        currentOpenFileContent: newOpenFileContent,
      };
    }),

  openFile: (fileId) =>
    set((state) => {
      const projectIdToUpdate = state.currentProjectId;
      if (!projectIdToUpdate) return state;
      const projectTreeData = state.projectFileTrees[projectIdToUpdate];
      if (!projectTreeData) return { ...state, currentOpenFileId: fileId, currentOpenFileContent: `// Error: Project tree for ${projectIdToUpdate} not found` };

      let fileContent: string | null = null;
      let fileNameForLog = '';
      const findFileRecursive = (nodes: TreeNode[]): FileNode | null => {
        for (const node of nodes) {
          if (node.id === fileId && isFileNode(node)) return node;
          if (isDirectoryNode(node) && node.children) {
            const found = findFileRecursive(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      const fileNode = findFileRecursive(projectTreeData.rootNodes);
      if (fileNode) {
        fileContent = fileNode.content || `// Content for ${fileNode.name}`;
        fileNameForLog = fileNode.name;
        logActivity('FILE_OPENED', `File "${fileNameForLog}" was opened.`, { projectId: projectIdToUpdate, fileId, fileName: fileNameForLog }, 'OpenInNew', fileId);
      } else {
        fileContent = `// File with ID ${fileId} not found in project ${projectIdToUpdate}.`;
        logActivity('ERROR', `Attempted to open non-existent file.`, { projectId: projectIdToUpdate, fileId }, 'ErrorOutline', fileId);
      }
      return { ...state, currentOpenFileId: fileId, currentOpenFileContent: fileContent };
    }),

  updateOpenFileContent: (newContent) =>
    set((state) => {
      const projectIdToUpdate = state.currentProjectId;
      if (!projectIdToUpdate || !state.currentOpenFileId) return state;
      const projectTreeData = state.projectFileTrees[projectIdToUpdate];
      if (!projectTreeData) return state;

      const treeToUpdate = JSON.parse(JSON.stringify(projectTreeData.rootNodes));
      const findAndUpdateContentRecursive = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (node.id === state.currentOpenFileId && isFileNode(node)) {
            (nodes[i] as FileNode).content = newContent;
            return true;
          }
          if (isDirectoryNode(node) && node.children) {
            if (findAndUpdateContentRecursive(node.children)) return true;
          }
        }
        return false;
      };

      if (findAndUpdateContentRecursive(treeToUpdate)) {
        // logActivity('FILE_CONTENT_UPDATED', `Content of file ID ${state.currentOpenFileId} updated.`, { projectId: projectIdToUpdate, fileId: state.currentOpenFileId }, 'Save'); // Debounce or use explicit save
        const updatedProjectFileTrees = { ...state.projectFileTrees, [projectIdToUpdate]: { ...projectTreeData, rootNodes: treeToUpdate }};
        return {
          ...state,
          currentOpenFileContent: newContent,
          currentFileTree: treeToUpdate,
          projectFileTrees: updatedProjectFileTrees
        };
      }
      return { ...state, currentOpenFileContent: newContent };
    }),
}));
