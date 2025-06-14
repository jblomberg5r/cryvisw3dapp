export type NodeType = 'file' | 'folder';

// Base node structure
export interface BaseNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null; // Root nodes have null parentId
}

export interface FileNode extends BaseNode {
  type: 'file';
  content?: string; // Content can be loaded on demand
  language?: string; // e.g., 'solidity', 'javascript', 'json', 'typescript'
}

export interface DirectoryNode extends BaseNode {
  type: 'folder';
  children: TreeNode[]; // Can be an array of FileNode or DirectoryNode
}

// A union type for any node in the tree
export type TreeNode = FileNode | DirectoryNode;

// Example: Representing the whole tree for a project
export interface ProjectFileTree {
  projectId: string;
  rootNodes: TreeNode[]; // An array of files and folders at the root level
}

// Helper function to check node type
export function isFileNode(node: TreeNode): node is FileNode {
  return node.type === 'file';
}

export function isDirectoryNode(node: TreeNode): node is DirectoryNode {
  return node.type === 'folder';
}
