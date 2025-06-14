import React from 'react';
import { useTestStore } from '../../store/testStore';
import { useFileTreeStore } from '../../store/fileTreeStore'; // To get current open file
import { Button, Box, Typography, CircularProgress } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ReplayIcon from '@mui/icons-material/Replay'; // For re-running tests

interface ContractTestRunnerProps {
  // Could take projectId or currentOpenFileId as prop if needed
  // For now, assumes currentOpenFileId from fileTreeStore is the target
}

const ContractTestRunner: React.FC<ContractTestRunnerProps> = () => {
  const { runTests, isTesting, testResults } = useTestStore();
  const { currentOpenFileId, currentFileTree } = useFileTreeStore();

  const getFileName = (fileId: string | null): string | null => {
    if (!fileId) return null;
    const findNodeRecursive = (nodes: any[], id: string): any | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        if (node.children) {
          const found = findNodeRecursive(node.children, id);
          if (found) return found;
        }
      }
      return null;
    };
    const fileNode = findNodeRecursive(currentFileTree, fileId);
    return fileNode ? fileNode.name : null;
  };

  const currentFileName = getFileName(currentOpenFileId);
  const canRunTests = currentOpenFileId && currentFileName && currentFileName.endsWith('.sol');

  const handleRunTests = () => {
    if (currentOpenFileId && currentFileName) {
      // In a real scenario, contractIdOrPath might be more specific,
      // like the actual path or a unique identifier for the compiled contract.
      runTests(currentFileName);
    } else {
      // Fallback or general tests for the project
      // For now, uses a generic ID if no specific file is open.
      runTests('CurrentProject');
    }
    // Note: Actual test execution requires backend or WASM-based Solidity compiler & EVM.
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'start', p: 2, borderBottom: '1px solid #eee' }}>
      <Typography variant="h6" gutterBottom>
        Test Execution
      </Typography>
      <Button
        variant="contained"
        color="primary"
        startIcon={isTesting ? <CircularProgress size={20} color="inherit" /> : (testResults.length > 0 ? <ReplayIcon /> : <PlayArrowIcon />)}
        onClick={handleRunTests}
        disabled={isTesting || !canRunTests} // Disable if testing or not a .sol file
        sx={{ mb: 1 }}
      >
        {isTesting ? 'Running Tests...' : (testResults.length > 0 ? `Run Tests for ${currentFileName}` : `Run Tests for ${currentFileName}`)}
      </Button>
      {!canRunTests && !isTesting && (
        <Typography variant="caption" color="text.secondary">
          Open a Solidity file (.sol) to enable tests for that file.
        </Typography>
      )}
       {/* Placeholder for future options like selecting test files or modes */}
    </Box>
  );
};

export default ContractTestRunner;
