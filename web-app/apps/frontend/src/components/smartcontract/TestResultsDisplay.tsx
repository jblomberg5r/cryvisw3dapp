import React, { useState } from 'react'; // Added useState
import { useTestStore } from '../../store/testStore';
import { TestResult, TestStatus } from '../../types/smartcontract';
import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Paper,
  Box,
  Chip,
  Collapse,
  IconButton,
  Tooltip,
  CircularProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'; // For pending/skipped
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import NotesIcon from '@mui/icons-material/Notes'; // For logs

interface TestResultItemProps {
  result: TestResult;
}

const StatusIcon: React.FC<{ status: TestStatus }> = ({ status }) => {
  switch (status) {
    case 'passed':
      return <CheckCircleIcon color="success" />;
    case 'failed':
      return <CancelIcon color="error" />;
    case 'running':
      return <CircularProgress size={20} thickness={5} />;
    case 'pending':
      return <HourglassEmptyIcon color="action" />;
    case 'skipped':
      return <HelpOutlineIcon color="disabled" />;
    default:
      return <HelpOutlineIcon color="action" />;
  }
};

const TestResultItem: React.FC<TestResultItemProps> = ({ result }) => {
  const [open, setOpen] = useState(false);

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleToggle} sx={{ borderBottom: '1px solid #f0f0f0' }}>
        <ListItemIcon sx={{ minWidth: 40 }}>
          <StatusIcon status={result.status} />
        </ListItemIcon>
        <ListItemText
          primary={result.testName}
          secondary={
            <Box component="span" sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <Chip
                label={result.status.toUpperCase()}
                size="small"
                color={
                  result.status === 'passed' ? 'success' :
                  result.status === 'failed' ? 'error' :
                  result.status === 'running' ? 'info' :
                  'default'
                }
                variant="outlined"
                sx={{ mr: 1, fontSize: '0.7rem', height: '20px' }}
              />
              {result.duration !== undefined && (
                <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                  {result.duration}ms
                </Typography>
              )}
              {result.contractName && (
                 <Typography variant="caption" color="text.secondary">
                  ({result.contractName})
                </Typography>
              )}
            </Box>
          }
          primaryTypographyProps={{ fontWeight: 'medium' }}
        />
        { (result.message || (result.logs && result.logs.length > 0)) && (
            <IconButton edge="end" size="small">
                {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ p: 2, backgroundColor: '#f9f9f9', borderBottom: '1px solid #eee' }}>
          {result.message && (
            <Alert
                severity={result.status === 'failed' ? 'error' : (result.status === 'skipped' ? 'info' : 'warning')}
                icon={false}
                sx={{mb: result.logs && result.logs.length > 0 ? 1: 0}}
            >
              <AlertTitle sx={{fontWeight: 'medium', fontSize: '0.9rem'}}>
                {result.status === 'failed' ? 'Failure Message' : (result.status === 'skipped' ? 'Skipped Reason' : 'Message')}
              </AlertTitle>
              <Typography variant="body2" sx={{whiteSpace: 'pre-wrap', wordBreak: 'break-all'}}>{result.message}</Typography>
            </Alert>
          )}
          {result.logs && result.logs.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <NotesIcon sx={{ mr: 0.5, fontSize: '1.1rem' }} /> Logs:
              </Typography>
              <Paper variant="outlined" sx={{ p: 1, maxHeight: 150, overflowY: 'auto', backgroundColor: 'white' }}>
                {result.logs.map((log, index) => (
                  <Typography key={index} variant="caption" display="block" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    {log}
                  </Typography>
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      </Collapse>
    </>
  );
};


const TestResultsDisplay: React.FC = () => {
  const { testResults, isTesting, clearTestResults } = useTestStore();

  if (isTesting && testResults.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Running tests, please wait...</Typography>
      </Box>
    );
  }

  if (!isTesting && testResults.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No test results to display. Run tests to see their outcomes.</Typography>
      </Box>
    );
  }

  return (
    <Paper elevation={0} sx={{ mt: 0 }}>
      <Typography variant="h6" sx={{ p: 2, pt:1, borderBottom: '1px solid #eee' }}>
        Test Results ({testResults.filter(r => r.status !== 'running').length} / {testResults.length} completed)
      </Typography>
      <List dense disablePadding sx={{maxHeight: 'calc(100vh - 300px)', overflowY: 'auto'}}> {/* Adjust max height as needed */}
        {testResults.map((result) => (
          <TestResultItem key={result.id} result={result} />
        ))}
      </List>
       {/* Note: Actual test execution requires backend or WASM-based Solidity compiler & EVM. */}
    </Paper>
  );
};

export default TestResultsDisplay;
