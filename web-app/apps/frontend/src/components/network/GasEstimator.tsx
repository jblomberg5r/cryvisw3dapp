import React from 'react';
import { useDeploymentStore } from '../../store/deploymentStore';
import { Box, Typography, CircularProgress, Paper, Chip } from '@mui/material';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';

interface GasEstimatorProps {
  // Future: could take contractCode and networkId to trigger estimation
  // on specific events, or a manual "Estimate" button.
  // For now, it just displays the store's values.
  sx?: object;
}

const GasEstimator: React.FC<GasEstimatorProps> = ({ sx }) => {
  const { estimatedGas, isEstimatingGas } = useDeploymentStore();

  return (
    <Paper variant="outlined" sx={{ p: 2, ...sx, display: 'flex', alignItems: 'center', minHeight: '60px' }}>
      <LocalGasStationIcon color="action" sx={{ mr: 1.5, fontSize: '1.8rem' }} />
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
          Estimated Gas Cost
        </Typography>
        {isEstimatingGas ? (
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <CircularProgress size={16} sx={{ mr: 1 }} />
            <Typography variant="body2" color="text.primary">
              Estimating...
            </Typography>
          </Box>
        ) : estimatedGas ? (
          <Chip label={estimatedGas} color="info" size="small" sx={{ mt: 0.5, fontWeight: 'medium' }} />
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
            Not available. Provide contract and select network.
          </Typography>
        )}
      </Box>
      {/*
        Placeholder comment for future backend/web3 integration:
        Actual gas estimation requires:
        1. Access to the contract ABI and bytecode.
        2. A Web3 provider (e.g., from ethers.js or viem) connected to the selected network.
        3. Calling provider.estimateGas() with the deployment transaction details.
        This component currently displays mock data from the store.
      */}
    </Paper>
  );
};

export default GasEstimator;
