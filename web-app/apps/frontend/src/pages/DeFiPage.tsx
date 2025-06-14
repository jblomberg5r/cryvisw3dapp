import React from 'react';
import { Container, Typography, Grid, Paper, Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance'; // For Staking
import GrainIcon from '@mui/icons-material/Grain'; // Generic DeFi icon

interface DeFiFeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  path: string;
  disabled?: boolean;
}

const FeatureCard: React.FC<DeFiFeatureCardProps> = ({ title, description, icon, path, disabled }) => {
  const navigate = useNavigate();
  return (
    <Paper
      elevation={3}
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        '&:hover': {
            transform: disabled ? 'none' : 'translateY(-4px)',
            boxShadow: disabled ? 3 : 7,
        }
      }}
    >
      <Box sx={{ fontSize: 48, color: disabled ? 'action.disabled' : 'primary.main', mb: 2 }}>{icon}</Box>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center" sx={{ flexGrow: 1, mb: 2 }}>
        {description}
      </Typography>
      <Button
        variant="contained"
        onClick={() => navigate(path)}
        disabled={disabled}
      >
        {disabled ? "Coming Soon" : "Go to " + title}
      </Button>
    </Paper>
  );
};

const DeFiPage: React.FC = () => {
  const features: DeFiFeatureCardProps[] = [
    {
      title: 'Purchase Crypto',
      description: 'Buy cryptocurrencies using fiat currency through our trusted third-party on-ramp providers.',
      icon: <MonetizationOnIcon sx={{ fontSize: 'inherit' }}/>,
      path: '/defi/purchase',
    },
    {
      title: 'Swap Tokens',
      description: 'Exchange one cryptocurrency for another using decentralized exchange aggregators or direct pool interactions.',
      icon: <SwapHorizIcon sx={{ fontSize: 'inherit' }}/>,
      path: '/defi/swap',
      disabled: false, // Enable this feature
    },
    {
      title: 'Staking',
      description: 'Stake your tokens in various protocols to earn rewards and participate in network governance.',
      icon: <AccountBalanceIcon sx={{ fontSize: 'inherit' }}/>,
      path: '/defi/staking',
      disabled: false, // Enable this feature
    },
     {
      title: 'Yield Farming',
      description: 'Discover and participate in yield farming opportunities across different DeFi protocols to maximize your returns.',
      icon: <GrainIcon sx={{ fontSize: 'inherit' }}/>,
      path: '/defi/yield', // Placeholder path
      disabled: true,
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{mb: 1}}>
        DeFi Hub
      </Typography>
      <Typography variant="subtitle1" align="center" color="text.secondary" sx={{mb: 5}}>
        Access various decentralized finance tools and services.
      </Typography>
      <Grid container spacing={4}>
        {features.map((feature) => (
          <Grid item xs={12} sm={6} md={6} key={feature.title}> {/* Adjusted md to 6 for 2 cards per row on medium screens */}
            <FeatureCard {...feature} />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default DeFiPage;
