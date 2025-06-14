import React from 'react';
import { useWeb3Modal, useWeb3ModalAccount, useDisconnect } from '@web3modal/ethers/react';
import { Button, Chip, Box, Typography, Tooltip } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew'; // For disconnect

const ConnectWalletButton: React.FC = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount(); // Get connection state directly
  const { disconnect } = useDisconnect(); // Hook for disconnecting

  const truncateAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  if (isConnected && address) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {/* <Chip
          label={truncateAddress(address)}
          variant="outlined"
          sx={{
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.7)',
            fontSize: '0.9rem',
            '.MuiChip-label': { overflow: 'visible'} // Prevent label truncation if too small
          }}
        /> */}
         <Button
          variant="outlined"
          onClick={() => open({ view: 'Account' })} // Open account view
          sx={{
            color: 'inherit',
            borderColor: 'rgba(255,255,255,0.7)',
            textTransform: 'none',
            fontSize: '0.9rem'
          }}
        >
          {truncateAddress(address)}
        </Button>
        <Tooltip title="Disconnect Wallet">
          <Button
            onClick={() => disconnect()}
            color="inherit"
            variant="text"
            size="small"
            sx={{
                minWidth: 'auto',
                padding: '6px',
                borderColor: 'rgba(255,255,255,0.7)',
                '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                }
            }}
            aria-label="Disconnect Wallet"
          >
            <PowerSettingsNewIcon />
          </Button>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Button
      variant="outlined"
      onClick={() => open()}
      startIcon={<AccountBalanceWalletIcon />}
      sx={{
        color: 'inherit',
        borderColor: 'rgba(255,255,255,0.7)',
        '&:hover': {
            borderColor: 'white',
            backgroundColor: 'rgba(255,255,255,0.1)'
        }
    }}
    >
      Connect Wallet
    </Button>
  );
};

export default ConnectWalletButton;
