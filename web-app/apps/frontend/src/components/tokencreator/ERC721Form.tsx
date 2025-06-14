import React from 'react';
import { useTokenCreatorStore } from '../../store/tokenCreatorStore';
import { ERC721Config, ERC721Features, defaultERC721Config } from '../../types/token';
import { TextField, Checkbox, FormControlLabel, FormGroup, Typography, Grid, Paper, Tooltip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

const featureDescriptions: Record<keyof ERC721Features, string> = {
  mintable: "Allows new NFTs to be created after deployment (typically restricted).",
  burnable: "Allows owners to destroy their NFTs.",
  pausable: "Allows pausing and unpausing of NFT transfers (typically restricted).",
  autoIncrementIds: "Automatically assigns sequential IDs to new NFTs, simplifying minting.",
  enumerable: "EIP-721 Enumerable: Allows on-chain listing of all tokens and tokens by owner.",
  uriStorage: "EIP-721 URI Storage: Allows setting a unique URI for each token ID.",
  votes: "EIP-721 Votes: Enables on-chain voting and delegation for NFTs (e.g., for DAOs)."
};

const ERC721Form: React.FC = () => {
  const { tokenConfig, updateConfig, updateFeature } = useTokenCreatorStore();
  const config = tokenConfig as Partial<ERC721Config>;

  const handleFeatureChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateFeature('ERC721', event.target.name as keyof ERC721Features, event.target.checked);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    updateConfig(event.target.name as keyof ERC721Config, event.target.value);
  };

  return (
    <Paper variant="outlined" sx={{ p: 3, mt: 2 }}>
      <Typography variant="h6" gutterBottom>ERC721 Configuration</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Base URI (Optional)"
            name="baseUri"
            value={config.baseUri ?? ''}
            onChange={handleInputChange}
            helperText="Base URI for token metadata. e.g., 'https://api.example.com/nft/'. Token ID will be appended."
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Features:</Typography>
      <FormGroup>
        <Grid container spacing={1}>
          {Object.keys(defaultERC721Config.features || {}).map((featureKey) => (
            <Grid item xs={12} sm={6} key={featureKey}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={config.features?.[featureKey as keyof ERC721Features] ?? false}
                    onChange={handleFeatureChange}
                    name={featureKey}
                  />
                }
                label={
                  <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                    {featureKey.charAt(0).toUpperCase() + featureKey.slice(1).replace(/([A-Z])/g, ' $1')} {/* Prettify label */}
                    <Tooltip title={featureDescriptions[featureKey as keyof ERC721Features]} placement="top-start">
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

export default ERC721Form;
