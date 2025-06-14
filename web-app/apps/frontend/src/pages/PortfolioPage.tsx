import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '../store/portfolioStore';
import { useWalletStore } from '../store/walletStore'; // To sync connected wallet
import { PortfolioAsset, TrackedWallet } from '../types/portfolio';
import {
  Container, Typography, Box, Paper, Grid, TextField, Button, List, ListItem,
  ListItemText, IconButton, CircularProgress, Alert, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Avatar, Tooltip, Chip, Link as MuiLink
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import InfoIcon from '@mui/icons-material/Info';

const PortfolioPage: React.FC = () => {
  const {
    trackedWallets,
    aggregatedPortfolio,
    isLoading,
    lastError,
    addTrackedWallet,
    removeTrackedWallet,
    fetchPortfolioData,
    syncConnectedWallet,
  } = usePortfolioStore();
  const { address: connectedWalletAddress, isConnected: isWalletConnected } = useWalletStore();

  const [newWalletAddress, setNewWalletAddress] = useState('');
  const [newWalletName, setNewWalletName] = useState('');

  useEffect(() => {
    // Sync connected wallet on page load or when it changes and is not yet tracked
    if (isWalletConnected && connectedWalletAddress) {
      syncConnectedWallet(connectedWalletAddress, "My Connected Wallet");
    }
  }, [isWalletConnected, connectedWalletAddress, syncConnectedWallet]);

  // Fetch data if no portfolio and wallets are present (e.g. after adding first wallet)
  useEffect(() => {
    if (trackedWallets.length > 0 && !aggregatedPortfolio && !isLoading) {
        fetchPortfolioData();
    }
  }, [trackedWallets, aggregatedPortfolio, isLoading, fetchPortfolioData]);


  const handleAddWallet = () => {
    if (newWalletAddress.trim()) {
      addTrackedWallet(newWalletAddress.trim(), newWalletName.trim() || undefined);
      setNewWalletAddress('');
      setNewWalletName('');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{mb:4}}>
        <AccountBalanceWalletIcon sx={{fontSize: '2.8rem', verticalAlign: 'bottom', mr:1}}/>
        Portfolio Tracker
      </Typography>

      {/* Manage Tracked Wallets Section */}
      <Paper elevation={2} sx={{ p: {xs:2, sm:3}, mb: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>Manage Tracked Wallets</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={5}>
            <TextField
              fullWidth
              label="Wallet Address (0x...)"
              value={newWalletAddress}
              onChange={(e) => setNewWalletAddress(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Alias / Name (Optional)"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddWallet}
              startIcon={<AddCircleOutlineIcon />}
              disabled={!newWalletAddress.trim()}
            >
              Add Wallet
            </Button>
          </Grid>
        </Grid>
        {lastError && <Alert severity="error" sx={{mt:2}} onClose={() => usePortfolioStore.setState({lastError: null})}>{lastError}</Alert>}
        {trackedWallets.length > 0 && (
          <List dense sx={{mt:2}}>
            {trackedWallets.map((wallet) => (
              <ListItem
                key={wallet.address}
                divider
                secondaryAction={
                  <Tooltip title="Remove Wallet">
                    <IconButton edge="end" aria-label="delete" onClick={() => removeTrackedWallet(wallet.address)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                }
              >
                <ListItemText
                    primary={wallet.name || `Wallet`}
                    secondary={wallet.address}
                    primaryTypographyProps={{fontWeight:'medium'}}
                />
              </ListItem>
            ))}
          </List>
        )}
         {trackedWallets.length === 0 && !lastError && (
            <Typography color="text.secondary" sx={{mt:2, textAlign:'center'}}>
                No wallets being tracked. Add one to get started.
            </Typography>
        )}
      </Paper>

      {/* Portfolio Display Section */}
      <Paper elevation={2} sx={{ p: {xs:2, sm:3}, mb: 4 }}>
        <Box sx={{display:'flex', justifyContent:'space-between', alignItems:'center', mb:2}}>
            <Typography variant="h5" component="h2" gutterBottom>
                <ShowChartIcon sx={{verticalAlign: 'middle', mr:1}}/>
                Aggregated Portfolio Overview
            </Typography>
            <Button variant="outlined" onClick={fetchPortfolioData} startIcon={<RefreshIcon />} disabled={isLoading || trackedWallets.length === 0}>
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
            </Button>
        </Box>

        {isLoading && <Box sx={{textAlign: 'center', my:3}}><CircularProgress /></Box>}

        {!isLoading && !aggregatedPortfolio && trackedWallets.length > 0 && (
             <Alert severity="info">Click "Refresh Data" to load your portfolio details, or add a wallet if you haven't already.</Alert>
        )}
        {!isLoading && !aggregatedPortfolio && trackedWallets.length === 0 && (
             <Alert severity="info">Add a wallet address above and click "Refresh Data" to see your portfolio.</Alert>
        )}


        {aggregatedPortfolio && !isLoading && (
          <>
            <Grid container spacing={2} sx={{ mb: 3, textAlign: 'center' }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="h4" sx={{fontWeight:'bold'}}>${aggregatedPortfolio.totalValueUSD}</Typography>
                <Typography color="text.secondary">Total Portfolio Value</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography
                    variant="h5"
                    color={aggregatedPortfolio.change24hPercentage && aggregatedPortfolio.change24hPercentage >= 0 ? 'success.main' : 'error.main'}
                    sx={{fontWeight:'medium'}}
                >
                  {aggregatedPortfolio.change24hPercentage ?
                    `${aggregatedPortfolio.change24hPercentage >= 0 ? '+' : ''}${aggregatedPortfolio.change24hPercentage.toFixed(2)}%`
                    : 'N/A'}
                   {aggregatedPortfolio.change24hValueUSD &&
                    <Typography component="span" variant="caption" sx={{ml:0.5}}>
                        ({aggregatedPortfolio.change24hValueUSD.startsWith('-') ? '' : '+'}{aggregatedPortfolio.change24hValueUSD} USD)
                    </Typography>
                   }
                </Typography>
                <Typography color="text.secondary">24h Change</Typography>
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom>Asset Allocation</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table aria-label="portfolio assets table">
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell align="right">Quantity</TableCell>
                    <TableCell align="right">Value (USD)</TableCell>
                    <TableCell align="right">Allocation</TableCell>
                    <TableCell align="right">Chain</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {aggregatedPortfolio.assets.map((asset) => (
                    <TableRow key={asset.tokenInfo.address + asset.chainId}>
                      <TableCell component="th" scope="row">
                        <Box sx={{display:'flex', alignItems:'center'}}>
                            <Avatar src={asset.tokenInfo.logoURI} alt={asset.tokenInfo.symbol} sx={{width:24, height:24, mr:1}}>
                                {asset.tokenInfo.symbol?.charAt(0)}
                            </Avatar>
                            {asset.tokenInfo.name} ({asset.tokenInfo.symbol})
                        </Box>
                      </TableCell>
                      <TableCell align="right">{parseFloat(asset.quantity).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 6})}</TableCell>
                      <TableCell align="right">${parseFloat(asset.valueUSD).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                      <TableCell align="right">{asset.allocationPercentage?.toFixed(2)}%</TableCell>
                      <TableCell align="right">
                        <Chip label={useNetworkStore.getState().availableNetworks.find(n=>n.chainId === asset.chainId)?.name || `Chain ${asset.chainId}`} size="small"/>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
        <Alert severity="warning" icon={<InfoIcon />} sx={{mt:3}}>
            <strong>Disclaimer:</strong> All portfolio data shown is for mock/demonstration purposes only.
            It does not reflect real asset values or balances.
            Integrating with on-chain data requires API services like Zerion, Zapper, Covalent, or direct node interaction.
        </Alert>
      </Paper>
    </Container>
  );
};

export default PortfolioPage;
