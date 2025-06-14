import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Paper, Grid, TextField, Button, Box, IconButton, CircularProgress, Chip, Tooltip, Alert
} from '@mui/material';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import SettingsIcon from '@mui/icons-material/Settings'; // For slippage settings
import { useSwapStore } from '../store/swapStore';
import { TokenInfo } from '../types/swap';
import TokenSelectionModal from '../components/swap/TokenSelectionModal';
import SwapConfirmationModal from '../components/swap/SwapConfirmationModal';
import { useWalletStore } from '../store/walletStore'; // To check wallet connection
import { ethers } from 'ethers'; // For formatting units

const SwapTokensPage: React.FC = () => {
  const {
    fromToken, toToken, fromAmount, toAmount,
    isLoadingQuote, currentQuote,
    setFromToken, setToToken, setFromAmount,
    getMockQuote, clearSwapState, openConfirmModal
  } = useSwapStore();
  const { isConnected: isWalletConnected } = useWalletStore();

  const [isFromModalOpen, setIsFromModalOpen] = useState(false);
  const [isToModalOpen, setIsToModalOpen] = useState(false);
  const [slippage, setSlippage] = useState('0.5%'); // Mock slippage

  useEffect(() => {
    // Clear state on mount or when page is revisited after being hidden
    // clearSwapState(); // Decided against this to persist user input if they navigate away briefly
    return () => {
        // Optional: clear state on unmount if desired
        // clearSwapState();
    };
  }, [clearSwapState]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numbers and a single decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setFromAmount(value);
    }
  };

  // Debounced quote fetching
  const debouncedGetMockQuote = useCallback(
    debounce(() => {
      if (parseFloat(fromAmount) > 0 && fromToken && toToken) {
        getMockQuote();
      }
    }, 500), // 500ms debounce
    [fromAmount, fromToken, toToken, getMockQuote] // Dependencies for useCallback
  );

  useEffect(() => {
    if (fromAmount && fromToken && toToken) {
      debouncedGetMockQuote();
    } else {
      // Clear quote if amount is cleared or tokens are missing
      useSwapStore.setState({ currentQuote: null, toAmount: '' });
    }
    return () => debouncedGetMockQuote.cancel?.(); // Cleanup debounce on unmount or change
  }, [fromAmount, fromToken, toToken, debouncedGetMockQuote]);


  const handleFromTokenSelect = (token: TokenInfo) => {
    if (toToken?.address === token.address) { // If selected token is same as 'toToken', swap them
      setToToken(fromToken);
    }
    setFromToken(token);
  };

  const handleToTokenSelect = (token: TokenInfo) => {
     if (fromToken?.address === token.address) { // If selected token is same as 'fromToken', swap them
      setFromToken(toToken);
    }
    setToToken(token);
  };

  const handleSwapTokens = () => {
    const tempToken = fromToken;
    setFromToken(toToken);
    setToToken(tempToken);
    // Amounts could also be swapped or cleared, depending on desired UX
    // For now, let's clear fromAmount, which will trigger a new quote if toAmount was based on it
    setFromAmount(toAmount); // Or setFromAmount(toAmount) if we want to preserve value
  };

  const canSwap = currentQuote && !isLoadingQuote && isWalletConnected && parseFloat(fromAmount) > 0;

  return (
    <Container maxWidth="sm" sx={{ my: 4 }}>
      <Paper elevation={3} sx={{ p: {xs: 2, sm: 3} }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <Typography variant="h5" component="h1">Swap Tokens</Typography>
          <Tooltip title="Settings (Slippage, etc.) - Placeholder">
            <IconButton onClick={() => alert('Slippage settings placeholder')}>
              <SettingsIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {/* From Token Section */}
        <Paper variant="outlined" sx={{ p: 2, mb: 1 }}>
          <Typography variant="caption" color="text.secondary">You Send</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TextField
              type="text" // Use text to allow decimal points easily controlled by regex
              variant="outlined"
              placeholder="0.0"
              value={fromAmount}
              onChange={handleAmountChange}
              fullWidth
              sx={{ mr: 1, '& input': { fontSize: '1.5rem', fontWeight: 'medium' } }}
              inputProps={{ pattern: "^\\d*\\.?\\d*$" }}
            />
            <Button
              variant="outlined"
              onClick={() => setIsFromModalOpen(true)}
              sx={{minWidth: 120, height: 56, textTransform: 'none'}}
              startIcon={fromToken?.logoURI ? <Avatar src={fromToken.logoURI} sx={{width:24, height:24}}/> : null}
            >
              {fromToken ? fromToken.symbol : 'Select Token'}
            </Button>
          </Box>
          {/* Mock Balance - Placeholder */}
          {fromToken && <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt:0.5}}>Balance: 10.5 {fromToken.symbol} (Mock)</Typography>}
        </Paper>

        {/* Swap Button */}
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 1.5 }}>
          <IconButton onClick={handleSwapTokens} color="primary" disabled={!fromToken || !toToken}>
            <SwapVertIcon sx={{fontSize: '2rem'}}/>
          </IconButton>
        </Box>

        {/* To Token Section */}
        <Paper variant="outlined" sx={{ p: 2, mb: 2.5 }}>
          <Typography variant="caption" color="text.secondary">You Receive (Estimated)</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
            <TextField
              type="text"
              variant="outlined"
              placeholder="0.0"
              value={isLoadingQuote ? "..." : (toAmount || '')}
              disabled // Output amount is not directly editable
              fullWidth
              sx={{ mr: 1, '& input': { fontSize: '1.5rem', fontWeight: 'medium' } }}
            />
            <Button
              variant="outlined"
              onClick={() => setIsToModalOpen(true)}
              sx={{minWidth: 120, height: 56, textTransform: 'none'}}
              startIcon={toToken?.logoURI ? <Avatar src={toToken.logoURI} sx={{width:24, height:24}}/> : null}
            >
              {toToken ? toToken.symbol : 'Select Token'}
            </Button>
          </Box>
           {/* Mock Balance - Placeholder */}
          {toToken && <Typography variant="caption" color="text.secondary" sx={{display: 'block', mt:0.5}}>Balance: 500.0 {toToken.symbol} (Mock)</Typography>}
        </Paper>

        {/* Quote Details */}
        {currentQuote && !isLoadingQuote && (
          <Paper variant="outlined" sx={{ p: 1.5, mb: 2.5, fontSize: '0.9rem' }}>
            <Typography variant="subtitle2" sx={{mb:0.5}}>Quote Details:</Typography>
            <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2" color="text.secondary">Rate:</Typography>
                <Typography variant="body2">
                    1 {fromToken?.symbol} ≈ {(+ethers.formatUnits(currentQuote.toAmount, currentQuote.toToken.decimals) / +ethers.formatUnits(currentQuote.fromAmount, currentQuote.fromToken.decimals)).toFixed(6)} {toToken?.symbol}
                </Typography>
            </Box>
            <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2" color="text.secondary">Price Impact:</Typography>
                <Chip label={currentQuote.priceImpact || 'N/A'} size="small" variant="outlined" />
            </Box>
             <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2" color="text.secondary">Est. Gas Fee:</Typography>
                <Typography variant="body2">{currentQuote.estimatedGasUSD || 'N/A'}</Typography>
            </Box>
             <Box sx={{display:'flex', justifyContent: 'space-between'}}>
                <Typography variant="body2" color="text.secondary">Slippage:</Typography>
                <Typography variant="body2">{slippage}</Typography>
            </Box>
          </Paper>
        )}
        {isLoadingQuote && (!currentQuote || fromAmount) && ( // Show loader only if actively fetching for current input
            <Box sx={{display: 'flex', justifyContent: 'center', my:2}}><CircularProgress size={30}/></Box>
        )}


        {/* Action Button */}
        {!isWalletConnected ? (
            <Alert severity="warning">Please connect your wallet to perform a swap.</Alert>
        ) : (
            <Button
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            onClick={openConfirmModal}
            disabled={!canSwap}
            >
            {isLoadingQuote ? 'Fetching Quote...' : (currentQuote ? 'Swap' : 'Get Quote')}
            </Button>
        )}
      </Paper>

      <TokenSelectionModal
        open={isFromModalOpen}
        onClose={() => setIsFromModalOpen(false)}
        onSelectToken={handleFromTokenSelect}
        title="Select 'Send' Token"
        excludeTokenSymbol={toToken?.symbol}
      />
      <TokenSelectionModal
        open={isToModalOpen}
        onClose={() => setIsToModalOpen(false)}
        onSelectToken={handleToTokenSelect}
        title="Select 'Receive' Token"
        excludeTokenSymbol={fromToken?.symbol}
      />
      <SwapConfirmationModal />
      {/* Comments for future integration:
        - DEX Aggregator API: For fetching real quotes (e.g., 1inch, 0x API, Paraswap).
          This involves API calls with fromToken, toToken, fromAmount, userAddress.
        - Token Allowances: Before swapping, check if the DEX router contract has allowance
          to spend fromToken. If not, prompt user for `approve` transaction.
        - Transaction Building: The aggregator API usually provides the transaction data
          (to, data, value) to be signed and sent by the user's wallet.
        - Wallet Interaction: Use `walletStore.signer` to send `approve` and swap transactions.
        - Balance Fetching: Fetch real token balances for connected address using `walletStore.provider`.
      */}
    </Container>
  );
};

// Simple debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout);
      timeout = null;
    }
    timeout = setTimeout(() => func(...args), waitFor);
  };

  debounced.cancel = () => { // Add a cancel method
      if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
      }
  };

  return debounced as F & { cancel?: () => void };
}


export default SwapTokensPage;
