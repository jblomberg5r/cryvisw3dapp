import React, { useState } from 'react'; // Added useState
import { useMarketplaceStore } from '../../store/marketplaceStore';
import { MarketplaceTemplate } from '../../types/marketplace';
import { Box, Typography, Button, Paper, Chip, Grid, IconButton, Tooltip, useTheme, Alert } from '@mui/material';
import CodeEditor from '../editor/CodeEditor';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GetAppIcon from '@mui/icons-material/GetApp';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import UseTemplateDialog from './UseTemplateDialog'; // Import the dialog

interface TemplateDetailViewProps {
  // Props if any, currently uses store directly
}

const TemplateDetailView: React.FC<TemplateDetailViewProps> = () => {
  const { selectedTemplate, selectTemplate } = useMarketplaceStore();
  const theme = useTheme();
  const [isUseTemplateDialogOpen, setIsUseTemplateDialogOpen] = useState(false);

  if (!selectedTemplate) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">Select a template to view its details.</Typography>
      </Paper>
    );
  }

  const handleOpenUseTemplateDialog = () => {
    setIsUseTemplateDialogOpen(true);
  };

  const handleCloseUseTemplateDialog = () => {
    setIsUseTemplateDialogOpen(false);
  };

  return (
    <>
      <Paper elevation={0} sx={{ p: {xs: 1, sm:2, md: 3}, overflowY: 'auto', height: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Tooltip title="Back to Marketplace List">
            <IconButton onClick={() => selectTemplate(null)} sx={{ mr: 1 }}>
              <ArrowBackIcon />
            </IconButton>
          </Tooltip>
          <Typography variant="h4" component="h1" sx={{flexGrow: 1}}>
            {selectedTemplate.name}
          </Typography>
          <Button
              variant="contained"
              startIcon={<GetAppIcon />}
              onClick={handleOpenUseTemplateDialog}
          >
            Use This Template
          </Button>
        </Box>

        <Grid container spacing={3}>
        <Grid item xs={12} md={7}> {/* Left side: Code & Readme */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>Contract Code</Typography>
            <Alert severity="info" sx={{fontSize: '0.8rem', mb: 1}}>
                This is the full Solidity source code for the template. Review carefully before use.
            </Alert>
            <Box sx={{ height: '400px', border: `1px solid ${theme.palette.divider}` }}>
              <CodeEditor
                value={selectedTemplate.fullContractCode}
                onChange={() => {}} // Read-only view
                mode="solidity"
                theme={theme.palette.mode === 'dark' ? 'tomorrow_night' : 'github'}
                readOnly={true}
                height="400px"
              />
            </Box>
          </Box>

          {selectedTemplate.readme && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>README</Typography>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: '400px', overflowY: 'auto',
                '& table': {borderCollapse: 'collapse', width: '100%'},
                '& th, & td': {border: `1px solid ${theme.palette.divider}`, p:1, textAlign: 'left'},
                '& th': {backgroundColor: theme.palette.action.hover}
              }}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{selectedTemplate.readme}</ReactMarkdown>
              </Paper>
            </Box>
          )}
        </Grid>

        <Grid item xs={12} md={5}> {/* Right side: Metadata */}
          <Typography variant="h6" gutterBottom>Details</Typography>
          <Chip label={selectedTemplate.category} color="primary" sx={{ mb: 1 }} />
          <Typography variant="body1" paragraph>
            {selectedTemplate.description}
          </Typography>
          {selectedTemplate.author && (
            <Typography variant="subtitle2" color="text.secondary">
              Author: {selectedTemplate.author}
            </Typography>
          )}
          {selectedTemplate.version && (
            <Typography variant="subtitle2" color="text.secondary">
              Version: {selectedTemplate.version}
            </Typography>
          )}
           {selectedTemplate.rating !== undefined && (
             <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{mr:0.5}}>Rating:</Typography>
                <Rating value={selectedTemplate.rating} precision={0.5} readOnly />
                <Typography variant="body2" color="text.secondary" sx={{ml:0.5}}>({selectedTemplate.rating.toFixed(1)})</Typography>
             </Box>
          )}
           {selectedTemplate.usageCount !== undefined && (
            <Typography variant="subtitle2" color="text.secondary">
              Usage Count: {selectedTemplate.usageCount}
            </Typography>
          )}

          {selectedTemplate.tags && selectedTemplate.tags.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selectedTemplate.tags.map((tag) => (
                  <Chip key={tag} label={tag} size="small" />
                ))}
              </Box>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
    <UseTemplateDialog
        open={isUseTemplateDialogOpen}
        onClose={handleCloseUseTemplateDialog}
        template={selectedTemplate}
    />
    </>
  );
};

export default TemplateDetailView;
