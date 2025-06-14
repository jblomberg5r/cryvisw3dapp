import React, { useEffect } from 'react';
import { useStakingStore } from '../store/stakingStore';
import { StakingPoolInfo } from '../types/staking';
import StakeInteraction from '../components/staking/StakeInteraction';
import {
  Container, Typography, Grid, Paper, Button, Box, CircularProgress, Card, CardContent, CardActions, Chip, Alert
} from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // Staking icon
import GrainIcon from '@mui/icons-material/Grain'; // Rewards icon
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn'; // Asset icon
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';


const PoolCard: React.FC<{ pool: StakingPoolInfo, onSelectPool: (poolId: string) => void, isSelected: boolean }> =
  ({ pool, onSelectPool, isSelected }) => (
  <Card
    elevation={isSelected ? 6 : 2}
    sx={{
        height: '100%', display: 'flex', flexDirection: 'column',
        border: isSelected ? '2px solid' : '1px solid',
        borderColor: isSelected ? 'primary.main' : 'divider',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 5,
        }
    }}
  >
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography variant="h6" component="h2" gutterBottom sx={{display:'flex', alignItems:'center'}}>
        <MonetizationOnIcon sx={{mr:1, color: 'primary.dark'}}/> {pool.name}
      </Typography>
      <Chip label={`${pool.asset.symbol} Pool`} size="small" variant="outlined" sx={{mb:1}}/>
      <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
        Stake: {pool.asset.symbol}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{mb: 0.5}}>
        Earn: {pool.rewardToken.symbol}
      </Typography>
      <Typography variant="body1" sx={{fontWeight: 'medium', my:1, color: 'success.dark'}}>
        APR: {pool.apr || 'Variable'}
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block">
        TVL: {pool.tvl || 'N/A'}
      </Typography>
       {pool.lockupPeriod && <Typography variant="caption" color="text.secondary" display="block">Lockup: {pool.lockupPeriod}</Typography>}
       {pool.earlyUnstakeFee && <Typography variant="caption" color="text.secondary" display="block">Early Unstake Fee: {pool.earlyUnstakeFee}</Typography>}
    </CardContent>
    <CardActions sx={{ justifyContent: 'center', borderTop: '1px solid #eee', p:1.5 }}>
      <Button
        size="small"
        variant={isSelected ? "contained" : "outlined"}
        onClick={() => onSelectPool(pool.id)}
      >
        {isSelected ? "Selected" : "Select Pool"}
      </Button>
    </CardActions>
  </Card>
);


const StakingPage: React.FC = () => {
  const {
    stakingPools,
    isLoading: isLoadingPools,
    selectedPoolId,
    fetchPools,
    selectPool
  } = useStakingStore();

  useEffect(() => {
    if (stakingPools.length === 0) {
      fetchPools();
    }
  }, [fetchPools, stakingPools.length]);

  const selectedPool = stakingPools.find(p => p.id === selectedPoolId);

  if (isLoadingPools && stakingPools.length === 0) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Staking Pools...</Typography>
      </Container>
    );
  }

  if (!isLoadingPools && stakingPools.length === 0) {
     return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h5" gutterBottom sx={{mt:2}}>
          No Staking Pools Available
        </Typography>
        <Typography color="text.secondary">
          There are currently no staking opportunities. Please check back later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{mb:1}}>
        <AccountBalanceIcon sx={{fontSize: '2.8rem', verticalAlign: 'bottom', mr:1}}/>
        Staking Dashboard
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{mb: 4}}>
        Stake your tokens to earn rewards. Choose a pool below to get started.
      </Typography>

      <Typography variant="h5" component="h2" gutterBottom sx={{mt:3, mb:2}}>Available Pools</Typography>
      <Grid container spacing={3}>
        {stakingPools.map((pool) => (
          <Grid item xs={12} sm={6} md={4} key={pool.id}>
            <PoolCard pool={pool} onSelectPool={selectPool} isSelected={selectedPoolId === pool.id} />
          </Grid>
        ))}
      </Grid>

      {selectedPool && (
        <Box sx={{ mt: 5 }}>
          <StakeInteraction pool={selectedPool} />
        </Box>
      )}
       {!selectedPool && stakingPools.length > 0 && (
         <Alert severity="info" sx={{mt:4, textAlign:'center'}}>Select a pool from the list above to see details and interact.</Alert>
       )}
    </Container>
  );
};

export default StakingPage;
