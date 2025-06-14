import React from 'react';
import { useTokenCreatorStore } from '../../store/tokenCreatorStore';
import { ERC1155Config, ERC1155Features, defaultERC1155Config } from '../../types/token';
import { TextField, Checkbox, FormControlLabel, FormGroup, Typography, Grid, Paper, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Box } from '@mui/system';


const featureDescriptions: Record<keyof ERC1155Features, string> = {
  mintable: "Allows creating new tokens or minting more of existing tokens (typically restricted).",
  burnable: "Allows owners to destroy their tokens.",
  pausable: "Allows pausing and unpausing of token transfers (typically restricted).",
  supplyTracking: "EIP-1155 Supply: Allows tracking total supply of each token ID."
};

const ERC1155Form: React.FC = () => {
  const { tokenConfig, updateConfig, updateFeature } = useTokenCreatorStore();
  const config = tokenConfig as Partial<ERC1155Config>;

  const handleFeatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFeature('ERC1155', event.target.name as keyof ERC1155Features, event.target.checked);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateConfig(event.target.name as keyof ERC1155Config, event.target.value);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>ERC1155 Configuration</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="URI"
            name="uri"
            value={config.uri ?? ''}
            onChange={handleInputChange}
            helperText="Base URI for token metadata. Can contain '{id}' for token ID specific metadata. e.g., 'https://api.example.com/tokens/{id}.json'"
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Features:</Typography>
      <FormGroup>
        <Grid container spacing={1}>
          {Object.keys(defaultERC1155Config.features || {}).map((featureKey) => (
            <Grid item xs={12} sm={6} key={featureKey}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.features?.[featureKey as keyof ERC1155Features] ?? false}
                    onChange={handleFeatureChange}
                    name={featureKey}
                  />
                }
                label={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    {featureKey.charAt(0).toUpperCase() + featureKey.slice(1).replace(/([A-Z])/g, ' $1')} {/* Prettify label */}
                    <Tooltip title={featureDescriptions[featureKey as keyof ERC1155Features]} placement="top-start">
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

export default ERC1155Form;
