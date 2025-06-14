import React from 'react';
import { useDeploymentStore } from '../../store/deploymentStore';
import { useNetworkStore } from '../../store/networkStore';
import { DeploymentInfo, DeploymentStatus } from '../../types/deployment';
import {
  List, ListItem, ListItemIcon, ListItemText, Typography, Paper, Box, Chip,
  CircularProgress, Link, IconButton, Tooltip, Alert
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty'; // Pending
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension'; // Broadcasting
import FileCopyIcon from '@mui/icons-material/FileCopy'; // For copying address/txHash
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import DeleteIcon from '@mui/icons-material/Delete';

interface DeploymentItemProps {
  deployment: DeploymentInfo;
  onClear: (id: string) => void;
}

const StatusIconAndColor = (status: DeploymentStatus): { icon: React.ReactElement, color: string } => {
  switch (status) {
    case 'confirmed':
      return { icon: <CheckCircleIcon color="success" />, color: 'success.main' };
    case 'failed':
      return { icon: <CancelIcon color="error" />, color: 'error.main' };
    case 'broadcasting':
      return { icon: <SendTimeExtensionIcon color="info" />, color: 'info.main' };
    case 'pending':
      return { icon: <HourglassEmptyIcon color="warning" />, color: 'warning.main' };
    default:
      return { icon: <CircularProgress size={20} />, color: 'text.secondary' }; // For 'none' or intermediate
  }
};

const DeploymentItem: React.FC<DeploymentItemProps> = ({ deployment, onClear }) => {
  const { getNetworkById } = useNetworkStore.getState();
  const network = getNetworkById(deployment.networkId);

  const { icon, color } = StatusIconAndColor(deployment.status);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => console.error('Failed to copy:', err));
  };

  return (
    <ListItem
      divider
      sx={{
        py: 1.5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        '&:hover .clear-button': { opacity: 1 }
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 0.5 }}>
        <ListItemIcon sx={{ minWidth: 36, color }}>{icon}</ListItemIcon>
        <ListItemText
          primary={
            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
              {deployment.contractName || 'Contract Deployment'} - <Chip label={deployment.status.toUpperCase()} size="small" sx={{backgroundColor: color, color: 'white', fontWeight:'bold'}}/>
            </Typography>
          }
          secondary={`Network: ${network?.name || deployment.networkId} | ${deployment.timestamp.toLocaleString()}`}
        />
        <Tooltip title="Clear this deployment log">
            <IconButton size="small" onClick={() => onClear(deployment.id)} className="clear-button" sx={{opacity: 0.3}}>
                <DeleteIcon fontSize="small" />
            </IconButton>
        </Tooltip>
      </Box>

      {deployment.transactionHash && (
        <Box sx={{ pl: '36px', display: 'flex', alignItems: 'center', my: 0.5, width: '100%' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Tx Hash:</Typography>
          <Link
            href={network?.blockExplorerUrl ? `${network.blockExplorerUrl}/tx/${deployment.transactionHash}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mr: 0.5, wordBreak: 'break-all', fontSize: '0.8rem' }}
          >
            {deployment.transactionHash.substring(0, 10)}...{deployment.transactionHash.substring(deployment.transactionHash.length - 8)}
          </Link>
          <Tooltip title="Copy Transaction Hash">
            <IconButton size="small" onClick={() => handleCopyToClipboard(deployment.transactionHash!)} sx={{p:0.2}}>
              <FileCopyIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
          {network?.blockExplorerUrl && (
             <Tooltip title={`View on ${network.name} Explorer`}>
                <IconButton size="small" href={`${network.blockExplorerUrl}/tx/${deployment.transactionHash}`} target="_blank" rel="noopener noreferrer" sx={{p:0.2}}>
                    <OpenInNewIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {deployment.contractAddress && (
        <Box sx={{ pl: '36px', display: 'flex', alignItems: 'center', my: 0.5, width: '100%' }}>
          <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>Contract Address:</Typography>
          <Link
            href={network?.blockExplorerUrl ? `${network.blockExplorerUrl}/address/${deployment.contractAddress}` : '#'}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ mr: 0.5, wordBreak: 'break-all', fontSize: '0.8rem' }}
          >
            {deployment.contractAddress}
          </Link>
          <Tooltip title="Copy Contract Address">
            <IconButton size="small" onClick={() => handleCopyToClipboard(deployment.contractAddress!)} sx={{p:0.2}}>
              <FileCopyIcon sx={{ fontSize: '0.9rem' }} />
            </IconButton>
          </Tooltip>
           {network?.blockExplorerUrl && (
             <Tooltip title={`View on ${network.name} Explorer`}>
                <IconButton size="small" href={`${network.blockExplorerUrl}/address/${deployment.contractAddress}`} target="_blank" rel="noopener noreferrer" sx={{p:0.2}}>
                    <OpenInNewIcon sx={{ fontSize: '0.9rem' }} />
                </IconButton>
            </Tooltip>
          )}
        </Box>
      )}

      {deployment.error && (
        <Box sx={{ pl: '36px', mt: 1, width: '100%' }}>
          <Alert severity="error" variant="outlined" sx={{fontSize: '0.8rem', py:0, px:1}}>
            <Typography variant="caption" sx={{whiteSpace: 'pre-wrap'}}>Error: {deployment.error}</Typography>
          </Alert>
        </Box>
      )}
    </ListItem>
  );
};

const DeploymentStatusDisplay: React.FC = () => {
  const { currentDeployments, clearRecentDeployment, clearAllDeployments } = useDeploymentStore();

  if (currentDeployments.length === 0) {
    return (
      <Paper variant="outlined" sx={{ p: 2, mt: 2, textAlign: 'center' }}>
        <Typography color="text.secondary">No deployment activity yet.</Typography>
      </Paper>
    );
  }

  return (
    <Paper variant="outlined" sx={{ mt: 2 }}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', p:1.5, borderBottom: '1px solid #eee'}}>
        <Typography variant="h6" >Deployment Activity</Typography>
        <Button size="small" onClick={clearAllDeployments} disabled={currentDeployments.length === 0}>
            Clear All
        </Button>
      </Box>
      <List dense sx={{ maxHeight: 300, overflowY: 'auto', p:0 }}>
        {currentDeployments.map((dep) => (
          <DeploymentItem key={dep.id} deployment={dep} onClear={clearRecentDeployment} />
        ))}
      </List>
      {/*
        Placeholder comment for future backend/web3 integration:
        Actual deployment status tracking would involve:
        1. Subscribing to transaction receipts using a Web3 provider.
        2. Updating status based on confirmations and error events.
        This component currently displays mock data from the store.
      */}
    </Paper>
  );
};

export default DeploymentStatusDisplay;
