import React from 'react';
import { useNetworkStore } from '../../store/networkStore';
import { DeploymentNetwork } from '../../types/network';
import { FormControl, InputLabel, Select, MenuItem, Box, Chip, Typography, SelectChangeEvent } from '@mui/material';
import WifiIcon from '@mui/icons-material/Wifi'; // Example icon
import WifiOffIcon from '@mui/icons-material/WifiOff'; // Example icon for no selection

interface NetworkSelectorProps {
  label?: string;
  sx?: object;
  disabled?: boolean;
}

const NetworkSelector: React.FC<NetworkSelectorProps> = ({
  label = "Select Network",
  sx,
  disabled = false
}) => {
  const { availableNetworks, selectedNetworkId, setSelectedNetworkId, selectedNetwork } = useNetworkStore();

  const handleChange = (event: SelectChangeEvent<string | null>) => {
    const networkId = event.target.value;
    setSelectedNetworkId(networkId as string | null);
  };

  return (
    <Box sx={{ minWidth: 220, ...sx }}>
      <FormControl fullWidth disabled={disabled}>
        <InputLabel id="network-selector-label">{selectedNetwork ? 'Current Network' : label}</InputLabel>
        <Select
          labelId="network-selector-label"
          id="network-selector"
          value={selectedNetworkId || ''} // Ensure value is not null for Select
          label={selectedNetwork ? 'Current Network' : label}
          onChange={handleChange}
          renderValue={(selectedId) => {
            if (!selectedId) {
              return <Typography sx={{color: 'text.secondary', fontStyle: 'italic'}}>Select a network</Typography>;
            }
            const current = availableNetworks.find(net => net.id === selectedId);
            return (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <WifiIcon sx={{ mr: 1, fontSize: '1.1rem', color: current?.isTestnet ? 'warning.main' : 'success.main' }} />
                <Typography variant="body2" component="span" sx={{fontWeight: 500}}>{current?.name}</Typography>
                {current && (
                  <Chip
                    label={current.isTestnet ? "Testnet" : "Mainnet"}
                    size="small"
                    color={current.isTestnet ? "warning" : "success"}
                    variant="outlined"
                    sx={{ ml: 1, fontSize: '0.7rem', height: '20px' }}
                  />
                )}
              </Box>
            );
          }}
        >
          <MenuItem value="" disabled>
            <Typography sx={{color: 'text.secondary', fontStyle: 'italic'}}>None</Typography>
          </MenuItem>
          {availableNetworks.map((network) => (
            <MenuItem key={network.id} value={network.id}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%'}}>
                <Typography variant="body2" component="span">{network.name}</Typography>
                <Chip
                  label={network.isTestnet ? "Testnet" : "Mainnet"}
                  size="small"
                  color={network.isTestnet ? "warning" : "success"}
                  variant="outlined"
                  sx={{ ml: 'auto', fontSize: '0.7rem', height: '20px' }}
                />
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default NetworkSelector;
