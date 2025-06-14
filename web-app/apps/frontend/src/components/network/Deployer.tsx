import React, { useState, useEffect } from 'react';
import { useDeploymentStore } from '../../store/deploymentStore';
import { useNetworkStore } from '../../store/networkStore';
import { useWalletStore } from '../../store/walletStore'; // To get current wallet chainId
import { useSwitchNetwork, useWeb3ModalAccount } from '@web3modal/ethers/react'; // Import useSwitchNetwork
import { Button, CircularProgress, Box, Typography, Alert } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import SyncProblemIcon from '@mui/icons-material/SyncProblem'; // For switch network button

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
  const { deployContract, isDeploying: isDeployStoreDeploying } = useDeploymentStore();
  const { selectedNetworkId, selectedNetwork } = useNetworkStore();
  const { chainId: walletChainId, isConnected } = useWeb3ModalAccount(); // Get wallet's current chainId

  const { switchNetwork, chainId: switchNetworkChainId, error: switchError, isLoading: isSwitchingNetwork } = useSwitchNetwork();

  const [userAttemptedSwitch, setUserAttemptedSwitch] = useState(false);
  const [networkSwitchError, setNetworkSwitchError] = useState<string | null>(null);

  useEffect(() => {
    if (switchError) {
      setNetworkSwitchError(`Failed to switch network: ${switchError.message}`);
    } else {
      setNetworkSwitchError(null);
    }
  }, [switchError]);

  // Reset userAttemptedSwitch if selectedNetwork or walletChainId changes
  useEffect(() => {
    setUserAttemptedSwitch(false);
  }, [selectedNetworkId, walletChainId]);


  const targetChainId = selectedNetwork?.chainId;
  const isNetworkMismatched = isConnected && targetChainId && walletChainId !== targetChainId;

  const handleDeploy = async () => {
    if (onBeforeDeploy && !onBeforeDeploy()) {
      console.log("Deployment halted by onBeforeDeploy callback.");
      return;
    }

    if (isNetworkMismatched && targetChainId) {
      // This case should ideally be handled by the Switch Network button now
      // but as a fallback or if user somehow bypasses it:
      setUserAttemptedSwitch(true);
      await switchNetwork(targetChainId);
      // Check again after switch attempt
      if (useWalletStore.getState().chainId !== targetChainId) {
          // If still mismatched after trying to switch (e.g. user rejected)
          setNetworkSwitchError("Network switch required or failed. Please switch your wallet's network to deploy.");
          return;
      }
    }

    setNetworkSwitchError(null); // Clear any previous switch error

    if (contractCode && selectedNetworkId) {
      deployContract(contractName, contractCode, selectedNetworkId);
    } else {
      console.error("Contract code or network not selected for deployment.");
    }
  };

  const handleSwitchNetwork = async () => {
    if (targetChainId) {
      setUserAttemptedSwitch(true);
      setNetworkSwitchError(null); // Clear previous errors before attempting
      await switchNetwork(targetChainId);
    }
  };

  const isLoading = isDeployStoreDeploying || isSwitchingNetwork;
  // Disable deploy if not connected, no contract, no network, or if network is mismatched and user hasn't tried/succeeded switching
  const canDeploy = isConnected && contractCode && selectedNetworkId && !isLoading && !isNetworkMismatched;
  const showSwitchButton = isConnected && isNetworkMismatched && !isSwitchingNetwork;

  return (
    <Box sx={{ ...sx }}>
      {!isConnected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect your wallet to enable deployment.
        </Alert>
      )}
       {isConnected && !selectedNetworkId && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Please select a target network for deployment.
        </Alert>
      )}
      {isConnected && selectedNetworkId && !contractCode && (
         <Alert severity="warning" sx={{ mb: 2 }}>
          No contract code available to deploy. Generate or select a contract.
        </Alert>
      )}

      {networkSwitchError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {networkSwitchError}
        </Alert>
      )}

      {showSwitchButton ? (
        <Button
          variant="outlined"
          color="warning"
          size="large"
          startIcon={isSwitchingNetwork ? <CircularProgress size={24} color="inherit" /> : <SyncProblemIcon />}
          onClick={handleSwitchNetwork}
          disabled={isLoading || !targetChainId}
          fullWidth
          sx={{mb: 1}}
        >
          {isSwitchingNetwork ? 'Switching Network...' : `Switch to ${selectedNetwork?.name || 'Selected Network'}`}
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : <RocketLaunchIcon />}
          onClick={handleDeploy}
          disabled={!canDeploy || isLoading} // Disable if cannot deploy or any loading state
          fullWidth
        >
          {isDeployStoreDeploying ? 'Deploying...' : (isSwitchingNetwork ? 'Waiting for Network...' : `Deploy to ${selectedNetwork?.name || 'selected network'}`)}
        </Button>
      )}

      {selectedNetwork && (
        <Typography variant="caption" display="block" sx={{ mt: 1, textAlign: 'center', color: 'text.secondary' }}>
          Target: {selectedNetwork.name} (Chain ID: {selectedNetwork.chainId})
          {walletChainId && walletChainId !== selectedNetwork.chainId && isConnected && (
            <Typography component="span" variant="caption" color="error" sx={{ml:0.5}}>(Wallet on Chain ID: {walletChainId})</Typography>
          )}
        </Typography>
      )}
    </Box>
  );
};

export default Deployer;
