import React from 'react';
import { useSwapStore } from '../../store/swapStore';
import { SwapQuote, TokenInfo } from '../../types/swap';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, Paper, Grid, Avatar } from '@mui/material';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { ethers } from 'ethers'; // For formatting units

interface SwapConfirmationModalProps {
  // open and onClose will be handled by swapStore.isConfirmModalOpen
}

const DetailRow: React.FC<{ label: string; value: string | React.ReactNode; highlighted?: boolean }> = ({ label, value, highlighted }) => (
  <Grid container justifyContent="space-between" sx={{ mb: 0.5 }}>
    <Grid item>
      <Typography variant="body2" color="text.secondary">{label}:</Typography>
    </Grid>
    <Grid item>
      <Typography variant="body2" sx={{ fontWeight: highlighted ? 'medium' : 'normal', textAlign: 'right' }}>{value}</Typography>
    </Grid>
  </Grid>
);

const TokenDisplay: React.FC<{token: TokenInfo, amount: string}> = ({token, amount}) => (
     <Box sx={{display: 'flex', alignItems: 'center', p:1.5, borderRadius: 1, border: '1px solid #eee', width: '100%'}}>
        <Avatar src={token.logoURI} alt={token.symbol} sx={{ width: 32, height: 32, mr: 1.5 }}/>
        <Box>
            <Typography variant="h6" component="div">{ethers.formatUnits(amount, token.decimals)}</Typography>
            <Typography variant="body2" color="text.secondary">{token.symbol}</Typography>
        </Box>
    </Box>
);


const SwapConfirmationModal: React.FC<SwapConfirmationModalProps> = () => {
  const {
    currentQuote,
    isConfirmModalOpen,
    closeConfirmModal,
    executeSwap,
    isLoadingQuote // Re-used for "isSwapping" state
  } = useSwapStore();

  if (!currentQuote || !isConfirmModalOpen) {
    return null;
  }

  const { fromToken, toToken, fromAmount, toAmount, priceImpact, estimatedGasUSD, route } = currentQuote;

  const handleConfirmSwap = async () => {
    // Actual swap logic (allowance check, signing, sending) would happen here.
    // For now, it's a placeholder in the store.
    await executeSwap();
    // closeConfirmModal(); // executeSwap now handles closing modal on success/completion
  };

  return (
    <Dialog open={isConfirmModalOpen} onClose={isLoadingQuote ? undefined : closeConfirmModal} maxWidth="xs" fullWidth>
      <DialogTitle sx={{textAlign: 'center', fontWeight: 'medium'}}>Confirm Swap</DialogTitle>
      <DialogContent>
        <Grid container direction="column" alignItems="center" spacing={1.5}>
            <Grid item width="100%">
                <TokenDisplay token={fromToken} amount={fromAmount} />
            </Grid>
            <Grid item>
                <ArrowDownwardIcon color="action" sx={{fontSize: '1.5rem'}}/>
            </Grid>
             <Grid item width="100%">
                <TokenDisplay token={toToken} amount={toAmount} />
            </Grid>
        </Grid>

        <Paper variant="outlined" sx={{ p: 2, mt: 2.5, mb:1 }}>
          <Typography variant="subtitle2" gutterBottom sx={{mb:1.5}}>Swap Details:</Typography>
          <DetailRow label="Rate" value={`1 ${fromToken.symbol} ≈ ${(+ethers.formatUnits(toAmount, toToken.decimals) / +ethers.formatUnits(fromAmount, fromToken.decimals)).toFixed(6)} ${toToken.symbol}`} />
          {priceImpact && <DetailRow label="Price Impact" value={priceImpact} highlighted={parseFloat(priceImpact) > 1} />}
          {estimatedGasUSD && <DetailRow label="Est. Gas Fee" value={estimatedGasUSD} />}
          {route && <DetailRow label="Route" value={route} />}
          {/* Add slippage if configured */}
        </Paper>

         <Typography variant="caption" color="text.secondary" display="block" textAlign="center" sx={{mt:1.5}}>
            Output is estimated. You will receive at least X or the transaction will revert. (Placeholder for min received)
        </Typography>

      </DialogContent>
      <DialogActions sx={{ p: '16px 24px', flexDirection: 'column', gap:1 }}>
        <Button
          onClick={handleConfirmSwap}
          variant="contained"
          color="primary"
          fullWidth
          disabled={isLoadingQuote} // Disable if swapping
          startIcon={isLoadingQuote ? <CircularProgress size={20} color="inherit"/> : null}
        >
          {isLoadingQuote ? 'Processing Swap...' : 'Confirm Swap'}
        </Button>
        {!isLoadingQuote && <Button onClick={closeConfirmModal} fullWidth>Cancel</Button>}
      </DialogActions>
    </Dialog>
  );
};

export default SwapConfirmationModal;
