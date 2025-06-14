import React from 'react';
import { Button, ButtonGroup, Tooltip } from '@mui/material';
import { Commit as CommitIcon, History as HistoryIcon } from '@mui/icons-material';

// Future backend integration will be required for these actions.
// For now, buttons are disabled or log to console.

const VersionControlActions: React.FC = () => {
  const handleCommit = () => {
    console.log('Commit action clicked - requires backend integration.');
    // Future: Open a commit dialog, then send data to backend.
  };

  const handleViewHistory = () => {
    console.log('View History action clicked - requires backend integration.');
    // Future: Fetch history from backend and display it.
  };

  return (
    <ButtonGroup variant="outlined" aria-label="version control actions">
      <Tooltip title="Commit changes (not implemented)">
        <span>
          <Button
            startIcon={<CommitIcon />}
            onClick={handleCommit}
            disabled // Enable once backend is ready
          >
            Commit
          </Button>
        </span>
      </Tooltip>
      <Tooltip title="View commit history (not implemented)">
        <span>
          <Button
            startIcon={<HistoryIcon />}
            onClick={handleViewHistory}
            disabled // Enable once backend is ready
          >
            View History
          </Button>
        </span>
      </Tooltip>
      {/* Add other actions like Push, Pull, Branch as needed in the future */}
    </ButtonGroup>
  );
};

export default VersionControlActions;
