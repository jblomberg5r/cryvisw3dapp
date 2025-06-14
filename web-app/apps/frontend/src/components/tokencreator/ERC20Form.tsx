import React from 'react';
import { useTokenCreatorStore } from '../../store/tokenCreatorStore';
import { ERC20Config, ERC20Features, defaultERC20Config } from '../../types/token'; // Import defaultERC20Config
import { TextField, Checkbox, FormControlLabel, FormGroup, Typography, Grid, Paper, Tooltip, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const featureDescriptions: Record<keyof ERC20Features, string> = {
  mintable: "Allows new tokens to be created after initial supply (typically restricted).",
  burnable: "Allows token holders to destroy their tokens.",
  pausable: "Allows pausing and unpausing of token transfers (typically restricted).",
  permits: "EIP-2612: Allows approvals via signatures, gas-less for approver.",
  votes: "EIP-6372 & ERC20Votes: Enables on-chain voting and delegation.",
  flashMinting: "EIP-3156: Allows minting tokens for a single transaction (flash loan).",
  snapshots: "Allows recording token balances at specific points in time (for governance, etc.)."
};

const ERC20Form: React.FC = () => {
  const { tokenConfig, updateConfig, updateFeature } = useTokenCreatorStore();
  const config = tokenConfig as Partial<ERC20Config>; // Cast for easier access

  const handleFeatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFeature('ERC20', event.target.name as keyof ERC20Features, event.target.checked);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    if (name === 'decimals' || name === 'initialSupply') {
      updateConfig(name as keyof ERC20Config, value === '' ? '' : (name === 'decimals' ? parseInt(value,10) : value) );
    } else {
      updateConfig(name as keyof ERC20Config, value);
    }
  };


  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>ERC20 Configuration</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Decimals"
            name="decimals"
            type="number"
            value={config.decimals ?? 18}
            onChange={handleInputChange}
            helperText="Typically 18 for most ERC20 tokens."
            InputProps={{ inputProps: { min: 0, max: 255 } }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Initial Supply"
            name="initialSupply"
            type="text" // Use text to handle large numbers, validation should be added
            value={config.initialSupply ?? '1000000'}
            onChange={handleInputChange}
            helperText="Total tokens to be created on deployment."
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Premint Receiver Address (Optional)"
            name="premintReceiver"
            value={config.premintReceiver ?? ''}
            onChange={handleInputChange}
            helperText="Address to receive the initial supply. Defaults to deployer if left empty."
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Features:</Typography>
      <FormGroup>
        <Grid container spacing={1}>
          {Object.keys(defaultERC20Config.features || {}).map((featureKey) => (
            <Grid item xs={12} sm={6} key={featureKey}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.features?.[featureKey as keyof ERC20Features] ?? false}
                    onChange={handleFeatureChange}
                    name={featureKey}
                  />
                }
                label={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    {featureKey.charAt(0).toUpperCase() + featureKey.slice(1)}
                    <Tooltip title={featureDescriptions[featureKey as keyof ERC20Features]} placement="top-start">
                      <InfoOutlinedIcon sx={{ ml: 0.5, fontSize: '1rem', color: 'action.active' }} />
                    </Tooltip>
                  </Box>
                }
              />
            </Grid>
          ))}
        </Grid>
      </FormGroup>
    </Paper>
  );
};

export default ERC20Form;
