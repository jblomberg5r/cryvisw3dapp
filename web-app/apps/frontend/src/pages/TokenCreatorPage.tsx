import React, { useEffect } from 'react';
import { useTokenCreatorStore } from '../store/tokenCreatorStore';
import { TokenConfig } from '../types/token';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button,
  ToggleButtonGroup, ToggleButton, CircularProgress, Alert, useTheme,
  Stack, Divider as MuiDivider, Chip
} from '@mui/material';
import ERC20Form from '../components/tokencreator/ERC20Form';
import ERC721Form from '../components/tokencreator/ERC721Form';
import ERC1155Form from '../components/tokencreator/ERC1155Form';
import CodeEditor from '../components/editor/CodeEditor';
import NetworkSelector from '../components/network/NetworkSelector';
import GasEstimator from '../components/network/GasEstimator';
import Deployer from '../components/network/Deployer';
import DeploymentStatusDisplay from '../components/network/DeploymentStatusDisplay';
import { useDeploymentStore } from '../store/deploymentStore';
import { useNetworkStore } from '../store/networkStore';

const TokenCreatorPage: React.FC = () => {
  const {
    tokenConfig,
    selectedStandard,
    generatedCode,
    isGenerating,
    setStandard,
    updateConfig,
    generateCode,
    resetConfig,
    setGeneratedCode,
  } = useTokenCreatorStore();

  const { estimateGas, clearAllDeployments } = useDeploymentStore();
  const { selectedNetworkId } = useNetworkStore();

  const theme = useTheme();

  useEffect(() => {
    // Clear deployments when page loads/reloads or standard changes,
    // as deployment context might become invalid.
    clearAllDeployments();
    // return () => { clearAllDeployments(); }; // Optional: clear on unmount
  }, [selectedStandard, clearAllDeployments]);

  // Effect to trigger gas estimation when relevant fields change
  useEffect(() => {
    if (generatedCode && selectedNetworkId && selectedStandard) {
      // Only estimate if there's actual code and a network
      estimateGas(generatedCode, selectedNetworkId);
    }
  }, [generatedCode, selectedNetworkId, selectedStandard, estimateGas]);

  const handleStandardChange = (
    event: React.MouseEvent<HTMLElement>,
    newStandard: TokenConfig['standard'] | null,
  ) => {
    setStandard(newStandard);
  };

  const handleBaseConfigChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig(event.target.name as keyof TokenConfig, event.target.value);
  };

  const isFormValid = () => {
    if (!selectedStandard || !tokenConfig.name?.trim() || !tokenConfig.symbol?.trim()) return false;
    if (selectedStandard === 'ERC20') {
      const erc20Conf = tokenConfig as Partial<import('../types/token').ERC20Config>;
      if (erc20Conf.decimals === undefined || erc20Conf.decimals < 0 || erc20Conf.decimals > 255 || !erc20Conf.initialSupply?.trim()) return false;
    }
    if (selectedStandard === 'ERC1155') {
      const erc1155Conf = tokenConfig as Partial<import('../types/token').ERC1155Config>;
      if (!erc1155Conf.uri?.trim()) return false;
    }
    return true;
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{mb: 3}}>
        Smart Contract Token Creator
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{mb: 4}}>
        Choose a token standard, configure its properties, generate, (optionally edit), and deploy the Solidity code.
      </Typography>

      <Paper elevation={2} sx={{ p: {xs: 2, md: 4}, mb: 4 }}>
        {/* Configuration Section */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>1. Select Token Standard</Typography>
            <ToggleButtonGroup
              color="primary"
              value={selectedStandard}
              exclusive
              onChange={handleStandardChange}
              aria-label="Token Standard"
              fullWidth
            >
              <ToggleButton value="ERC20">ERC20 (Fungible)</ToggleButton>
              <ToggleButton value="ERC721">ERC721 (NFT)</ToggleButton>
              <ToggleButton value="ERC1155">ERC1155 (Multi-Token)</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {selectedStandard && (
            <>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{mt: 2}}>2. Configure Base Properties</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Token Name"
                  name="name"
                  value={tokenConfig.name || ''}
                  onChange={handleBaseConfigChange}
                  helperText="e.g., MyToken, CryptoKitties"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  required
                  label="Token Symbol"
                  name="symbol"
                  value={tokenConfig.symbol || ''}
                  onChange={handleBaseConfigChange}
                  helperText="e.g., MTK, CK"
                />
              </Grid>
            </>
          )}
        </Grid>

        {selectedStandard === 'ERC20' && <ERC20Form />}
        {selectedStandard === 'ERC721' && <ERC721Form />}
        {selectedStandard === 'ERC1155' && <ERC1155Form />}

        {selectedStandard && (
          <Box sx={{ mt: 4, display: 'flex', flexDirection: {xs: 'column', sm: 'row'}, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
             {/* Moved NetworkSelector here to be available before code gen for gas est. */}
            <NetworkSelector sx={{minWidth: {xs: '100%', sm: 240}, mb: {xs: 2, sm: 0}}} />
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={generateCode}
              disabled={isGenerating || !isFormValid()}
              startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : null}
            >
              {isGenerating ? 'Generating Code...' : 'Generate Contract Code'}
            </Button>
          </Box>
        )}
      </Paper>

      {/* Generated Code & Deployment Section */}
      {generatedCode && selectedStandard && (
        <Paper elevation={2} sx={{ p: {xs: 1, md: 2}, mt: 4 }}>
          <Typography variant="h6" gutterBottom>3. Generated Solidity Code & Deployment</Typography>
          <Alert severity="info" sx={{mb:1}}>
            This is a basic implementation. Always review and test thoroughly before deploying to a live network.
          </Alert>
           <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
            You can edit the code below. Re-generating code will overwrite manual edits. Gas estimation updates automatically.
          </Typography>
          <Box sx={{ height: '500px', border: `1px solid ${theme.palette.divider}`, mb: 3 }}>
            <CodeEditor
              value={generatedCode}
              onChange={(newCode) => setGeneratedCode(newCode)}
              mode="solidity"
              theme={theme.palette.mode === 'dark' ? 'tomorrow_night' : 'github'}
              readOnly={false}
              height="500px"
            />
          </Box>

          <MuiDivider sx={{ my: 3 }}><Chip label="Deployment Tools" /></MuiDivider>
          <Grid container spacing={3} alignItems="stretch"> {/* alignItems stretch for equal height Paper */}
            <Grid item xs={12} md={5} sx={{display: 'flex'}}>
              <GasEstimator sx={{ flexGrow: 1 }} />
            </Grid>
            <Grid item xs={12} md={7} sx={{display: 'flex'}}>
              <Deployer
                contractCode={generatedCode}
                contractName={tokenConfig.name || "MyToken"}
                sx={{ flexGrow: 1 }}
              />
            </Grid>
          </Grid>
          <DeploymentStatusDisplay />
        </Paper>
      )}
    </Container>
  );
};

export default TokenCreatorPage;
