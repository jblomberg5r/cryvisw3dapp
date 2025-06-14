import React from 'react';
import { useDeploymentStore } from '../../store/deploymentStore';
import { useNetworkStore } from '../../store/networkStore';
import { Button, CircularProgress, Box, Typography, Alert } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

interface DeployerProps {
  contractCode: string | null;
  contractName?: string; // Optional, defaults to "MyContract" or similar
  onBeforeDeploy?: () => boolean; // Optional callback, if returns false, deployment is halted
  sx?: object;
}

const Deployer: React.FC<DeployerProps> = ({
  contractCode,
  contractName = "MyDeployedContract",
  onBeforeDeploy,
  sx
}) => {
  const { deployContract, isDeploying } = useDeploymentStore();
  const { selectedNetworkId, selectedNetwork } = useNetworkStore();

  const handleDeploy = () => {
    if (onBeforeDeploy && !onBeforeDeploy()) {
      console.log("Deployment halted by onBeforeDeploy callback.");
      return;
    }

    if (contractCode && selectedNetworkId) {
      deployContract(contractName, contractCode, selectedNetworkId);
    } else {
      console.error("Contract code or network not selected for deployment.");
      // Optionally, show an alert to the user via a snackbar or inline message
    }
    // Note: Actual deployment requires Web3 provider integration (ethers.js, viem)
    // and user's wallet interaction for signing transactions.
    // It would also involve compiling Solidity to bytecode and ABI if `contractCode` is source.
  };

  const canDeploy = contractCode && selectedNetworkId && !isDeploying;

  return (
    <Box sx={{ ...sx }}>
      {!selectedNetworkId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a network to enable deployment.
        </Alert>
      )}
      {!contractCode && selectedNetworkId && (
         <Alert severity="warning" sx={{ mb: 2 }}>
          No contract code available to deploy. Generate or select a contract.
        </Alert>
      )}
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={isDeploying ? <CircularProgress size={24} color="inherit" /> : <RocketLaunchIcon />}
        onClick={handleDeploy}
        disabled={!canDeploy}
        fullWidth
      >
        {isDeploying ? 'Deploying...' : `Deploy to ${selectedNetwork?.name || 'selected network'}`}
      </Button>
      {selectedNetwork && (
        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
          Network: {selectedNetwork.name} (Chain ID: {selectedNetwork.chainId})
        </Typography>
      )}
    </Box>
  );
};

export default Deployer;
