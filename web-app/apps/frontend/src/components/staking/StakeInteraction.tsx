import React, { useState, useEffect } from 'react';
import { useStakingStore } from '../../store/stakingStore';
import { StakingPoolInfo, UserStakedPosition } from '../../types/staking';
import { Box, Typography, TextField, Button, Grid, Paper, CircularProgress, Chip, Alert, Divider } from '@mui/material';
import { ethers } from 'ethers';
import { useWalletStore } from '../../store/walletStore'; // To check connection and get balance (future)
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

interface StakeInteractionProps {
  pool: StakingPoolInfo;
}

const StakeInteraction: React.FC<StakeInteractionProps> = ({ pool }) => {
  const {
    userPositions,
    stake,
    unstake,
    claimRewards,
    isLoading,
    _simulateRewardAccrual // Call this after staking
  } = useStakingStore();
  const { isConnected: isWalletConnected, address: userAddress } = useWalletStore(); // For balance and actions

  const [amount, setAmount] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const userPosition = userPositions[pool.id] || {
    poolId: pool.id,
    stakedAmount: ethers.parseUnits('0', pool.asset.decimals).toString(),
    pendingRewards: ethers.parseUnits('0', pool.rewardToken.decimals).toString(),
  };

  // Mock user's balance of the staking asset
  // In a real app, fetch this using walletStore.provider and userAddress
  const [mockAssetBalance, setMockAssetBalance] = useState(ethers.parseUnits('1000', pool.asset.decimals).toString());


  useEffect(() => {
    // Start reward simulation if user has a stake
    if (BigInt(userPosition.stakedAmount) > BigInt(0)) {
      _simulateRewardAccrual(pool.id);
    }
  }, [userPosition.stakedAmount, pool.id, _simulateRewardAccrual]);


  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      setActionError(null); // Clear error on new input
    }
  };

  const handleStake = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      setActionError(`Please enter a valid amount to stake.`);
      return;
    }
    if (BigInt(ethers.parseUnits(amount, pool.asset.decimals)) > BigInt(mockAssetBalance)) {
        setActionError(`Insufficient ${pool.asset.symbol} balance.`);
        return;
    }
    setActionError(null);
    try {
      await stake(pool.id, amount);
      setAmount(''); // Clear input after successful action
    } catch (e: any) {
      setActionError(e.message || "Staking failed.");
    }
  };

  const handleUnstake = async () => {
     if (!amount || parseFloat(amount) <= 0) {
      setActionError(`Please enter a valid amount to unstake.`);
      return;
    }
    if (BigInt(ethers.parseUnits(amount, pool.asset.decimals)) > BigInt(userPosition.stakedAmount)) {
        setActionError(`Cannot unstake more than currently staked.`);
        return;
    }
    setActionError(null);
    try {
      await unstake(pool.id, amount);
      setAmount('');
    } catch (e: any) {
      setActionError(e.message || "Unstaking failed.");
    }
  };

  const handleClaim = async () => {
    setActionError(null);
    try {
      await claimRewards(pool.id);
    } catch (e: any) {
      setActionError(e.message || "Claiming rewards failed.");
    }
  };

  const canClaim = BigInt(userPosition.pendingRewards) > BigInt(0);

  return (
    <Paper elevation={3} sx={{ p: {xs:2, sm:3}, mt: 2 }}>
      <Typography variant="h5" gutterBottom sx={{textAlign: 'center', mb:2}}>{pool.name}</Typography>
      <Grid container spacing={2} justifyContent="space-around" sx={{mb:2}}>
        <Grid item xs={12} sm={5} textAlign="center">
          <Typography variant="body2" color="text.secondary">Your Staked {pool.asset.symbol}</Typography>
          <Typography variant="h6" sx={{fontWeight:'bold'}}>
            {ethers.formatUnits(userPosition.stakedAmount, pool.asset.decimals)}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={5} textAlign="center">
          <Typography variant="body2" color="text.secondary">Pending {pool.rewardToken.symbol} Rewards</Typography>
           <Typography variant="h6" sx={{fontWeight:'bold', color: canClaim ? 'success.main' : 'text.primary'}}>
            {ethers.formatUnits(userPosition.pendingRewards, pool.rewardToken.decimals)}
          </Typography>
        </Grid>
      </Grid>

      <Divider sx={{my:2}}><Chip label="Actions"/></Divider>

      {!isWalletConnected && (
        <Alert severity="warning" sx={{ mb: 2 }}>Please connect your wallet to stake, unstake, or claim rewards.</Alert>
      )}

      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TextField
          label={`Amount in ${pool.asset.symbol}`}
          variant="outlined"
          value={amount}
          onChange={handleAmountChange}
          type="text" // Use text to allow decimal points easily controlled by regex
          inputProps={{ pattern: "^\\d*\\.?\\d*$" }}
          fullWidth
          disabled={isLoading || !isWalletConnected}
          sx={{ mr: 1 }}
        />
         <Box sx={{display: 'flex', flexDirection:'column', alignItems:'flex-end', minWidth: '120px'}}>
            <Typography variant="caption" color="text.secondary">
                Balance:
            </Typography>
            <Typography variant="body2" sx={{fontWeight:'medium'}}>
                {ethers.formatUnits(mockAssetBalance, pool.asset.decimals)} {pool.asset.symbol}
            </Typography>
        </Box>
      </Box>

      {actionError && <Alert severity="error" sx={{mb:2}}>{actionError}</Alert>}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            onClick={handleStake}
            disabled={isLoading || !isWalletConnected || !amount || parseFloat(amount) <= 0}
            fullWidth
            startIcon={isLoading ? <CircularProgress size={16} color="inherit"/> : null}
          >
            Stake
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            onClick={handleUnstake}
            disabled={isLoading || !isWalletConnected || !amount || parseFloat(amount) <= 0 || BigInt(userPosition.stakedAmount) === BigInt(0)}
            fullWidth
             startIcon={isLoading ? <CircularProgress size={16} color="inherit"/> : null}
          >
            Unstake
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClaim}
            disabled={isLoading || !isWalletConnected || !canClaim}
            fullWidth
            startIcon={isLoading ? <CircularProgress size={16} color="inherit"/> : null}
          >
            Claim Rewards
          </Button>
        </Grid>
      </Grid>
      <Typography variant="caption" display="block" sx={{mt:2, textAlign:'center', fontStyle:'italic', color:'text.secondary'}}>
        Staking and unstaking actions are placeholders. Real interactions require token approvals and contract calls.
        Reward accrual is simulated.
      </Typography>
    </Paper>
  );
};

export default StakeInteraction;
