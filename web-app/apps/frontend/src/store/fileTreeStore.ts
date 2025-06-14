import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { ProjectFileTree, TreeNode, FileNode, DirectoryNode, isDirectoryNode } from '../types/filetree';

interface FileTreeState {
  projectFileTrees: Record<string, ProjectFileTree>;
  currentProjectId: string | null;
  currentFileTree: TreeNode[];
  currentOpenFileId: string | null;
  currentOpenFileContent: string | null;
  setSelectedProject: (projectId: string) => void;
  addNode: (name: string, type: 'file' | 'folder', parentId?: string | null, language?: string) => void;
  renameNode: (nodeId: string, newName: string) => void;
  deleteNode: (nodeId: string) => void;
  openFile: (fileId: string) => void;
  updateOpenFileContent: (newContent: string) => void;
}

// Mock data for a sample project's file structure with content
const mockProjectFileTrees: Record<string, ProjectFileTree> = {
  'project-1-id': {
    projectId: 'project-1-id', // Corresponds to an ID in projectStore's mock data
    rootNodes: [
      {
        id: uuidv4(),
        name: 'contracts',
        type: 'folder',
        parentId: null,
        children: [
          {
            id: uuidv4(),
            name: 'MyContract.sol',
            type: 'file',
            parentId: 'contracts-folder-id',
            language: 'solidity',
            content: 'pragma solidity ^0.8.20;\n\ncontract MyContract {\n    string public myString = "Hello, World!";\n\n    function updateString(string memory newString) public {\n        myString = newString;\n    }\n}',
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'scripts',
        type: 'folder',
        parentId: null,
        children: [
          {
            id: uuidv4(),
            name: 'deploy.js',
            type: 'file',
            parentId: 'scripts-folder-id',
            language: 'javascript',
            content: 'async function main() {\n  const MyContract = await ethers.getContractFactory("MyContract");\n  const myContract = await MyContract.deploy();\n  console.log("MyContract deployed to:", myContract.address);\n}\n\nmain().catch(console.error);',
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'README.md',
        type: 'file',
        parentId: null,
        language: 'markdown',
        content: '# My dApp Project\nThis is a sample project structure.',
      },
      {
        id: uuidv4(),
        name: 'package.json',
        type: 'file',
        parentId: null,
        language: 'json',
        content: '{\n  "name": "my-dapp",\n  "version": "0.1.0",\n  "dependencies": {\n    "ethers": "^5.0.0"\n  }\n}',
      },
    ],
  },
};

// Helper to assign actual parent IDs for mock data
function initializeMockData(trees: Record<string, ProjectFileTree>): Record<string, ProjectFileTree> {
  const newTrees = JSON.parse(JSON.stringify(trees)); // Deep clone
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
    assignParent(tree.rootNodes, null);
  }
  return newTrees;
}

const initializedMockTrees = initializeMockData(mockProjectFileTrees);


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
      currentOpenFileId: null, // Reset open file when project changes
      currentOpenFileContent: null,
    });
  },
  addNode: (name, type, parentId = null, language) => // Content for new file is empty string
    set((state) => {
      if (!state.currentProjectId) return state;

      const newNode: TreeNode =
        type === 'file'
          ? ({ id: uuidv4(), name, type, parentId, language, content: `// New ${language || 'file'}: ${name}` } as FileNode)
          : ({ id: uuidv4(), name, type, parentId, children: [] } as DirectoryNode);

      const currentTree = JSON.parse(JSON.stringify(state.currentFileTree)) as TreeNode[];

      if (parentId === null) { // Add to root
        currentTree.push(newNode);
      } else { // Add to a specific folder
        const findAndAdd = (nodes: TreeNode[]): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            if (isDirectoryNode(node) && node.id === parentId) {
              node.children.push(newNode);
              return true;
            }
            if (isDirectoryNode(node) && node.children) {
              if (findAndAdd(node.children)) return true;
            }
          }
          return false;
        };
        findAndAdd(currentTree);
      }

      const updatedProjectFileTrees = {
        ...state.projectFileTrees,
        [state.currentProjectId]: {
          projectId: state.currentProjectId,
          rootNodes: currentTree,
        },
      };
      return { ...state, currentFileTree: currentTree, projectFileTrees: updatedProjectFileTrees };
    }),
  renameNode: (nodeId, newName) =>
    set((state) => {
      if (!state.currentProjectId) return state;
      const currentTree = JSON.parse(JSON.stringify(state.currentFileTree)) as TreeNode[];
      const findAndRename = (nodes: TreeNode[]) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === nodeId) {
            nodes[i].name = newName;
            return true;
          }
          if (isDirectoryNode(nodes[i]) && (nodes[i] as DirectoryNode).children) {
            if (findAndRename((nodes[i] as DirectoryNode).children)) return true;
          }
        }
        return false;
      };
      findAndRename(currentTree);
      const updatedProjectFileTrees = {
        ...state.projectFileTrees,
        [state.currentProjectId]: {
          projectId: state.currentProjectId,
          rootNodes: currentTree,
        },
      };
      // If the renamed node is the currently open file, update its ID (if ID changes with name)
      // For now, assuming ID does not change with name. If it does, this needs more logic.
      return { ...state, currentFileTree: currentTree, projectFileTrees: updatedProjectFileTrees };
    }),
  deleteNode: (nodeId) =>
    set((state) => {
      if (!state.currentProjectId) return state;
      let newOpenFileId = state.currentOpenFileId;
      let newOpenFileContent = state.currentOpenFileContent;

      if (state.currentOpenFileId === nodeId) {
        newOpenFileId = null;
        newOpenFileContent = null;
      }

      const currentTree = JSON.parse(JSON.stringify(state.currentFileTree)) as TreeNode[];
      const filterNodes = (nodes: TreeNode[]): TreeNode[] => {
        return nodes.filter(node => {
          if (node.id === nodeId) return false;
          if (isDirectoryNode(node) && node.children) {
            node.children = filterNodes(node.children);
          }
          return true;
        });
      };
      const newTree = filterNodes(currentTree);
      const updatedProjectFileTrees = {
        ...state.projectFileTrees,
        [state.currentProjectId]: {
          projectId: state.currentProjectId,
          rootNodes: newTree,
        },
      };
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
      if (!state.currentProjectId) return state;
      let fileContent: string | null = null;
      const findFile = (nodes: TreeNode[]): FileNode | null => {
        for (const node of nodes) {
          if (node.id === fileId && node.type === 'file') {
            return node as FileNode;
          }
          if (isDirectoryNode(node) && node.children) {
            const found = findFile(node.children);
            if (found) return found;
          }
        }
        return null;
      };
      const fileNode = findFile(state.currentFileTree);
      if (fileNode) {
        fileContent = fileNode.content || ''; // Use stored content or empty string
      }
      return { ...state, currentOpenFileId: fileId, currentOpenFileContent: fileContent };
    }),
  updateOpenFileContent: (newContent) =>
    set((state) => {
      if (!state.currentProjectId || !state.currentOpenFileId) return state;

      const currentTree = JSON.parse(JSON.stringify(state.currentFileTree)) as TreeNode[];
      const findAndUpdateContent = (nodes: TreeNode[]): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i];
          if (node.id === state.currentOpenFileId && node.type === 'file') {
            (nodes[i] as FileNode).content = newContent;
            return true;
          }
          if (isDirectoryNode(node) && node.children) {
            if (findAndUpdateContent(node.children)) return true;
          }
        }
        return false;
      };

      findAndUpdateContent(currentTree);
      const updatedProjectFileTrees = {
        ...state.projectFileTrees,
        [state.currentProjectId]: {
          projectId: state.currentProjectId,
          rootNodes: currentTree,
        },
      };

      return {
        ...state,
        currentOpenFileContent: newContent,
        currentFileTree: currentTree,
        projectFileTrees: updatedProjectFileTrees
      };
    }),
}));

// Initialize with a default project for testing if needed
// This is useful if you want to see data immediately on app load without manual selection.
// Example: useFileTreeStore.getState().setSelectedProject('project-1-id');
// Example: useFileTreeStore.getState().openFile('some-file-id-from-mock-data');
