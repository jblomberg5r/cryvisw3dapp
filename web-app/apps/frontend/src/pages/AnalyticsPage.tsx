import React from 'react';
import { Container, Typography, Grid, Paper, Box, Divider, Chip } from '@mui/material';
import ActivityFeedDisplay from '../components/activity/ActivityFeedDisplay';
import { useProjectStore } from '../store/projectStore';
import { useDeploymentStore } from '../store/deploymentStore';
import { useMarketplaceStore } from '../store/marketplaceStore'; // For template stats
import { useTokenCreatorStore } from '../store/tokenCreatorStore'; // For token creation stats
import BarChartIcon from '@mui/icons-material/BarChart';
import FolderCopyIcon from '@mui/icons-material/FolderCopy';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import StorefrontIcon from '@mui/icons-material/Storefront';
import TokenIcon from '@mui/icons-material/Token'; // Placeholder for token creation

const AnalyticsPage: React.FC = () => {
  const { projects } = useProjectStore();
  const { currentDeployments } = useDeploymentStore();
  const { templates: marketplaceTemplates } = useMarketplaceStore(); // Assuming templates are loaded
  const { selectedStandard: tokenStandardUsedInCreator } = useTokenCreatorStore(); // Example stat

  const successfulDeployments = currentDeployments.filter(d => d.status === 'confirmed').length;
  const failedDeployments = currentDeployments.filter(d => d.status === 'failed').length;

  return (
    <Container maxWidth="lg" sx={{ my: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom align="center" sx={{mb: 4}}>
        <BarChartIcon sx={{fontSize: '2.5rem', verticalAlign: 'bottom', mr: 1}}/>
        Analytics & Activity Dashboard
      </Typography>

      {/* Statistics Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <FolderCopyIcon color="primary" sx={{ fontSize: 36, mb: 1 }}/>
            <Typography variant="h6">{projects.length}</Typography>
            <Typography color="text.secondary">Total Projects</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <RocketLaunchIcon color="secondary" sx={{ fontSize: 36, mb: 1 }}/>
            <Typography variant="h6">{currentDeployments.length}</Typography>
            <Typography color="text.secondary">Deployments Tracked</Typography>
            {currentDeployments.length > 0 && (
                <Typography variant="caption">
                    {successfulDeployments} Succeeded, {failedDeployments} Failed
                </Typography>
            )}
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <StorefrontIcon sx={{ fontSize: 36, mb: 1, color: 'success.main' }}/>
            <Typography variant="h6">{marketplaceTemplates.length}</Typography>
            <Typography color="text.secondary">Marketplace Templates</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
            <TokenIcon sx={{ fontSize: 36, mb: 1, color: 'warning.main' }}/>
            <Typography variant="h6">{tokenStandardUsedInCreator ? 1 : 0}</Typography>
            <Typography color="text.secondary">Token Currently in Creator</Typography>
             {tokenStandardUsedInCreator && (
                <Typography variant="caption">
                    Standard: {tokenStandardUsedInCreator}
                </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Divider sx={{my:3}}><Chip label="Recent Activity"/></Divider>

      {/* Activity Feed Section */}
      <ActivityFeedDisplay />

      {/* Notes Section */}
      <Paper elevation={0} sx={{ p: 3, mt: 4, backgroundColor: 'action.hover' }}>
        <Typography variant="h6" gutterBottom>Notes on Advanced Monitoring</Typography>
        <Typography variant="body2" color="text.secondary">
          The statistics and activity feed presented here are based on application-level actions and mock data for blockchain interactions (like deployments and tests). For detailed on-chain analytics, real-time transaction monitoring, precise gas usage, contract interaction logs, and user behavior analysis, integration with backend services, blockchain indexers (e.g., The Graph, Dune Analytics), and dedicated analytics platforms would be necessary.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{mt:1}}>
          These tools can provide deeper insights into smart contract usage, user engagement, and overall dApp performance once your contracts are live on a network.
        </Typography>
      </Paper>
    </Container>
  );
};

export default AnalyticsPage;
