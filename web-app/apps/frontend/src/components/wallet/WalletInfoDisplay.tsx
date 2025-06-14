import React from 'react';
import { useWalletStore } from '../../store/walletStore';
import { useNetworkStore } from '../../store/networkStore'; // To map chainId to network name
import { Typography, Box, Paper, Chip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import NetworkCellIcon from '@mui/icons-material/NetworkCell'; // For network info

const WalletInfoDisplay: React.FC = () => {
  const { isConnected, address, chainId } = useWalletStore();
  const { getNetworkById } = useNetworkStore();

  if (!isConnected) {
    return (
      <Paper elevation={1} sx={{ p: 2, mt: 1, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No wallet connected.
        </Typography>
      </Paper>
    );
  }

  const network = chainId ? getNetworkById(String(chainId)) : null; // getNetworkById expects string ID
  // In our networkStore, IDs are strings like 'ethereum_mainnet', but chainId from wallet is number.
  // We need to find network by chainId from availableNetworks.
  const currentNetwork = useNetworkStore.getState().availableNetworks.find(n => n.chainId === chainId);


  return (
    <Paper elevation={1} sx={{ p: 2, mt: 1 }}>
      <Typography variant="h6" gutterBottom>Wallet Information</Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
        <AccountBalanceWalletIcon sx={{ mr: 1 }} color="action" />
        <Typography variant="body1">
          Address: <Chip label={address ? `${address.substring(0, 6)}...${address.substring(address.length - 4)}` : 'N/A'} size="small"/>
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <NetworkCellIcon sx={{ mr: 1 }} color="action" />
        <Typography variant="body1">
          Network: {currentNetwork ? `${currentNetwork.name} (ID: ${chainId})` : (chainId ? `Unknown Network (ID: ${chainId})` : 'N/A')}
        </Typography>
         {currentNetwork && (
            <Chip
                label={currentNetwork.isTestnet ? "Testnet" : "Mainnet"}
                size="small"
                color={currentNetwork.isTestnet ? "warning" : "success"}
                variant="outlined"
                sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
            />
        )}
      </Box>
      {/* Optional: Display ETH Balance - requires async call with provider
      {provider && address && (
        <Typography variant="body1">Balance: Fetching...</Typography>
      )}
      */}
    </Paper>
  );
};

export default WalletInfoDisplay;
