import React, { useEffect, useState } from 'react';
import { Box, Typography, IconButton, Menu, MenuItem } from '@mui/material';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, TreeItemProps, treeItemClasses } from '@mui/x-tree-view/TreeItem';
import { styled, alpha } from '@mui/material/styles';
import { ArrowDropDown as ArrowDropDownIcon, ArrowRight as ArrowRightIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description'; // Generic file icon
import { useFileTreeStore } from '../../store/fileTreeStore';
import { TreeNode, isDirectoryNode, FileNode, DirectoryNode } from '../../types/filetree';

interface FileExplorerProps {
  projectId: string;
}

// Define props for the custom TreeItem
type CustomTreeItemProps = TreeItemProps & {
  labelText: string;
  labelIcon?: React.ElementType;
  nodeType: 'file' | 'folder'; // To distinguish for context menu
  originalNode: TreeNode; // Pass the original node for context
  onMenuOpen: (
    event: React.MouseEvent,
    nodeId: string,
    nodeType: 'file' | 'folder',
    parentId: string | null,
    currentName: string
  ) => void;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular,
    },
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      backgroundColor: `var(--tree-view-bg-color, ${alpha(theme.palette.primary.main, 0.1)})`,
      color: theme.palette.primary.main,
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit',
    },
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 15,
    paddingLeft: 18,
    borderLeft: `1px dashed ${alpha(theme.palette.text.primary, 0.4)}`,
  },
}));

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>,
) {
  const { labelText, labelIcon: LabelIcon, nodeId, nodeType, originalNode, onMenuOpen, ...other } = props;

  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          {LabelIcon && <LabelIcon color="inherit" sx={{ mr: 1 }} />}
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          <IconButton
            size="small"
            onClick={(event) => {
              event.stopPropagation(); // Prevent TreeItem click/select
              onMenuOpen(event, nodeId, nodeType, originalNode.parentId, originalNode.name);
            }}
            aria-label="more"
            sx={{visibility: 'hidden'}} // Hide by default
            className="tree-item-menu-button" // Class to show on hover
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Box>
      }
      {...other}
      ref={ref}
      // Add sx to show menu button on hover of StyledTreeItemRoot
      sx={{
        [`&:hover .tree-item-menu-button`]: {
            visibility: 'visible',
        }
      }}
    />
  );
});


