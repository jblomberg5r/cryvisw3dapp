import React, { useEffect, useState, useMemo } from 'react';
import { useMarketplaceStore } from '../store/marketplaceStore';
import { MarketplaceTemplate, MarketplaceCategory, MarketplaceCategories } from '../types/marketplace';
import TemplateCard from '../components/marketplace/TemplateCard';
import TemplateDetailView from '../components/marketplace/TemplateDetailView';
import {
  Container, Typography, Grid, CircularProgress, Box,
  TextField, InputAdornment, Tabs, Tab, Paper, Alert
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const MarketplacePage: React.FC = () => {
  const {
    templates,
    isLoading,
    selectedTemplate,
    fetchTemplates,
    selectTemplate
  } = useMarketplaceStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MarketplaceCategory>('All');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleCategoryChange = (event: React.SyntheticEvent, newValue: MarketplaceCategory) => {
    setSelectedCategory(newValue);
    selectTemplate(null); // Clear selected template when category changes
  };

  const filteredTemplates = useMemo(() => {
    return templates.filter(template => {
      const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
      const matchesSearch =
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (template.tags && template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
      return matchesCategory && matchesSearch;
    });
  }, [templates, searchTerm, selectedCategory]);

  if (isLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading Templates...</Typography>
      </Container>
    );
  }

  if (!isLoading && templates.length === 0) {
     return (
      <Container sx={{ textAlign: 'center', mt: 5 }}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
        <Typography variant="h5" gutterBottom sx={{mt:2}}>
          No Templates Available
        </Typography>
        <Typography color="text.secondary">
          Could not load any templates from the marketplace at this moment. Please try again later.
        </Typography>
      </Container>
    );
  }


  return (
    <Container maxWidth="xl" sx={{ my: 4 }}>
      {!selectedTemplate ? (
        <>
          <Typography variant="h3" component="h1" gutterBottom align="center" sx={{mb: 1}}>
            Contract Template Marketplace
          </Typography>
          <Typography variant="subtitle1" align="center" color="text.secondary" sx={{mb: 4}}>
            Discover and use pre-built smart contract templates for your projects.
          </Typography>

          <Paper elevation={1} sx={{ p:2, mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: {xs: 'wrap', md: 'nowrap'} }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search templates by name, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{flexGrow: 1, minWidth: {xs: '100%', md: 300}}}
            />
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              aria-label="Marketplace Categories"
              sx={{
                borderBottom: 1, borderColor: 'divider',
                minWidth: {xs: '100%', md: 'auto'} // Ensure tabs take full width on small screens if they wrap
              }}
            >
              {MarketplaceCategories.map((cat) => (
                <Tab key={cat} label={cat} value={cat} />
              ))}
            </Tabs>
          </Paper>

          {filteredTemplates.length > 0 ? (
            <Grid container spacing={3}>
              {filteredTemplates.map((template) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={template.id}>
                  <TemplateCard template={template} onViewDetails={selectTemplate} />
                </Grid>
              ))}
            </Grid>
          ) : (
             <Box sx={{ textAlign: 'center', mt: 5, p:3 }}>
                <SearchIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
                <Typography variant="h5" gutterBottom sx={{mt:2}}>
                  No Templates Found
                </Typography>
                <Typography color="text.secondary">
                  Try adjusting your search term or selected category.
                </Typography>
            </Box>
          )}
        </>
      ) : (
        <TemplateDetailView />
      )}
    </Container>
  );
};

export default MarketplacePage;