const FileExplorer: React.FC<FileExplorerProps> = ({ projectId }) => {
  const {
    currentFileTree,
    setSelectedProject,
    addNode,
    renameNode,
    deleteNode,
    openFile
  } = useFileTreeStore();

  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    nodeId: string; // Can be actual node ID or "root"
    nodeType: 'file' | 'folder';
    parentId: string | null; // parentId of the node for context, or null if root
    currentName: string;
  } | null>(null);

  useEffect(() => {
    setSelectedProject(projectId);
  }, [projectId, setSelectedProject]);

  const handleMenuOpen = (
    event: React.MouseEvent,
    nodeId: string,
    nodeType: 'file' | 'folder',
    parentId: string | null,
    currentName: string
  ) => {
    event.preventDefault(); // Prevent native context menu
    event.stopPropagation(); // Stop event from bubbling up to parent context menu
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      nodeId,
      nodeType,
      parentId,
      currentName,
    });
  };

  const handleMenuClose = () => {
    setContextMenu(null);
  };

  const handleCreateFile = () => {
    if (!contextMenu) return;
    const fileName = prompt('Enter file name (e.g., newFile.sol):');
    if (fileName) {
      const parentToUse = contextMenu.nodeId === 'root' ? null : (contextMenu.nodeType === 'folder' ? contextMenu.nodeId : contextMenu.parentId);
      addNode(fileName, 'file', parentToUse, fileName.split('.').pop());
    }
    handleMenuClose();
  };

  const handleCreateFolder = () => {
    if (!contextMenu) return;
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const parentToUse = contextMenu.nodeId === 'root' ? null : (contextMenu.nodeType === 'folder' ? contextMenu.nodeId : contextMenu.parentId);
      addNode(folderName, 'folder', parentToUse);
    }
    handleMenuClose();
  };

  const handleRename = () => {
    if (!contextMenu || contextMenu.nodeId === 'root') return;
    const newName = prompt('Enter new name:', contextMenu.currentName);
    if (newName && newName !== contextMenu.currentName) {
      renameNode(contextMenu.nodeId, newName);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    if (!contextMenu || contextMenu.nodeId === 'root') return;
    if (confirm(`Are you sure you want to delete "${contextMenu.currentName}"?`)) {
      deleteNode(contextMenu.nodeId);
    }
    handleMenuClose();
  };

  const handleNodeSelect = (event: React.SyntheticEvent, nodeId: string) => {
    // Find the node in the tree to check its type
    const findNodeRecursive = (nodes: TreeNode[], id: string): TreeNode | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (isDirectoryNode(node) && node.children) {
          const found = findNodeRecursive(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const selectedNode = findNodeRecursive(currentFileTree, nodeId);

    if (selectedNode && selectedNode.type === 'file') {
      openFile(nodeId);
    }
    // Folders will expand/collapse by default via TreeView's own mechanism.
  };

  const renderTree = (nodes: TreeNode[]) =>
    nodes.map((node) => (
      <CustomTreeItem
        key={node.id}
        nodeId={node.id}
        labelText={node.name}
        labelIcon={isDirectoryNode(node) ? FolderIcon : DescriptionIcon}
        nodeType={node.type}
        originalNode={node}
        onMenuOpen={handleMenuOpen}
      >
        {isDirectoryNode(node) && node.children && node.children.length > 0 ? renderTree(node.children) : null}
      </CustomTreeItem>
    ));

  const explorerBoxSx = {
    height: '100%',
    flexGrow: 1,
    minWidth: 250, // Ensure a minimum width
    p:1,
    borderRight: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`, // Use theme for border
    overflowY: 'auto'
  };

  return (
    <Box
      sx={explorerBoxSx}
      onContextMenu={(e) => { // Context menu for the root/empty area
        e.preventDefault();
        // Only open root context menu if the click is not on a tree item itself
        if (!(e.target as HTMLElement).closest(`.${treeItemClasses.root}`)) {
            handleMenuOpen(e, "root", "folder", null, "File Explorer Root");
        }
      }}
    >
      <TreeView
        aria-label="file explorer"
        defaultCollapseIcon={<ArrowDropDownIcon />}
        defaultExpandIcon={<ArrowRightIcon />}
        sx={{ flexGrow: 1 }}
        onNodeSelect={handleNodeSelect} // Handles clicks on nodes (both files and folders)
      >
        {currentFileTree && currentFileTree.length > 0
          ? renderTree(currentFileTree)
          : <Typography sx={{p:2, color: 'text.secondary'}}>No files or folders. Right-click to add.</Typography>
        }
      </TreeView>
      <Menu
        open={contextMenu !== null}
        onClose={handleMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
        // Prevent Menu from stealing focus from other elements like prompt
        MenuListProps={{
            onKeyDown: e => { e.stopPropagation(); }
        }}
      >
        {contextMenu?.nodeType === 'folder' && <MenuItem onClick={handleCreateFile}>New File Here</MenuItem>}
        {contextMenu?.nodeType === 'folder' && <MenuItem onClick={handleCreateFolder}>New Folder Here</MenuItem>}

        {/* Options for "root" context menu */}
        {contextMenu?.nodeId === 'root' && <MenuItem onClick={handleCreateFile}>New File in Root</MenuItem>}
        {contextMenu?.nodeId === 'root' && <MenuItem onClick={handleCreateFolder}>New Folder in Root</MenuItem>}

        {contextMenu?.nodeId !== 'root' && <MenuItem onClick={handleRename}>Rename</MenuItem>}
        {contextMenu?.nodeId !== 'root' && <MenuItem onClick={handleDelete}>Delete</MenuItem>}
      </Menu>
    </Box>
  );
};

export default FileExplorer;
